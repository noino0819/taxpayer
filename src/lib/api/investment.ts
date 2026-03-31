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

/**
 * 수요/공급 기반 가격 영향도 계산.
 * 주당 2% 영향, 최대 ±20% 제한, 최소 가격 1.
 */
function calcPriceAfterTrade(currentPrice: number, quantity: number, direction: 'buy' | 'sell'): number {
  const impactRate = Math.min(quantity * 0.02, 0.20)
  const multiplier = direction === 'buy' ? 1 + impactRate : 1 - impactRate
  return Math.max(1, Math.round(currentPrice * multiplier))
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

  const newPrice = calcPriceAfterTrade(stock.current_price, quantity, 'buy')
  await supabase.from('stocks').update({ current_price: newPrice }).eq('id', stockId)

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

  const newPrice = calcPriceAfterTrade(stock.current_price, quantity, 'sell')
  await supabase.from('stocks').update({ current_price: newPrice }).eq('id', stockId)

  return txn as StockTransaction
}

/** 교사가 특정 종목의 가격을 직접 설정 */
export async function setStockPrice(stockId: string, newPrice: number): Promise<void> {
  if (newPrice < 1) throw new Error('가격은 1 이상이어야 합니다.')
  await supabase.from('stocks').update({ current_price: newPrice }).eq('id', stockId)
}

/** 하루 마감: 현재가를 전일 종가로 스냅샷 (등락률 리셋) */
export async function closeMarketDay(classroomId: string): Promise<void> {
  const { data: stocks } = await supabase
    .from('stocks')
    .select('id, current_price')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)

  if (!stocks || stocks.length === 0) return

  await Promise.all(
    stocks.map((s) =>
      supabase.from('stocks').update({ previous_price: s.current_price }).eq('id', s.id),
    ),
  )
}
