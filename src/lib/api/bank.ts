import { supabase } from '@/lib/supabase'
import type { SavingsProduct, SavingsAccount, Insurance, InsuranceContract } from '@/types/database'

export async function getSavingsProducts(classroomId: string): Promise<SavingsProduct[]> {
  const { data, error } = await supabase
    .from('savings_products')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)
    .order('interest_rate')
  if (error) throw error
  return data as SavingsProduct[]
}

export async function getUserSavings(userId: string): Promise<(SavingsAccount & { product: SavingsProduct })[]> {
  const { data, error } = await supabase
    .from('savings_accounts')
    .select('*, product:savings_products(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
  if (error) throw error
  return data as (SavingsAccount & { product: SavingsProduct })[]
}

export async function openSavings(productId: string, userId: string, accountId: string, principal: number, termDays: number) {
  const maturity = new Date()
  maturity.setDate(maturity.getDate() + termDays)

  const { data: product } = await supabase.from('savings_products').select('name').eq('id', productId).single()

  const { error } = await supabase.from('savings_accounts').insert({
    product_id: productId,
    user_id: userId,
    principal,
    maturity_at: maturity.toISOString(),
  })
  if (error) throw error

  await supabase.from('transactions').insert({
    account_id: accountId,
    type: 'expense',
    category: 'other_expense',
    amount: principal,
    description: `적금 가입 - ${product?.name}`,
  })
  await supabase.rpc('update_balance', { p_account_id: accountId, p_amount: -principal })
}

export async function getInsuranceProducts(classroomId: string): Promise<Insurance[]> {
  const { data, error } = await supabase
    .from('insurances')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)
  if (error) throw error
  return data as Insurance[]
}

export async function getUserInsuranceContracts(userId: string): Promise<(InsuranceContract & { insurance: Insurance })[]> {
  const { data, error } = await supabase
    .from('insurance_contracts')
    .select('*, insurance:insurances(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
  if (error) throw error
  return data as (InsuranceContract & { insurance: Insurance })[]
}

export async function joinInsurance(insuranceId: string, userId: string): Promise<InsuranceContract> {
  const { data, error } = await supabase
    .from('insurance_contracts')
    .insert({ insurance_id: insuranceId, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as InsuranceContract
}
