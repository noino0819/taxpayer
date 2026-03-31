import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import {
  useStocks,
  useMyHoldings,
  useMyAccount,
  useBuyStock,
  useSellStock,
  useStockPriceHistory,
  useEconomyEvents,
  useActiveSurveys,
  useMyResponses,
  useSubmitResponse,
} from '@/hooks/useQueries'
import { STOCK_FACTOR_LABELS } from '@/lib/constants'
import type { Stock, SatisfactionSurvey, SatisfactionResponse } from '@/types/database'
import toast from 'react-hot-toast'

export function InvestmentPage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')
  const [chartStock, setChartStock] = useState<Stock | null>(null)

  const { data: stocks } = useStocks()
  const { data: holdings } = useMyHoldings()
  const { data: account } = useMyAccount()
  const { data: events } = useEconomyEvents()
  const buyMutation = useBuyStock()
  const sellMutation = useSellStock()

  const recentEvents = (events ?? []).filter((e) => e.status === 'executed').slice(0, 5)

  const totalPortfolioValue = (holdings ?? []).reduce(
    (sum, h) => sum + h.quantity * h.currentPrice, 0,
  )
  const totalCost = (holdings ?? []).reduce(
    (sum, h) => sum + h.quantity * h.avgPrice, 0,
  )
  const totalPnl = totalPortfolioValue - totalCost

  const handleTrade = async () => {
    if (!selectedStock || !user || !account) return
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      toast.error('수량을 입력해주세요.')
      return
    }

    try {
      const params = { stockId: selectedStock.id, userId: user.id, accountId: account.id, quantity: qty }
      if (tradeType === 'buy') {
        const total = selectedStock.current_price * qty
        if (total > (account.balance ?? 0)) {
          toast.error('잔액이 부족해요!')
          return
        }
        await buyMutation.mutateAsync(params)
        toast.success(`${selectedStock.name} ${qty}주를 매수했어요!`)
      } else {
        const holding = (holdings ?? []).find((h) => h.stockId === selectedStock.id)
        if (!holding || holding.quantity < qty) {
          toast.error('보유 수량이 부족해요.')
          return
        }
        await sellMutation.mutateAsync(params)
        toast.success(`${selectedStock.name} ${qty}주를 매도했어요!`)
      }
      setSelectedStock(null)
      setQuantity('')
    } catch {
      toast.error('거래에 실패했어요.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">투자</h2>
      <p className="text-xs text-text-tertiary -mt-3 leading-relaxed">
        주식을 사고팔아 돈을 벌 수 있어요. 가격은 매일 변하니 잘 살펴보고 결정하세요! 돈을 잃을 수도 있으니 신중하게 투자하세요.
      </p>

      {recentEvents.length > 0 && (
        <Card className="!bg-gradient-to-br !from-warning-50/50 !via-surface !to-primary-50/30 !border-warning-200/40">
          <h3 className="font-bold text-sm mb-2">최근 시장 뉴스</h3>
          <div className="space-y-1.5">
            {recentEvents.map((event) => {
              const effects = event.effects_json?.stocks ?? {}
              return (
                <div key={event.id} className="flex items-start gap-2">
                  <span className="text-sm mt-0.5">
                    {Object.values(effects).some((v) => Number(v) > 0) ? '📈' : '📉'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {Object.entries(effects).map(([factor, pct]) => (
                        <span
                          key={factor}
                          className={`text-xs font-bold ${Number(pct) > 0 ? 'text-accent-600' : 'text-danger-500'}`}
                        >
                          {STOCK_FACTOR_LABELS[factor] || factor} {Number(pct) > 0 ? '+' : ''}{pct}%
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary whitespace-nowrap">
                    {event.executed_at ? new Date(event.executed_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {user && <ActiveSurveySection userId={user.id} />}

      {(holdings ?? []).length > 0 && (
        <Card className="!bg-gradient-to-br !from-primary-50 !via-surface !to-accent-50/30 !border-primary-200/60">
          <h3 className="font-bold mb-3">내 투자 현황</h3>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-text-tertiary">지금 팔면 받는 금액</p>
              <p className="text-2xl font-extrabold">{totalPortfolioValue.toLocaleString()}{currency}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-tertiary">번 돈 / 잃은 돈</p>
              <p className={`text-xl font-extrabold ${totalPnl >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString()}{currency}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {(holdings ?? []).map((h) => {
              const pnl = (h.currentPrice - h.avgPrice) * h.quantity
              return (
                <div key={h.stockId} className="flex items-center justify-between p-3 bg-surface rounded-2xl border border-border/40">
                  <div>
                    <p className="text-sm font-bold">{h.stockName}</p>
                    <p className="text-xs text-text-tertiary">{h.quantity}주 보유 · 산 가격 평균 {h.avgPrice}{currency}</p>
                  </div>
                  <p className={`text-sm font-extrabold ${pnl >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString()}{currency}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-bold text-text-secondary mb-3">주식 목록 (누르면 사고팔 수 있어요)</h3>
        <div className="space-y-3">
          {(stocks ?? []).map((stock) => {
            const change = stock.current_price - stock.previous_price
            const changePercent = stock.previous_price > 0
              ? ((change / stock.previous_price) * 100).toFixed(1)
              : '0.0'

            return (
              <Card key={stock.id} padding="sm" hover className="cursor-pointer" onClick={() => {
                setSelectedStock(stock)
                setTradeType('buy')
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl ${
                      change >= 0 ? 'bg-accent-100' : 'bg-danger-100'
                    }`}>
                      {change >= 0 ? '📈' : '📉'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{stock.name}</h4>
                      <p className="text-xs text-text-tertiary mt-0.5">{stock.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-extrabold">{stock.current_price}{currency}</p>
                      <p className={`text-xs font-bold ${change >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                        {change >= 0 ? '+' : ''}{change} ({changePercent}%)
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setChartStock(stock) }}
                      className="p-1.5 rounded-lg hover:bg-surface-tertiary text-text-tertiary transition-colors"
                      title="가격 추이"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
          {(stocks ?? []).length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl">📊</span>
              <p className="text-text-tertiary mt-2">주식 종목이 없어요</p>
            </div>
          )}
        </div>
      </div>

      {/* 매매 모달 */}
      <Modal
        isOpen={!!selectedStock}
        onClose={() => { setSelectedStock(null); setQuantity('') }}
        title={selectedStock?.name}
      >
        {selectedStock && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-surface-tertiary to-surface rounded-2xl p-4 text-center">
              <p className="text-3xl font-extrabold">{selectedStock.current_price}{currency}</p>
              <p className="text-xs text-text-tertiary mt-1">{selectedStock.description}</p>
              {(() => {
                const change = selectedStock.current_price - selectedStock.previous_price
                const pct = selectedStock.previous_price > 0 ? ((change / selectedStock.previous_price) * 100).toFixed(1) : '0.0'
                return (
                  <p className={`text-sm font-bold mt-1 ${change >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                    어제보다 {change >= 0 ? '+' : ''}{change} ({pct}%)
                  </p>
                )
              })()}
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={tradeType === 'buy' ? 'primary' : 'ghost'}
                onClick={() => setTradeType('buy')}
              >
                사기 (매수)
              </Button>
              <Button
                className="flex-1"
                variant={tradeType === 'sell' ? 'danger' : 'ghost'}
                onClick={() => setTradeType('sell')}
              >
                팔기 (매도)
              </Button>
            </div>
            <Input
              label="몇 주를 살까요?"
              type="number"
              placeholder="예: 1, 2, 3..."
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {quantity && Number(quantity) > 0 && (
              <div className="bg-surface-tertiary rounded-2xl p-3 text-center">
                <p className="text-sm text-text-secondary">
                  총 {tradeType === 'buy' ? '매수' : '매도'} 금액
                </p>
                <p className="text-xl font-extrabold text-primary-600">
                  {(selectedStock.current_price * Number(quantity)).toLocaleString()}{currency}
                </p>
              </div>
            )}
            <Button
              className="w-full"
              variant={tradeType === 'buy' ? 'primary' : 'danger'}
              onClick={handleTrade}
              isLoading={buyMutation.isPending || sellMutation.isPending}
            >
              {tradeType === 'buy' ? '사기' : '팔기'}
            </Button>
          </div>
        )}
      </Modal>

      {/* 차트 모달 */}
      <Modal
        isOpen={!!chartStock}
        onClose={() => setChartStock(null)}
        title={chartStock ? `${chartStock.name} 가격 추이` : ''}
      >
        {chartStock && <PriceChart stockId={chartStock.id} currency={currency} currentPrice={chartStock.current_price} />}
      </Modal>
    </motion.div>
  )
}

function ActiveSurveySection({ userId }: { userId: string }) {
  const { data: surveys } = useActiveSurveys()
  const studentSurveys = (surveys ?? []).filter(
    (s) => s.input_mode === 'student' || s.input_mode === 'both',
  )
  const surveyIds = studentSurveys.map((s) => s.id)
  const { data: myResponses } = useMyResponses(surveyIds)

  if (studentSurveys.length === 0) return null

  const responseMap = new Map((myResponses ?? []).map((r) => [r.survey_id, r]))

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-text-secondary">만족도 조사</h3>
      {studentSurveys.map((survey) => (
        <SurveyVoteCard
          key={survey.id}
          survey={survey}
          userId={userId}
          myResponse={responseMap.get(survey.id) ?? null}
        />
      ))}
    </div>
  )
}

function SurveyVoteCard({ survey, userId, myResponse }: {
  survey: SatisfactionSurvey
  userId: string
  myResponse: SatisfactionResponse | null
}) {
  const submitMutation = useSubmitResponse()
  const [hoveredStar, setHoveredStar] = useState(0)
  const currentRating = myResponse?.rating ?? 0
  const factorLabel = STOCK_FACTOR_LABELS[survey.factor_type] || survey.factor_type

  const handleRate = async (rating: number) => {
    try {
      await submitMutation.mutateAsync({ surveyId: survey.id, userId, rating })
      toast.success('투표 완료!')
    } catch {
      toast.error('투표에 실패했어요.')
    }
  }

  return (
    <Card className="!bg-gradient-to-br !from-warning-50/30 !via-surface !to-accent-50/20 !border-warning-200/40">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">{survey.title}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-tertiary text-text-tertiary">
              {factorLabel}
            </span>
          </div>
          {survey.description && (
            <p className="text-xs text-text-tertiary mt-0.5">{survey.description}</p>
          )}
        </div>
        {currentRating > 0 && (
          <Badge variant="accent" size="sm">투표 완료</Badge>
        )}
      </div>

      <div className="flex items-center justify-center gap-1 py-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= (hoveredStar || currentRating)
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              disabled={submitMutation.isPending}
              className={`text-3xl transition-all duration-150 ${
                isActive ? 'scale-110 opacity-100' : 'opacity-25 hover:opacity-50'
              } ${submitMutation.isPending ? 'pointer-events-none' : ''}`}
            >
              ⭐
            </button>
          )
        })}
      </div>

      {currentRating > 0 && (
        <p className="text-center text-xs text-text-tertiary">
          내 점수: {currentRating}점 (다시 눌러서 변경할 수 있어요)
        </p>
      )}
      {currentRating === 0 && (
        <p className="text-center text-xs text-text-tertiary">
          별을 눌러서 점수를 매겨보세요!
        </p>
      )}
    </Card>
  )
}

function PriceChart({ stockId, currency, currentPrice }: { stockId: string; currency: string; currentPrice: number }) {
  const { data: history, isLoading } = useStockPriceHistory(stockId)

  if (isLoading) {
    return <div className="text-center py-8 text-text-tertiary text-sm">로딩 중...</div>
  }

  const points: { price: number; date: string; reason: string }[] = [
    ...(history ?? []).map((h) => ({ price: h.price, date: h.created_at, reason: h.change_reason })),
  ]

  if (points.length === 0) {
    return (
      <div className="text-center py-8">
        <span className="text-3xl">📊</span>
        <p className="text-text-tertiary text-sm mt-2">아직 가격 변동 기록이 없어요</p>
        <p className="text-text-tertiary text-xs mt-1">선생님이 주가를 갱신하면 여기에 그래프가 나타나요!</p>
      </div>
    )
  }

  const prices = points.map((p) => p.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const range = maxPrice - minPrice || 1

  const width = 320
  const height = 140
  const padding = { top: 10, right: 10, bottom: 24, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const pathPoints = points.map((p, i) => {
    const x = padding.left + (points.length > 1 ? (i / (points.length - 1)) * chartW : chartW / 2)
    const y = padding.top + chartH - ((p.price - minPrice) / range) * chartH
    return { x, y, ...p }
  })

  const linePath = pathPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  const firstPrice = points[0].price
  const lastPrice = points[points.length - 1].price
  const isUp = lastPrice >= firstPrice

  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-2xl font-extrabold">{currentPrice}{currency}</p>
        {points.length > 1 && (
          <p className={`text-sm font-bold ${isUp ? 'text-accent-600' : 'text-danger-500'}`}>
            {isUp ? '+' : ''}{lastPrice - firstPrice} ({firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice * 100).toFixed(1) : '0.0'}%)
          </p>
        )}
      </div>
      <div className="bg-surface-tertiary rounded-2xl p-3 flex justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[320px]">
          <defs>
            <linearGradient id={`grad-${stockId}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={isUp ? '#10B981' : '#EF4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isUp ? '#10B981' : '#EF4444'} stopOpacity="0" />
            </linearGradient>
          </defs>
          {pathPoints.length > 1 && (
            <path
              d={`${linePath} L${pathPoints[pathPoints.length - 1].x},${padding.top + chartH} L${pathPoints[0].x},${padding.top + chartH} Z`}
              fill={`url(#grad-${stockId})`}
            />
          )}
          <path d={linePath} fill="none" stroke={isUp ? '#10B981' : '#EF4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {pathPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={isUp ? '#10B981' : '#EF4444'} />
          ))}
          <text x={padding.left} y={height - 4} fontSize="9" fill="#9CA3AF">{new Date(points[0].date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</text>
          {points.length > 1 && (
            <text x={width - padding.right} y={height - 4} fontSize="9" fill="#9CA3AF" textAnchor="end">
              {new Date(points[points.length - 1].date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
            </text>
          )}
        </svg>
      </div>
      <div className="space-y-1.5">
        {points.slice(-5).reverse().map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-text-tertiary">
              {new Date(p.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              {' '}
              <Badge variant="neutral" size="sm">
                {p.reason === 'random' ? '랜덤' : p.reason === 'event' ? '이벤트' : '수동'}
              </Badge>
            </span>
            <span className="font-bold">{p.price}{currency}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
