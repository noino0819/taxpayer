import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import {
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const demoStats = {
  totalStudents: 28,
  totalCurrency: 3640,
  avgBalance: 130,
  activeJobs: 12,
  pendingFines: 3,
  giniIndex: 0.32,
}

const recentTransactions = [
  { id: 1, student: '김영희', type: 'income', amount: 30, desc: '월급 지급 (은행원)', time: '10분 전' },
  { id: 2, student: '이철수', type: 'expense', amount: 5, desc: '소득세 원천징수', time: '10분 전' },
  { id: 3, student: '박지민', type: 'expense', amount: 3, desc: '마트 구매 - 과자', time: '25분 전' },
  { id: 4, student: '최수정', type: 'income', amount: 25, desc: '월급 지급 (경찰)', time: '30분 전' },
  { id: 5, student: '정우성', type: 'expense', amount: 10, desc: '자리 임대료', time: '1시간 전' },
]

export function DashboardPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">교사 대시보드</h1>
        <p className="text-text-secondary mt-1">
          {currentClassroom?.school} {currentClassroom?.grade}학년 {currentClassroom?.class_num}반 경제 현황
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">전체 학생</p>
              <p className="text-2xl font-bold mt-1">{demoStats.totalStudents}명</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineUserGroup className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">총 통화량</p>
              <p className="text-2xl font-bold mt-1">
                {demoStats.totalCurrency.toLocaleString()}
                <span className="text-sm font-normal text-text-tertiary ml-1">{currency}</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-accent-600" />
            </div>
          </div>
          <p className="text-xs text-text-tertiary mt-2">평균 잔액: {demoStats.avgBalance}{currency}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">활성 직업</p>
              <p className="text-2xl font-bold mt-1">{demoStats.activeJobs}개</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5 text-warning-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">대기 중 벌금</p>
              <p className="text-2xl font-bold mt-1">{demoStats.pendingFines}건</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-danger-500" />
            </div>
          </div>
          <Badge variant="warning" size="sm">승인 필요</Badge>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">최근 거래 내역</h3>
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.type === 'income' ? 'bg-accent-100 text-accent-600' : 'bg-danger-100 text-danger-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.student}</p>
                    <p className="text-xs text-text-tertiary">{tx.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-accent-600' : 'text-danger-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {tx.amount}
                    {currency}
                  </p>
                  <p className="text-xs text-text-tertiary">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">학급 경제 건강도</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary">양극화 지수 (지니계수)</span>
                <span className="font-medium">{demoStats.giniIndex}</span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-400 rounded-full transition-all"
                  style={{ width: `${demoStats.giniIndex * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-tertiary mt-1">0.3 이하: 양호 | 0.4 이상: 주의</p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">초대 코드</h4>
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary-600 tracking-widest">
                  {currentClassroom?.invite_code}
                </p>
                <p className="text-xs text-text-tertiary mt-1">학생에게 이 코드를 알려주세요</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-2">운영 모드</h4>
              <Badge variant="primary" size="md">
                {currentClassroom?.economy_mode === 'auto'
                  ? '완전 자동'
                  : currentClassroom?.economy_mode === 'semi'
                    ? '반자동 (추천)'
                    : '완전 수동'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
