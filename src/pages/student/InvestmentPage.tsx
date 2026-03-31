import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import toast from 'react-hot-toast'

const demoStocks = [
  {
    id: '1',
    name: '선생님 몸무게 주식',
    emoji: '⚖️',
    currentPrice: 120,
    previousPrice: 115,
    factor: '매일 측정한 교사의 몸무게 변화에 연동',
    history: [
      { day: '3/24', price: 100 },
      { day: '3/25', price: 105 },
      { day: '3/26', price: 110 },
      { day: '3/27', price: 108 },
      { day: '3/28', price: 115 },
      { day: '3/29', price: 112 },
      { day: '3/30', price: 118 },
      { day: '3/31', price: 120 },
    ],
  },
  {
    id: '2',
    name: '날씨 연동 종목',
    emoji: '🌤️',
    currentPrice: 95,
    previousPrice: 100,
    factor: '다음 날 날씨 예보에 따른 가격 변동',
    history: [
      { day: '3/24', price: 110 },
      { day: '3/25', price: 108 },
      { day: '3/26', price: 103 },
      { day: '3/27', price: 107 },
      { day: '3/28', price: 100 },
      { day: '3/29', price: 98 },
      { day: '3/30', price: 97 },
      { day: '3/31', price: 95 },
    ],
  },
  {
    id: '3',
    name: '학급 성적 종목',
    emoji: '📚',
    currentPrice: 150,
    previousPrice: 145,
    factor: '학급 평균 성적 변동에 따른 가격 변동',
    history: [
      { day: '3/24', price: 130 },
      { day: '3/25', price: 135 },
      { day: '3/26', price: 140 },
      { day: '3/27', price: 138 },
      { day: '3/28', price: 142 },
      { day: '3/29', price: 145 },
      { day: '3/30', price: 148 },
      { day: '3/31', price: 150 },
    ],
  },
  {
    id: '4',
    name: '환율 연동 종목',
    emoji: '💱',
    currentPrice: 88,
    previousPrice: 90,
    factor: '실제 원/달러 환율 변동 반영',
    history: [
      { day: '3/24', price: 95 },
      { day: '3/25', price: 93 },
      { day: '3/26', price: 91 },
      { day: '3/27', price: 92 },
      { day: '3/28', price: 90 },
      { day: '3/29', price: 89 },
      { day: '3/30', price: 87 },
      { day: '3/31', price: 88 },
    ],
  },
]

const myHoldings = [
  { stockId: '1', stockName: '선생님 몸무게 주식', quantity: 2, avgPrice: 105, currentPrice: 120 },
  { stockId: '3', stockName: '학급 성적 종목', quantity: 1, avgPrice: 140, currentPrice: 150 },
]

export function InvestmentPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedStock, setSelectedStock] = useState<typeof demoStocks[0] | null>(null)
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('1')

  const totalInvested = myHoldings.reduce((s, h) => s + h.avgPrice * h.quantity, 0)
  const totalCurrent = myHoldings.reduce((s, h) => s + h.currentPrice * h.quantity, 0)
  const totalPnL = totalCurrent - totalInvested

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📈 투자 (주식)</h2>

      <Card className="!bg-gradient-to-r from-purple-500 to-purple-600 !border-none text-white">
        <p className="text-purple-200 text-sm">나의 투자 현황</p>
        <p className="text-3xl font-bold mt-1">
          {totalCurrent}{currency}
        </p>
        <p className={`text-sm mt-1 ${totalPnL >= 0 ? 'text-green-300' : 'text-red-300'}`}>
          {totalPnL >= 0 ? '▲' : '▼'} {Math.abs(totalPnL)}{currency}
          ({totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(1) : 0}%)
        </p>
      </Card>

      {myHoldings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">보유 종목</h3>
          <div className="space-y-2">
            {myHoldings.map((holding) => {
              const pnl = (holding.currentPrice - holding.avgPrice) * holding.quantity
              return (
                <Card key={holding.stockId} padding="sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{holding.stockName}</h4>
                      <p className="text-xs text-text-tertiary">{holding.quantity}주 · 평균 {holding.avgPrice}{currency}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{holding.currentPrice * holding.quantity}{currency}</p>
                      <p className={`text-xs font-medium ${pnl >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                        {pnl >= 0 ? '+' : ''}{pnl}{currency}
                      </p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">전체 종목</h3>
        <div className="space-y-3">
          {demoStocks.map((stock) => {
            const change = stock.currentPrice - stock.previousPrice
            const changePercent = ((change / stock.previousPrice) * 100).toFixed(1)
            return (
              <Card
                key={stock.id}
                hover
                padding="sm"
                className="cursor-pointer"
                onClick={() => setSelectedStock(stock)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{stock.emoji}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{stock.name}</h4>
                    <p className="text-xs text-text-tertiary mt-0.5">{stock.factor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{stock.currentPrice}{currency}</p>
                    <Badge variant={change >= 0 ? 'accent' : 'danger'}>
                      {change >= 0 ? '▲' : '▼'} {Math.abs(change)} ({changePercent}%)
                    </Badge>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={!!selectedStock}
        onClose={() => {
          setSelectedStock(null)
          setQuantity('1')
        }}
        title={selectedStock?.name}
        size="lg"
      >
        {selectedStock && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-4xl">{selectedStock.emoji}</span>
              <p className="text-2xl font-bold mt-2">{selectedStock.currentPrice}{currency}</p>
              <Badge
                variant={
                  selectedStock.currentPrice >= selectedStock.previousPrice ? 'accent' : 'danger'
                }
              >
                {selectedStock.currentPrice >= selectedStock.previousPrice ? '▲' : '▼'}{' '}
                {Math.abs(selectedStock.currentPrice - selectedStock.previousPrice)}{currency}
              </Badge>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedStock.history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '13px' }}
                    formatter={(value) => [`${value}${currency}`, '가격']}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-2 border-b border-border pb-3">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  tradeType === 'buy' ? 'bg-accent-500 text-white' : 'bg-surface-tertiary'
                }`}
              >
                매수
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  tradeType === 'sell' ? 'bg-danger-500 text-white' : 'bg-surface-tertiary'
                }`}
              >
                매도
              </button>
            </div>

            <Input
              label="수량"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />

            <div className="bg-surface-tertiary rounded-xl p-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">총 금액</span>
                <span className="font-bold">{selectedStock.currentPrice * Number(quantity)}{currency}</span>
              </div>
            </div>

            <Button
              className="w-full"
              variant={tradeType === 'buy' ? 'accent' : 'danger'}
              onClick={() => {
                const action = tradeType === 'buy' ? '매수' : '매도'
                toast.success(`${selectedStock.name} ${quantity}주 ${action} 완료!`)
                setSelectedStock(null)
                setQuantity('1')
              }}
            >
              {tradeType === 'buy' ? '매수하기' : '매도하기'}
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
