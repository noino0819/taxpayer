import { supabase } from '@/lib/supabase'
import type { PolicyDocument, PolicyType } from '@/types/database'

export async function getCurrentPolicies(): Promise<PolicyDocument[]> {
  const { data, error } = await supabase
    .from('policy_documents')
    .select('*')
    .eq('is_current', true)
    .order('type')
  if (error) throw error
  return data as PolicyDocument[]
}

export async function getPolicyByTypeAndVersion(type: PolicyType, version: string): Promise<PolicyDocument | null> {
  const { data, error } = await supabase
    .from('policy_documents')
    .select('*')
    .eq('type', type)
    .eq('version', version)
    .single()
  if (error) return null
  return data as PolicyDocument
}

export async function getPolicyVersionHistory(type: PolicyType): Promise<PolicyDocument[]> {
  const { data, error } = await supabase
    .from('policy_documents')
    .select('*')
    .eq('type', type)
    .order('effective_date', { ascending: false })
  if (error) throw error
  return data as PolicyDocument[]
}

export async function createPolicyVersion(
  type: PolicyType,
  version: string,
  title: string,
  content: string,
  summary: string,
  effectiveDate: string,
  createdBy: string,
): Promise<PolicyDocument> {
  await supabase
    .from('policy_documents')
    .update({ is_current: false })
    .eq('type', type)
    .eq('is_current', true)

  const { data, error } = await supabase
    .from('policy_documents')
    .insert({
      type,
      version,
      title,
      content,
      summary,
      effective_date: effectiveDate,
      is_current: true,
      created_by: createdBy,
    })
    .select()
    .single()
  if (error) throw error
  return data as PolicyDocument
}

export async function getUserLatestConsents(userId: string): Promise<Record<PolicyType, string | null>> {
  const { data, error } = await supabase
    .from('privacy_consents')
    .select('consent_type, version')
    .eq('user_id', userId)
    .eq('consented', true)
    .is('withdrawn_at', null)
    .order('consented_at', { ascending: false })
  if (error) throw error

  const result: Record<PolicyType, string | null> = {
    privacy_policy: null,
    terms_of_service: null,
  }

  for (const row of data ?? []) {
    const key = row.consent_type as PolicyType
    if (!result[key]) {
      result[key] = row.version
    }
  }
  return result
}

export async function checkNeedsReconsent(userId: string): Promise<PolicyDocument[]> {
  const [currentPolicies, userConsents] = await Promise.all([
    getCurrentPolicies(),
    getUserLatestConsents(userId),
  ])

  return currentPolicies.filter((policy) => {
    const consentedVersion = userConsents[policy.type]
    return consentedVersion !== policy.version
  })
}

export async function recordConsentForPolicy(userId: string, policy: PolicyDocument) {
  const { error } = await supabase
    .from('privacy_consents')
    .insert({
      user_id: userId,
      consent_type: policy.type,
      version: policy.version,
      consented: true,
      policy_document_id: policy.id,
    })
  if (error) throw error
}
