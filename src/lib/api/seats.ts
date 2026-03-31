import { supabase } from '@/lib/supabase'
import type { Seat } from '@/types/database'

export async function getSeats(classroomId: string): Promise<(Seat & { owner?: { name: string }; resident?: { name: string } })[]> {
  const { data, error } = await supabase
    .from('seats')
    .select('*, owner:users!seats_owner_id_fkey(name), resident:users!seats_resident_id_fkey(name)')
    .eq('classroom_id', classroomId)
    .order('position_row')
    .order('position_col')
  if (error) throw error
  return data as never
}

export async function purchaseSeat(seatId: string, buyerId: string, accountId: string): Promise<void> {
  const { data: seat } = await supabase.from('seats').select('price, label').eq('id', seatId).single()
  if (!seat) throw new Error('자리를 찾을 수 없습니다.')

  await supabase.from('seats').update({ owner_id: buyerId }).eq('id', seatId)

  await supabase.from('transactions').insert({
    account_id: accountId,
    type: 'expense',
    category: 'other_expense',
    amount: seat.price,
    description: `자리 구매 - ${seat.label}`,
  })
  await supabase.rpc('update_balance', { p_account_id: accountId, p_amount: -seat.price })
}
