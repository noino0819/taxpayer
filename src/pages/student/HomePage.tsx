import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { useAuthStore } from '@/stores/authStore'
import { useMyAccount, useMyTransactions, useMonthlyStats } from '@/hooks/useQueries'
import { CREDIT_GRADES } from '@/lib/constants'
import {
  HiOutlineBriefcase,
  HiOutlineShoppingCart,
  HiOutlineBuildingLibrary,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineBanknotes,
} from 'react-icons/hi2'

const quickActions = [
  { label: '직업', to: '/student/jobs', icon: HiOutlineBriefcase, color: 'bg-primary-100 text-primary-600' },
  { label: '마트', to: '/student/mart', icon: HiOutlineShoppingCart, color: 'bg-accent-100 text-accent-600' },
  { label: '은행', to: '/student/bank', icon: HiOutlineBuildingLibrary, color: 'bg-warning-100 text-warning-500' },
  { label: '투자', to: '/student/investment', icon: HiOutlineChartBarSquare, color: 'bg-danger-100 text-danger-500' },
  { label: '보험', to: '/student/insurance', icon: HiOutlineShieldCheck, color: 'bg-primary-100 text-primary-600' },
  { label: '통장', to: '/student/bankbook', icon: HiOutlineBanknotes, color: 'bg-accent-100 text-accent-600' },
]

export function HomePage() {
  const navigate = useNavigate()
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  const { data: account } = useMyAccount()
  const { data: transactions } = useMyTransactions(5)
  const { data: monthlyStats } = useMonthlyStats()

  const creditInfo = CREDIT_GRADES.find((g) => g.grade === (account?.credit_grade ?? 3))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <Card className="!bg-gradient-to-br !from-primary-500 !to-primary-700 !border-0 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-primary-100 text-sm">내 잔액</p>
            <p className="text-3xl font-bold mt-0.5">
              {(account?.balance ?? 0).toLocaleString()}
              <span className="text-lg font-normal text-primary-200 ml-1">{currency}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-200 text-xs">신용등급</p>
            <p className="text-lg font-bold">{creditInfo?.grade ?? '-'}등급</p>
            <p className="text-xs text-primary-200">{creditInfo?.label}</p>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-primary-200">이달 수입 </span>
            <span className="font-semibold">+{monthlyStats?.income ?? 0}{currency}</span>
          </div>
          <div>
            <span className="text-primary-200">이달 지출 </span>
            <span className="font-semibold">-{monthlyStats?.expense ?? 0}{currency}</span>
          </div>
        </div>
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
        <h3 className="font-semibold mb-3">최근 거래</h3>
        {(!transactions || transactions.length === 0) ? (
          <p className="text-sm text-text-tertiary text-center py-3">아직 거래 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      tx.type === 'income' ? 'bg-accent-100 text-accent-600' : 'bg-danger-100 text-danger-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.type === 'income' ? 'text-accent-600' : 'text-danger-500'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {tx.amount}{currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
