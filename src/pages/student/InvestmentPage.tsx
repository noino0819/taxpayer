import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { useStocks, useMyHoldings, useMyAccount, useBuyStock, useSellStock } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function InvestmentPage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('')

  const { data: stocks } = useStocks()
  const { data: holdings } = useMyHoldings()
  const { data: account } = useMyAccount()
  const buyMutation = useBuyStock()
  const sellMutation = useSellStock()

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
          toast.error('잔액이 부족합니다.')
          return
        }
        await buyMutation.mutateAsync(params)
        toast.success(`${selectedStock.name} ${qty}주를 매수했습니다!`)
      } else {
        const holding = (holdings ?? []).find((h) => h.stockId === selectedStock.id)
        if (!holding || holding.quantity < qty) {
          toast.error('보유 수량이 부족합니다.')
          return
        }
        await sellMutation.mutateAsync(params)
        toast.success(`${selectedStock.name} ${qty}주를 매도했습니다!`)
      }
      setSelectedStock(null)
      setQuantity('')
    } catch {
      toast.error('거래에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📈 투자</h2>

      {(holdings ?? []).length > 0 && (
        <Card className="!border-primary-200">
          <h3 className="font-semibold mb-3">내 포트폴리오</h3>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-text-secondary">총 평가액</p>
              <p className="text-xl font-bold">{totalPortfolioValue.toLocaleString()}{currency}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-secondary">총 손익</p>
              <p className={`text-lg font-bold ${totalPnl >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                {totalPnl >= 0 ? '+' : ''}{totalPnl.toLocaleString()}{currency}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {(holdings ?? []).map((h) => {
              const pnl = (h.currentPrice - h.avgPrice) * h.quantity
              return (
                <div key={h.stockId} className="flex items-center justify-between p-2 bg-surface-tertiary rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{h.stockName}</p>
                    <p className="text-xs text-text-tertiary">{h.quantity}주 · 평단 {h.avgPrice}{currency}</p>
                  </div>
                  <p className={`text-sm font-bold ${pnl >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                    {pnl >= 0 ? '+' : ''}{pnl}{currency}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">종목 목록</h3>
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
                  <div>
                    <h4 className="font-semibold text-sm">{stock.name}</h4>
                    <p className="text-xs text-text-tertiary mt-0.5">{stock.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{stock.current_price}{currency}</p>
                    <p className={`text-xs font-medium ${change >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                      {change >= 0 ? '▲' : '▼'} {Math.abs(change)} ({changePercent}%)
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
          {(stocks ?? []).length === 0 && (
            <p className="text-center text-text-tertiary py-4">주식 종목이 없습니다.</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedStock}
        onClose={() => { setSelectedStock(null); setQuantity('') }}
        title={selectedStock?.name}
      >
        {selectedStock && (
          <div className="space-y-4">
            <div className="bg-surface-tertiary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{selectedStock.current_price}{currency}</p>
              <p className="text-xs text-text-tertiary">{selectedStock.description}</p>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                variant={tradeType === 'buy' ? 'primary' : 'ghost'}
                onClick={() => setTradeType('buy')}
              >
                매수
              </Button>
              <Button
                className="flex-1"
                variant={tradeType === 'sell' ? 'danger' : 'ghost'}
                onClick={() => setTradeType('sell')}
              >
                매도
              </Button>
            </div>
            <Input
              label="수량"
              type="number"
              placeholder="주수를 입력하세요"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {quantity && Number(quantity) > 0 && (
              <p className="text-sm text-text-secondary">
                총 {tradeType === 'buy' ? '매수' : '매도'} 금액:{' '}
                <span className="font-bold">{(selectedStock.current_price * Number(quantity)).toLocaleString()}{currency}</span>
              </p>
            )}
            <Button
              className="w-full"
              variant={tradeType === 'buy' ? 'primary' : 'danger'}
              onClick={handleTrade}
              isLoading={buyMutation.isPending || sellMutation.isPending}
            >
              {tradeType === 'buy' ? '매수하기' : '매도하기'}
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
