import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Tooltip } from '@/components/common/Tooltip'
import { useAuthStore } from '@/stores/authStore'
import {
  useAccountStats,
  useStocks,
  useSetStockPrice,
  useCloseMarketDay,
} from '@/hooks/useQueries'
import {
  HiOutlineInformationCircle,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import type { Stock } from '@/types/database'

export function EconomyPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const { data: stats } = useAccountStats()
  const { data: stocks } = useStocks()
  const setStockPriceMutation = useSetStockPrice()
  const closeMarketMutation = useCloseMarketDay()

  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [newPrice, setNewPrice] = useState('')

  const avgStockPrice = stocks && stocks.length > 0
    ? Math.round(stocks.reduce((s, st) => s + st.current_price, 0) / stocks.length)
    : 0

  const prevAvg = stocks && stocks.length > 0
    ? Math.round(stocks.reduce((s, st) => s + st.previous_price, 0) / stocks.length)
    : 0
  const kospiChange = avgStockPrice - prevAvg
  const kospiPercent = prevAvg > 0 ? ((kospiChange / prevAvg) * 100).toFixed(1) : '0.0'

  const handleSetPrice = async () => {
    if (!editingStock || !newPrice) return
    const price = Number(newPrice)
    if (price < 1) {
      toast.error('가격은 1 이상이어야 합니다.')
      return
    }
    try {
      await setStockPriceMutation.mutateAsync({ stockId: editingStock.id, newPrice: price })
      toast.success(`${editingStock.name} 가격을 ${price}${currency}(으)로 변경했습니다.`)
      setEditingStock(null)
      setNewPrice('')
    } catch {
      toast.error('가격 변경에 실패했습니다.')
    }
  }

  const handleCloseMarket = async () => {
    try {
      await closeMarketMutation.mutateAsync()
      toast.success('하루 마감 완료! 등락률이 초기화되었습니다.')
    } catch {
      toast.error('마감 처리에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">경제 현황</h1>
        <p className="text-text-secondary text-sm mt-1 font-bold">학급 경제 지표 및 물가 변동 추이</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-text-secondary font-bold">평균 잔액</p>
          <p className="text-2xl font-bold mt-1">{stats?.avgBalance ?? 0}{currency}</p>
          <Badge variant="primary">{stats?.studentCount ?? 0}명</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary font-bold">총 통화량</p>
          <p className="text-2xl font-bold mt-1">{(stats?.totalBalance ?? 0).toLocaleString()}{currency}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary font-bold inline-flex items-center gap-1">
            학급 코스피
            <Tooltip content="학급 내 모든 주식 종목의 현재가 평균입니다. 학생들의 매수/매도에 따라 실시간으로 변동되며, 교사가 직접 가격을 조정할 수도 있습니다.">
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
            </Tooltip>
          </p>
          <p className="text-2xl font-bold mt-1">{avgStockPrice}</p>
          <div className="flex items-center gap-2">
            <Badge variant="accent">{stocks?.length ?? 0}종목</Badge>
            {kospiChange !== 0 && (
              <span className={`text-xs font-medium ${kospiChange >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                {kospiChange >= 0 ? '▲' : '▼'} {Math.abs(kospiChange)} ({kospiPercent}%)
              </span>
            )}
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary font-bold inline-flex items-center gap-1">
            양극화 지수
            <Tooltip content="지니계수는 학급 내 자산 불평등 정도를 0~1 사이 숫자로 나타냅니다. 0에 가까울수록 자산이 고르게 분포, 1에 가까울수록 소수에게 편중되어 있습니다. 0.3 이하면 양호, 0.4 이상이면 주의가 필요합니다.">
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
            </Tooltip>
          </p>
          <p className="text-2xl font-bold mt-1">{stats?.giniIndex ?? 0}</p>
          <Badge variant={(stats?.giniIndex ?? 0) <= 0.3 ? 'accent' : 'warning'}>
            {(stats?.giniIndex ?? 0) <= 0.3 ? '양호' : '주의'}
          </Badge>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">주식 종목 관리</h3>
          <Button
            variant="secondary"
            size="sm"
            icon={<HiOutlineArrowPath className="w-4 h-4" />}
            onClick={handleCloseMarket}
            isLoading={closeMarketMutation.isPending}
          >
            하루 마감
          </Button>
        </div>
        <p className="text-xs text-text-tertiary mb-4">
          학생이 매수하면 가격이 오르고, 매도하면 내립니다. 종목을 클릭해서 교사가 직접 가격을 조정할 수도 있습니다.
          &lsquo;하루 마감&rsquo; 버튼을 누르면 등락률이 초기화됩니다.
        </p>
        {(!stocks || stocks.length === 0) ? (
          <p className="text-text-tertiary text-sm text-center py-4">주식 종목이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {stocks.map((stock) => {
              const change = stock.current_price - stock.previous_price
              const changePercent = stock.previous_price > 0
                ? ((change / stock.previous_price) * 100).toFixed(1)
                : '0.0'
              return (
                <div
                  key={stock.id}
                  onClick={() => {
                    setEditingStock(stock)
                    setNewPrice(String(stock.current_price))
                  }}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-light hover:bg-surface-tertiary cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      change > 0 ? 'bg-accent-100 text-accent-600'
                        : change < 0 ? 'bg-danger-100 text-danger-500'
                          : 'bg-surface-tertiary text-text-tertiary'
                    }`}>
                      {change > 0 ? '▲' : change < 0 ? '▼' : '-'}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{stock.name}</p>
                      <p className="text-xs text-text-tertiary">{stock.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-sm">{stock.current_price}{currency}</p>
                      <p className={`text-xs font-medium ${
                        change > 0 ? 'text-accent-600' : change < 0 ? 'text-danger-500' : 'text-text-tertiary'
                      }`}>
                        {change > 0 ? '+' : ''}{change} ({changePercent}%)
                      </p>
                    </div>
                    <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-text-tertiary" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal
        isOpen={!!editingStock}
        onClose={() => { setEditingStock(null); setNewPrice('') }}
        title="주식 가격 조정"
        size="sm"
      >
        {editingStock && (
          <div className="space-y-4">
            <div className="bg-surface-tertiary rounded-xl p-4 text-center">
              <p className="font-semibold">{editingStock.name}</p>
              <p className="text-xs text-text-tertiary mt-1">{editingStock.description}</p>
              <p className="text-2xl font-bold mt-2">{editingStock.current_price}{currency}</p>
            </div>
            <Input
              label={`새 가격 (${currency})`}
              type="number"
              placeholder="가격을 입력하세요"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            {newPrice && Number(newPrice) > 0 && (
              <p className="text-sm text-text-secondary text-center">
                {editingStock.current_price} → {newPrice}{currency}
                {' '}
                <span className={`font-medium ${
                  Number(newPrice) > editingStock.current_price ? 'text-accent-600'
                    : Number(newPrice) < editingStock.current_price ? 'text-danger-500'
                      : 'text-text-tertiary'
                }`}>
                  ({Number(newPrice) >= editingStock.current_price ? '+' : ''}
                  {(((Number(newPrice) - editingStock.current_price) / editingStock.current_price) * 100).toFixed(1)}%)
                </span>
              </p>
            )}
            <Button
              className="w-full"
              onClick={handleSetPrice}
              isLoading={setStockPriceMutation.isPending}
            >
              가격 변경
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
