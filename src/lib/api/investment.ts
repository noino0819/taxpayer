import { supabase } from '@/lib/supabase'
import type { Stock, StockTransaction, StockPriceHistory, EconomyEvent } from '@/types/database'

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
 * 종목별 설정값(price_impact_rate, max_price_impact)을 사용.
 */
function calcPriceAfterTrade(
  currentPrice: number,
  quantity: number,
  direction: 'buy' | 'sell',
  impactRate: number,
  maxImpact: number,
): number {
  const totalImpact = Math.min(quantity * impactRate, maxImpact)
  const multiplier = direction === 'buy' ? 1 + totalImpact : 1 - totalImpact
  return Math.max(1, Math.round(currentPrice * multiplier))
}

export async function buyStock(stockId: string, userId: string, accountId: string, quantity: number): Promise<StockTransaction> {
  const { data: stock } = await supabase
    .from('stocks')
    .select('current_price, name, price_impact_rate, max_price_impact')
    .eq('id', stockId)
    .single()
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

  const newPrice = calcPriceAfterTrade(
    stock.current_price, quantity, 'buy',
    stock.price_impact_rate, stock.max_price_impact,
  )
  await supabase.from('stocks').update({ current_price: newPrice }).eq('id', stockId)

  return txn as StockTransaction
}

export async function sellStock(stockId: string, userId: string, accountId: string, quantity: number): Promise<StockTransaction> {
  const { data: stock } = await supabase
    .from('stocks')
    .select('current_price, name, price_impact_rate, max_price_impact')
    .eq('id', stockId)
    .single()
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

  const newPrice = calcPriceAfterTrade(
    stock.current_price, quantity, 'sell',
    stock.price_impact_rate, stock.max_price_impact,
  )
  await supabase.from('stocks').update({ current_price: newPrice }).eq('id', stockId)

  return txn as StockTransaction
}

/** 교사가 특정 종목의 가격을 직접 설정 (RPC 사용, 이력 자동 기록) */
export async function setStockPrice(stockId: string, newPrice: number): Promise<void> {
  if (newPrice < 1) throw new Error('가격은 1 이상이어야 합니다.')
  const { error } = await supabase.rpc('update_stock_price', {
    p_stock_id: stockId,
    p_new_price: newPrice,
    p_reason: 'manual',
  })
  if (error) throw error
}

