import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { useNavigate } from 'react-router-dom'
import { CREDIT_GRADES } from '@/lib/constants'
import {
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
  HiOutlineBriefcase,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineBuildingLibrary,
} from 'react-icons/hi2'

const demoAccount = {
  balance: 127,
  credit_score: 820,
  credit_grade: 2 as const,
}

const recentTx = [
  { id: 1, type: 'income', amount: 30, desc: '월급 (은행원)', date: '3/28' },
  { id: 2, type: 'expense', amount: 3, desc: '소득세', date: '3/28' },
  { id: 3, type: 'expense', amount: 2, desc: '마트 - 연필', date: '3/27' },
  { id: 4, type: 'income', amount: 5, desc: '아르바이트', date: '3/26' },
  { id: 5, type: 'expense', amount: 5, desc: '자리 임대료', date: '3/25' },
]

export function HomePage() {
  const { user, currentClassroom } = useAuthStore()
  const { isEnabled } = useModuleStore()
  const navigate = useNavigate()
  const currency = currentClassroom?.currency_name || '미소'
  const creditInfo = CREDIT_GRADES.find((g) => g.grade === demoAccount.credit_grade)

  const quickActions = [
    { icon: HiOutlineBanknotes, label: '통장', to: '/student/bankbook', color: 'bg-primary-100 text-primary-600', show: true },
    { icon: HiOutlineShoppingBag, label: '마트', to: '/student/mart', color: 'bg-accent-100 text-accent-600', show: isEnabled('mart') },
    { icon: HiOutlineBriefcase, label: '직업', to: '/student/jobs', color: 'bg-warning-100 text-warning-500', show: isEnabled('job') },
    { icon: HiOutlineChartBarSquare, label: '투자', to: '/student/investment', color: 'bg-purple-100 text-purple-600', show: isEnabled('investment') },
    { icon: HiOutlineShieldCheck, label: '보험', to: '/student/insurance', color: 'bg-cyan-100 text-cyan-600', show: isEnabled('insurance') },
    { icon: HiOutlineBuildingLibrary, label: '은행', to: '/student/bank', color: 'bg-amber-100 text-amber-600', show: isEnabled('bank') },
  ].filter((a) => a.show)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <Card className="!bg-gradient-to-r from-primary-500 to-primary-600 !border-none text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-100 text-sm">내 잔액</p>
            <p className="text-3xl font-bold mt-1">
              {demoAccount.balance.toLocaleString()}
              <span className="text-lg font-normal ml-1">{currency}</span>
            </p>
          </div>
          <div className="text-5xl">{user?.avatar_preset_id || '😊'}</div>
        </div>
        {isEnabled('credit') && creditInfo && (
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: creditInfo.color }}
            />
            <span className="text-sm text-primary-100">
              신용 {creditInfo.grade}등급 ({creditInfo.label}) · {demoAccount.credit_score}점
            </span>
          </div>
        )}
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">바로가기</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.to)}
              className="flex flex-col items-center gap-1.5 py-4 px-2 bg-surface rounded-2xl border border-border active:bg-surface-tertiary transition-colors min-h-[80px]"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-text-primary">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">최근 거래</h3>
          <button
            onClick={() => navigate('/student/bankbook')}
            className="text-xs text-primary-500 font-medium"
          >
            전체보기
          </button>
        </div>
        <div className="space-y-2.5">
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    tx.type === 'income'
                      ? 'bg-accent-100 text-accent-600'
                      : 'bg-danger-100 text-danger-500'
                  }`}
                >
                  {tx.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.desc}</p>
                  <p className="text-xs text-text-tertiary">{tx.date}</p>
                </div>
              </div>
              <span
                className={`text-sm font-semibold ${
                  tx.type === 'income' ? 'text-accent-600' : 'text-danger-500'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}
                {tx.amount}
                {currency}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">이번 달 요약</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-accent-50 rounded-xl p-3 text-center">
            <p className="text-xs text-accent-600 font-medium">수입</p>
            <p className="text-lg font-bold text-accent-700 mt-1">+35{currency}</p>
          </div>
          <div className="bg-danger-50 rounded-xl p-3 text-center">
            <p className="text-xs text-danger-500 font-medium">지출</p>
            <p className="text-lg font-bold text-danger-600 mt-1">-10{currency}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
