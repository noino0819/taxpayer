import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Tooltip } from '@/components/common/Tooltip'
import { useAuthStore } from '@/stores/authStore'
import { useAccountStats, useStocks } from '@/hooks/useQueries'
import { HiOutlineInformationCircle } from 'react-icons/hi2'

export function EconomyPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const { data: stats } = useAccountStats()
  const { data: stocks } = useStocks()

  const avgStockPrice = stocks && stocks.length > 0
    ? Math.round(stocks.reduce((s, st) => s + st.current_price, 0) / stocks.length)
    : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">경제 현황</h1>
        <p className="text-text-secondary text-sm mt-1">학급 경제 지표 및 물가 변동 추이</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-text-secondary">평균 잔액</p>
          <p className="text-2xl font-bold mt-1">{stats?.avgBalance ?? 0}{currency}</p>
          <Badge variant="primary">{stats?.studentCount ?? 0}명</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">총 통화량</p>
          <p className="text-2xl font-bold mt-1">{(stats?.totalBalance ?? 0).toLocaleString()}{currency}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">학급 코스피</p>
          <p className="text-2xl font-bold mt-1">{avgStockPrice}</p>
          <Badge variant="accent">{stocks?.length ?? 0}종목</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary inline-flex items-center gap-1">
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
        <h3 className="font-semibold mb-4">주식 종목 현황</h3>
        {(!stocks || stocks.length === 0) ? (
          <p className="text-text-tertiary text-sm text-center py-4">주식 종목이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {stocks.map((stock) => {
              const change = stock.current_price - stock.previous_price
              const changePercent = stock.previous_price > 0
                ? ((change / stock.previous_price) * 100).toFixed(1)
                : '0.0'
              return (
                <div key={stock.id} className="flex items-center justify-between p-3 border-b border-border-light last:border-0">
                  <div>
                    <p className="font-medium text-sm">{stock.name}</p>
                    <p className="text-xs text-text-tertiary">{stock.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{stock.current_price}{currency}</p>
                    <p className={`text-xs font-medium ${change >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                      {change >= 0 ? '+' : ''}{change} ({changePercent}%)
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