/** 교사가 종목별 변동 설정을 수정 */
export async function updateStockSettings(
  stockId: string,
  settings: { price_impact_rate?: number; max_price_impact?: number },
): Promise<void> {
  const update: Record<string, number> = {}
  if (settings.price_impact_rate != null) update.price_impact_rate = settings.price_impact_rate
  if (settings.max_price_impact != null) update.max_price_impact = settings.max_price_impact
  if (Object.keys(update).length === 0) return
  await supabase.from('stocks').update(update).eq('id', stockId)
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

// ═══════════════════════════════════════════
// 주가 변동 시스템
// ═══════════════════════════════════════════

export async function getAllStocks(classroomId: string): Promise<Stock[]> {
  const { data, error } = await supabase
    .from('stocks')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('name')
  if (error) throw error
  return data as Stock[]
}

export async function applyRandomFluctuation(classroomId: string, minPct = -10, maxPct = 10): Promise<void> {
  const { error } = await supabase.rpc('apply_random_fluctuation', {
    p_classroom_id: classroomId,
    p_min_pct: minPct,
    p_max_pct: maxPct,
  })
  if (error) throw error
}

export async function getStockPriceHistory(stockId: string, limit = 30): Promise<StockPriceHistory[]> {
  const { data, error } = await supabase
    .from('stock_price_history')
    .select('*')
    .eq('stock_id', stockId)
    .order('created_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return data as StockPriceHistory[]
}

export async function getClassroomPriceHistory(classroomId: string, limit = 30): Promise<StockPriceHistory[]> {
  const { data: stocks } = await supabase
    .from('stocks')
    .select('id')
    .eq('classroom_id', classroomId)

  if (!stocks || stocks.length === 0) return []

  const stockIds = stocks.map((s) => s.id)
  const { data, error } = await supabase
    .from('stock_price_history')
    .select('*')
    .in('stock_id', stockIds)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data as StockPriceHistory[]).reverse()
}

// ═══════════════════════════════════════════
// 종목 CRUD
// ═══════════════════════════════════════════

export async function addStock(
  classroomId: string,
  stock: { name: string; current_price: number; description: string; factor_type: string },
): Promise<Stock> {
  const { data, error } = await supabase
    .from('stocks')
    .insert({
      classroom_id: classroomId,
      name: stock.name,
      current_price: stock.current_price,
      previous_price: stock.current_price,
      description: stock.description,
      factor_type: stock.factor_type,
      is_active: true,
    })
    .select()
    .single()
  if (error) throw error
  return data as Stock
}

export async function toggleStock(stockId: string, isActive: boolean): Promise<void> {
  const { error } = await supabase
    .from('stocks')
    .update({ is_active: isActive })
    .eq('id', stockId)
  if (error) throw error
}

export async function deleteStock(stockId: string): Promise<void> {
  const { error } = await supabase
    .from('stocks')
    .delete()
    .eq('id', stockId)
  if (error) throw error
}

// ═══════════════════════════════════════════
// 경제 이벤트
// ═══════════════════════════════════════════

export async function getEconomyEvents(classroomId: string): Promise<EconomyEvent[]> {
  const { data, error } = await supabase
    .from('economy_events')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as EconomyEvent[]
}

export async function createEconomyEvent(
  classroomId: string,
  event: { title: string; description: string; effects: Record<string, number>; type?: string },
): Promise<EconomyEvent> {
  const { data, error } = await supabase
    .from('economy_events')
    .insert({
      classroom_id: classroomId,
      type: event.type || 'scheduled',
      title: event.title,
      description: event.description,
      effects_json: { stocks: event.effects },
      status: 'pending',
    })
    .select()
    .single()
  if (error) throw error
  return data as EconomyEvent
}

export async function executeEconomyEvent(eventId: string): Promise<void> {
  const { error } = await supabase.rpc('apply_stock_event', { p_event_id: eventId })
  if (error) throw error
}

export async function cancelEconomyEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('economy_events')
    .update({ status: 'cancelled' })
    .eq('id', eventId)
  if (error) throw error
}

// ═══════════════════════════════════════════
// 주식 거래 통계 (교사용)
// ═══════════════════════════════════════════

export interface StudentStockSummary {
  userId: string
  userName: string
  totalBought: number
  totalSold: number
  totalBuyCost: number
  totalSellRevenue: number
  realizedPnl: number
  holdingsValue: number
  holdingsCount: number
}

export interface StockTradeSummary {
  stockId: string
  stockName: string
  currentPrice: number
  totalBuyVolume: number
  totalSellVolume: number
  totalBuyAmount: number
  totalSellAmount: number
  traders: { userId: string; userName: string; buyQty: number; sellQty: number; holdQty: number; pnl: number }[]
}

