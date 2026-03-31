import { supabase } from '@/lib/supabase'
import type { Fine } from '@/types/database'

export async function getFines(classroomId: string, status?: string): Promise<(Fine & { offender: { name: string }; reporter: { name: string } })[]> {
  let query = supabase
    .from('fines')
    .select('*, offender:users!fines_offender_id_fkey(name), reporter:users!fines_reporter_id_fkey(name)')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data as never
}

export async function createFine(params: {
  classroomId: string
  offenderId: string
  reporterId: string
  reason: string
  amount: number
}): Promise<Fine> {
  const { data, error } = await supabase
    .from('fines')
    .insert({
      classroom_id: params.classroomId,
      offender_id: params.offenderId,
      reporter_id: params.reporterId,
      reason: params.reason,
      amount: params.amount,
    })
    .select()
    .single()
  if (error) throw error
  return data as Fine
}

export async function approveFine(fineId: string, approvedBy: string): Promise<void> {
  const { data: fine } = await supabase
    .from('fines')
    .update({ status: 'approved', approved_by: approvedBy })
    .eq('id', fineId)
    .select('offender_id, amount, classroom_id')
    .single()

  if (fine) {
    const { data: account } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', fine.offender_id)
      .eq('classroom_id', fine.classroom_id)
      .single()

    if (account) {
      await supabase.from('transactions').insert({
        account_id: account.id,
        type: 'expense',
        category: 'fine',
        amount: fine.amount,
        description: `벌금 부과`,
        approved_by: approvedBy,
      })
      await supabase.rpc('update_balance', { p_account_id: account.id, p_amount: -fine.amount })
    }
  }
}

export async function rejectFine(fineId: string, approvedBy: string): Promise<void> {
  await supabase
    .from('fines')
    .update({ status: 'rejected', approved_by: approvedBy })
    .eq('id', fineId)
}
