import { supabase } from '@/lib/supabase'
import type { Stock, StockTransaction } from '@/types/database'

export async function getStocks(classroomId: string): Promise<Stock[]> {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data as Stock[]
}

export async function getStockHistory(stockId: string, days = 14): Promise<{ price: number; date: string }[]> {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await supabase
    .from('stock_transactions')
    .select('price, created_at')
    .eq('stock_id', stockId)
    .gte('created_at', since.toISOString())
    .order('created_at')

  return (data ?? []).map((d) => ({ price: d.price, date: d.created_at }))
}

export async function getUserHoldings(userId: string, classroomId: string) {
  const { data: stocks } = await supabase
    .from('stocks')
    .select('id, name, current_price')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)

  if (!stocks) return []

  const holdings = []
  for (const stock of stocks) {
    const { data: buys } = await supabase
      .from('stock_transactions')
      .select('quantity, price')
      .eq('stock_id', stock.id)
      .eq('user_id', userId)
      .eq('type', 'buy')

    const { data: sells } = await supabase
      .from('stock_transactions')
      .select('quantity')
      .eq('stock_id', stock.id)
      .eq('user_id', userId)
      .eq('type', 'sell')

    const totalBought = (buys ?? []).reduce((s, b) => s + b.quantity, 0)
    const totalSold = (sells ?? []).reduce((s, s2) => s + s2.quantity, 0)
    const quantity = totalBought - totalSold

    if (quantity > 0) {
      const totalCost = (buys ?? []).reduce((s, b) => s + b.quantity * b.price, 0)
      const avgPrice = Math.round(totalCost / totalBought)
      holdings.push({
        stockId: stock.id,
        stockName: stock.name,
        quantity,
        avgPrice,
        currentPrice: stock.current_price,
      })
    }
  }
  return holdings
}

export async function buyStock(stockId: string, userId: string, accountId: string, quantity: number): Promise<StockTransaction> {
  const { data: stock } = await supabase.from('stocks').select('current_price, name').eq('id', stockId).single()
  if (!stock) throw new Error('종목을 찾을 수 없습니다.')

  const totalCost = stock.current_price * quantity

  const { data: txn, error } = await supabase
    .from('stock_transactions')
    .insert({ stock_id: stockId, user_id: userId, type: 'buy', quantity, price: stock.current_price })
    .select()
    .single()
  if (error) throw error

  await supabase.from('transactions').insert({
    account_id: accountId,
    type: 'expense',
    category: 'investment',
    amount: totalCost,
    description: `주식 매수 - ${stock.name} ${quantity}주`,
  })
  await supabase.rpc('update_balance', { p_account_id: accountId, p_amount: -totalCost })

  return txn as StockTransaction
}

export async function sellStock(stockId: string, userId: string, accountId: string, quantity: number): Promise<StockTransaction> {
  const { data: stock } = await supabase.from('stocks').select('current_price, name').eq('id', stockId).single()
  if (!stock) throw new Error('종목을 찾을 수 없습니다.')

  const totalRevenue = stock.current_price * quantity

  const { data: txn, error } = await supabase
    .from('stock_transactions')
    .insert({ stock_id: stockId, user_id: userId, type: 'sell', quantity, price: stock.current_price })
    .select()
    .single()
  if (error) throw error

  await supabase.from('transactions').insert({
    account_id: accountId,
    type: 'income',
    category: 'investment',
    amount: totalRevenue,
    description: `주식 매도 - ${stock.name} ${quantity}주`,
  })
  await supabase.rpc('update_balance', { p_account_id: accountId, p_amount: totalRevenue })

  return txn as StockTransaction
}