export async function getStudentStockSummaries(classroomId: string): Promise<StudentStockSummary[]> {
  const { data: members } = await supabase
    .from('memberships')
    .select('user_id, user:users(name)')
    .eq('classroom_id', classroomId)
    .eq('status', 'active')
  if (!members) return []

  const students = members.filter((m: any) => m.user?.name)

  const { data: stocks } = await supabase
    .from('stocks')
    .select('id, current_price')
    .eq('classroom_id', classroomId)

  const { data: allTxns } = await supabase
    .from('stock_transactions')
    .select('user_id, stock_id, type, quantity, price')
    .in('stock_id', (stocks ?? []).map((s) => s.id))

  const stockPriceMap = new Map((stocks ?? []).map((s) => [s.id, s.current_price]))
  const txns = allTxns ?? []

  return students.map((m: any) => {
    const userTxns = txns.filter((t) => t.user_id === m.user_id)
    const buys = userTxns.filter((t) => t.type === 'buy')
    const sells = userTxns.filter((t) => t.type === 'sell')

    const totalBuyCost = buys.reduce((s, t) => s + t.quantity * t.price, 0)
    const totalSellRevenue = sells.reduce((s, t) => s + t.quantity * t.price, 0)
    const totalBought = buys.reduce((s, t) => s + t.quantity, 0)
    const totalSold = sells.reduce((s, t) => s + t.quantity, 0)

    const holdingsByStock = new Map<string, { buyQty: number; sellQty: number; buyCost: number }>()
    for (const t of userTxns) {
      const h = holdingsByStock.get(t.stock_id) ?? { buyQty: 0, sellQty: 0, buyCost: 0 }
      if (t.type === 'buy') { h.buyQty += t.quantity; h.buyCost += t.quantity * t.price }
      else { h.sellQty += t.quantity }
      holdingsByStock.set(t.stock_id, h)
    }

    let holdingsValue = 0
    let holdingsCount = 0
    for (const [stockId, h] of holdingsByStock) {
      const qty = h.buyQty - h.sellQty
      if (qty > 0) {
        holdingsValue += qty * (stockPriceMap.get(stockId) ?? 0)
        holdingsCount += qty
      }
    }

    return {
      userId: m.user_id,
      userName: (m.user as any)?.name ?? '알 수 없음',
      totalBought,
      totalSold,
      totalBuyCost,
      totalSellRevenue,
      realizedPnl: totalSellRevenue - (totalBought > 0 ? Math.round(totalBuyCost * (totalSold / totalBought)) : 0),
      holdingsValue,
      holdingsCount,
    }
  }).sort((a, b) => (b.holdingsValue + b.realizedPnl) - (a.holdingsValue + a.realizedPnl))
}

export async function getStockTradeSummaries(classroomId: string): Promise<StockTradeSummary[]> {
  const { data: stocks } = await supabase
    .from('stocks')
    .select('id, name, current_price')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)
    .order('name')
  if (!stocks) return []

  const { data: members } = await supabase
    .from('memberships')
    .select('user_id, user:users(name)')
    .eq('classroom_id', classroomId)
    .eq('status', 'active')
  const userNameMap = new Map((members ?? []).map((m: any) => [m.user_id, (m.user as any)?.name ?? '']))

  const { data: allTxns } = await supabase
    .from('stock_transactions')
    .select('user_id, stock_id, type, quantity, price')
    .in('stock_id', stocks.map((s) => s.id))

  const txns = allTxns ?? []

  return stocks.map((stock) => {
    const stockTxns = txns.filter((t) => t.stock_id === stock.id)
    const buys = stockTxns.filter((t) => t.type === 'buy')
    const sells = stockTxns.filter((t) => t.type === 'sell')

    const traderMap = new Map<string, { buyQty: number; sellQty: number; buyCost: number; sellRevenue: number }>()
    for (const t of stockTxns) {
      const tr = traderMap.get(t.user_id) ?? { buyQty: 0, sellQty: 0, buyCost: 0, sellRevenue: 0 }
      if (t.type === 'buy') { tr.buyQty += t.quantity; tr.buyCost += t.quantity * t.price }
      else { tr.sellQty += t.quantity; tr.sellRevenue += t.quantity * t.price }
      traderMap.set(t.user_id, tr)
    }

    const traders = Array.from(traderMap.entries()).map(([userId, tr]) => {
      const holdQty = tr.buyQty - tr.sellQty
      const avgBuyPrice = tr.buyQty > 0 ? tr.buyCost / tr.buyQty : 0
      const unrealizedPnl = holdQty * (stock.current_price - avgBuyPrice)
      const realizedPnl = tr.sellQty > 0 ? tr.sellRevenue - tr.sellQty * avgBuyPrice : 0
      return {
        userId,
        userName: userNameMap.get(userId) ?? '알 수 없음',
        buyQty: tr.buyQty,
        sellQty: tr.sellQty,
        holdQty,
        pnl: Math.round(realizedPnl + unrealizedPnl),
      }
    }).sort((a, b) => b.pnl - a.pnl)

    return {
      stockId: stock.id,
      stockName: stock.name,
      currentPrice: stock.current_price,
      totalBuyVolume: buys.reduce((s, t) => s + t.quantity, 0),
      totalSellVolume: sells.reduce((s, t) => s + t.quantity, 0),
      totalBuyAmount: buys.reduce((s, t) => s + t.quantity * t.price, 0),
      totalSellAmount: sells.reduce((s, t) => s + t.quantity * t.price, 0),
      traders,
    }
  })
}
