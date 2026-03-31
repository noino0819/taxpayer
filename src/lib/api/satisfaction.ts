import { supabase } from '@/lib/supabase'
import type { SatisfactionSurvey, SatisfactionResponse, SatisfactionInputMode } from '@/types/database'

export async function getSurveys(classroomId: string): Promise<SatisfactionSurvey[]> {
  const { data, error } = await supabase
    .from('satisfaction_surveys')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as SatisfactionSurvey[]
}

export async function getActiveSurveys(classroomId: string): Promise<SatisfactionSurvey[]> {
  const { data, error } = await supabase
    .from('satisfaction_surveys')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as SatisfactionSurvey[]
}

export async function createSurvey(
  classroomId: string,
  survey: { title: string; description: string; factor_type: string; input_mode: SatisfactionInputMode; auto_apply: boolean },
): Promise<SatisfactionSurvey> {
  const { data, error } = await supabase
    .from('satisfaction_surveys')
    .insert({
      classroom_id: classroomId,
      title: survey.title,
      description: survey.description,
      factor_type: survey.factor_type,
      input_mode: survey.input_mode,
      auto_apply: survey.auto_apply,
    })
    .select()
    .single()
  if (error) throw error
  return data as SatisfactionSurvey
}

export async function submitResponse(surveyId: string, userId: string, rating: number): Promise<SatisfactionResponse> {
  const { data: existing } = await supabase
    .from('satisfaction_responses')
    .select('id')
    .eq('survey_id', surveyId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) {
    const { data, error } = await supabase
      .from('satisfaction_responses')
      .update({ rating })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as SatisfactionResponse
  }

  const { data, error } = await supabase
    .from('satisfaction_responses')
    .insert({ survey_id: surveyId, user_id: userId, rating })
    .select()
    .single()
  if (error) throw error
  return data as SatisfactionResponse
}

export async function getMyResponse(surveyId: string, userId: string): Promise<SatisfactionResponse | null> {
  const { data, error } = await supabase
    .from('satisfaction_responses')
    .select('*')
    .eq('survey_id', surveyId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as SatisfactionResponse | null
}

export async function getMyResponses(surveyIds: string[], userId: string): Promise<SatisfactionResponse[]> {
  if (surveyIds.length === 0) return []
  const { data, error } = await supabase
    .from('satisfaction_responses')
    .select('*')
    .in('survey_id', surveyIds)
    .eq('user_id', userId)
  if (error) throw error
  return data as SatisfactionResponse[]
}

export interface SurveyResult {
  surveyId: string
  responseCount: number
  avgRating: number | null
  distribution: Record<number, number>
}

export async function getSurveyResults(surveyId: string): Promise<SurveyResult> {
  const { data, error } = await supabase
    .from('satisfaction_responses')
    .select('rating')
    .eq('survey_id', surveyId)
  if (error) throw error

  const responses = data ?? []
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let sum = 0
  for (const r of responses) {
    distribution[r.rating] = (distribution[r.rating] ?? 0) + 1
    sum += r.rating
  }

  return {
    surveyId,
    responseCount: responses.length,
    avgRating: responses.length > 0 ? Math.round((sum / responses.length) * 100) / 100 : null,
    distribution,
  }
}

export async function setTeacherRating(surveyId: string, rating: number): Promise<void> {
  if (rating < 1 || rating > 5) throw new Error('점수는 1~5 사이여야 합니다.')
  const { error } = await supabase
    .from('satisfaction_surveys')
    .update({ teacher_rating: rating })
    .eq('id', surveyId)
  if (error) throw error
}

/**
 * 설문 마감. 평균 점수를 계산하고, 선택적으로 주가에 자동 반영.
 * 최종 점수 = 학생 응답이 있으면 학생 평균, teacher_rating만 있으면 teacher_rating 사용.
 * both 모드에서 둘 다 있으면 (학생평균 * 0.7 + 선생님점수 * 0.3) 가중 평균.
 */
export async function closeSurvey(surveyId: string): Promise<void> {
  const { data: survey, error: fetchErr } = await supabase
    .from('satisfaction_surveys')
    .select('*')
    .eq('id', surveyId)
    .single()
  if (fetchErr || !survey) throw new Error('설문을 찾을 수 없습니다.')

  const result = await getSurveyResults(surveyId)

  let finalRating: number | null = null
  if (result.avgRating != null && survey.teacher_rating != null) {
    finalRating = Math.round((result.avgRating * 0.7 + survey.teacher_rating * 0.3) * 100) / 100
  } else if (result.avgRating != null) {
    finalRating = result.avgRating
  } else if (survey.teacher_rating != null) {
    finalRating = survey.teacher_rating
  }

  const updatePayload: Record<string, unknown> = {
    status: 'closed',
    closed_at: new Date().toISOString(),
    avg_rating: finalRating,
  }

  if (finalRating != null && survey.auto_apply) {
    const impactPercent = Math.round((finalRating - 3) * 10)

    const { data: event, error: eventErr } = await supabase
      .from('economy_events')
      .insert({
        classroom_id: survey.classroom_id,
        type: 'auto',
        title: `만족도 조사: ${survey.title}`,
        description: `평균 ${finalRating}점 → ${impactPercent >= 0 ? '+' : ''}${impactPercent}% 반영`,
        effects_json: { stocks: { [survey.factor_type]: impactPercent } },
        status: 'pending',
      })
      .select()
      .single()
    if (eventErr) throw eventErr

    const { error: rpcErr } = await supabase.rpc('apply_stock_event', { p_event_id: event.id })
    if (rpcErr) throw rpcErr

    updatePayload.applied_event_id = event.id
  }

  const { error: updateErr } = await supabase
    .from('satisfaction_surveys')
    .update(updatePayload)
    .eq('id', surveyId)
  if (updateErr) throw updateErr
}

/**
 * 이미 마감된 설문의 결과를 수동으로 주가에 반영
 */
export async function applySurveyToStocks(surveyId: string): Promise<void> {
  const { data: survey, error: fetchErr } = await supabase
    .from('satisfaction_surveys')
    .select('*')
    .eq('id', surveyId)
    .single()
  if (fetchErr || !survey) throw new Error('설문을 찾을 수 없습니다.')
  if (survey.status !== 'closed') throw new Error('마감된 설문만 반영할 수 있습니다.')
  if (survey.applied_event_id) throw new Error('이미 주가에 반영된 설문입니다.')
  if (survey.avg_rating == null) throw new Error('평가 결과가 없습니다.')

  const impactPercent = Math.round((survey.avg_rating - 3) * 10)

  const { data: event, error: eventErr } = await supabase
    .from('economy_events')
    .insert({
      classroom_id: survey.classroom_id,
      type: 'auto',
      title: `만족도 조사: ${survey.title}`,
      description: `평균 ${survey.avg_rating}점 → ${impactPercent >= 0 ? '+' : ''}${impactPercent}% 반영`,
      effects_json: { stocks: { [survey.factor_type]: impactPercent } },
      status: 'pending',
    })
    .select()
    .single()
  if (eventErr) throw eventErr

  const { error: rpcErr } = await supabase.rpc('apply_stock_event', { p_event_id: event.id })
  if (rpcErr) throw rpcErr

  await supabase
    .from('satisfaction_surveys')
    .update({ applied_event_id: event.id })
    .eq('id', surveyId)
}

export async function deleteSurvey(surveyId: string): Promise<void> {
  const { error } = await supabase
    .from('satisfaction_surveys')
    .delete()
    .eq('id', surveyId)
  if (error) throw error
}
