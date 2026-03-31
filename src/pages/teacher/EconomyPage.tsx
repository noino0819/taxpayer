import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'

export function EconomyPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">경제 현황</h1>
        <p className="text-text-secondary text-sm mt-1">학급 경제 지표 및 물가 변동 추이</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-text-secondary">학급 물가지수</p>
          <p className="text-2xl font-bold mt-1">102.3</p>
          <Badge variant="warning">+2.3%</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">기준금리</p>
          <p className="text-2xl font-bold mt-1">3.5%</p>
          <Badge variant="primary">한국은행 연동</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">학급 코스피</p>
          <p className="text-2xl font-bold mt-1">1,245</p>
          <Badge variant="accent">+1.2%</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">양극화 지수</p>
          <p className="text-2xl font-bold mt-1">0.32</p>
          <Badge variant="accent">양호</Badge>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">물가 변동 추이</h3>
        <div className="h-64 flex items-center justify-center bg-surface-tertiary rounded-xl">
          <p className="text-text-tertiary">📊 물가 변동 그래프 (Recharts로 구현 예정)</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">최근 경제 이벤트</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-2">
              <span className="text-lg">📈</span>
              <div>
                <p className="text-sm font-medium">소비자물가 상승</p>
                <p className="text-xs text-text-tertiary">CPI 연동으로 마트 상품 가격 2% 인상</p>
                <p className="text-xs text-text-tertiary">3일 전</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-2">
              <span className="text-lg">🏦</span>
              <div>
                <p className="text-sm font-medium">기준금리 동결</p>
                <p className="text-xs text-text-tertiary">한국은행 기준금리 3.5% 유지</p>
                <p className="text-xs text-text-tertiary">1주 전</p>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">세금 수입/지출</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border-b border-border-light">
              <span className="text-sm text-text-secondary">이번 달 소득세 수입</span>
              <span className="text-sm font-semibold text-accent-600">+84{currency}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-border-light">
              <span className="text-sm text-text-secondary">이번 달 벌금 수입</span>
              <span className="text-sm font-semibold text-accent-600">+15{currency}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="text-sm text-text-secondary">학급 공동 기금 잔액</span>
              <span className="text-sm font-bold text-primary-600">342{currency}</span>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
