import { supabase } from '@/lib/supabase'
import type { Account, Transaction, TransactionType, TransactionCategory } from '@/types/database'

export async function getAccount(userId: string, classroomId: string): Promise<Account | null> {
  const { data } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('classroom_id', classroomId)
    .single()
  return data as Account | null
}

export async function getAllAccounts(classroomId: string): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('*, user:users(id, name, avatar_preset_id)')
    .eq('classroom_id', classroomId)
    .order('balance', { ascending: false })
  if (error) throw error
  return data as Account[]
}

export async function getTransactions(accountId: string, limit = 20): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('account_id', accountId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Transaction[]
}

export async function getClassroomTransactions(classroomId: string, limit = 20): Promise<(Transaction & { account: { user: { name: string } } })[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, account:accounts!inner(user:users(name), classroom_id)')
    .eq('account.classroom_id', classroomId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as never
}

export async function createTransaction(params: {
  accountId: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  counterpartId?: string
  approvedBy?: string
}): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      account_id: params.accountId,
      type: params.type,
      category: params.category,
      amount: params.amount,
      description: params.description,
      counterpart_id: params.counterpartId,
      approved_by: params.approvedBy,
    })
    .select()
    .single()
  if (error) throw error

  const balanceChange = params.type === 'income' ? params.amount : -params.amount
  await supabase.rpc('update_balance', { p_account_id: params.accountId, p_amount: balanceChange })

  return data as Transaction
}

export async function deposit(accountId: string, amount: number, description: string, approvedBy?: string) {
  return createTransaction({
    accountId,
    type: 'income',
    category: 'other_income',
    amount,
    description,
    approvedBy,
  })
}

export async function withdraw(accountId: string, amount: number, description: string, approvedBy?: string) {
  return createTransaction({
    accountId,
    type: 'expense',
    category: 'other_expense',
    amount,
    description,
    approvedBy,
  })
}

export async function batchDeposit(classroomId: string, userIds: string[], amount: number, description: string, approvedBy: string) {
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id, user_id')
    .eq('classroom_id', classroomId)
    .in('user_id', userIds)

  if (error) throw error
  if (!accounts || accounts.length === 0) {
    throw new Error('선택한 학생의 계좌를 찾을 수 없습니다.')
  }

  const txns = accounts.map((acc) => ({
    account_id: acc.id,
    type: 'income' as const,
    category: 'other_income' as const,
    amount,
    description,
    approved_by: approvedBy,
  }))

  const { error: txError } = await supabase.from('transactions').insert(txns)
  if (txError) throw txError

  for (const acc of accounts) {
    await supabase.rpc('update_balance', { p_account_id: acc.id, p_amount: amount })
  }
}

export async function batchWithdraw(classroomId: string, userIds: string[], amount: number, description: string, approvedBy: string) {
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('id, user_id')
    .eq('classroom_id', classroomId)
    .in('user_id', userIds)

  if (error) throw error
  if (!accounts || accounts.length === 0) {
    throw new Error('선택한 학생의 계좌를 찾을 수 없습니다.')
  }

  const txns = accounts.map((acc) => ({
    account_id: acc.id,
    type: 'expense' as const,
    category: 'other_expense' as const,
    amount,
    description,
    approved_by: approvedBy,
  }))

  const { error: txError } = await supabase.from('transactions').insert(txns)
  if (txError) throw txError

  for (const acc of accounts) {
    await supabase.rpc('update_balance', { p_account_id: acc.id, p_amount: -amount })
  }
}

export async function getAccountStats(classroomId: string) {
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('classroom_id', classroomId)

  if (!accounts || accounts.length === 0) {
    return { totalBalance: 0, avgBalance: 0, studentCount: 0, giniIndex: 0 }
  }

  const balances = accounts.map((a) => a.balance)
  const totalBalance = balances.reduce((s, b) => s + b, 0)
  const avgBalance = Math.round(totalBalance / balances.length)

  const sorted = [...balances].sort((a, b) => a - b)
  const n = sorted.length
  let giniSum = 0
  for (let i = 0; i < n; i++) {
    giniSum += (2 * (i + 1) - n - 1) * sorted[i]
  }
  const giniIndex = totalBalance > 0 ? Math.round((giniSum / (n * totalBalance)) * 100) / 100 : 0

  return { totalBalance, avgBalance, studentCount: n, giniIndex }
}

export async function getMonthlyStats(accountId: string) {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('account_id', accountId)
    .gte('created_at', startOfMonth)

  const income = (data ?? []).filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = (data ?? []).filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return { income, expense }
}
