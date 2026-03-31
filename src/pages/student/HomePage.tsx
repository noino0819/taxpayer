import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import { useMyAccount, useMyTransactions, useMonthlyStats, useMyJobAssignment } from '@/hooks/useQueries'
import { CREDIT_GRADES } from '@/lib/constants'
import {
  HiOutlineBriefcase,
  HiOutlineShoppingCart,
  HiOutlineBuildingLibrary,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineHomeModern,
} from 'react-icons/hi2'

const quickActions = [
  { label: '직업', to: '/student/jobs', icon: HiOutlineBriefcase, bg: 'bg-gradient-to-br from-blue-100 to-blue-50', iconColor: 'text-blue-600' },
  { label: '마트', to: '/student/mart', icon: HiOutlineShoppingCart, bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50', iconColor: 'text-emerald-600' },
  { label: '은행', to: '/student/bank', icon: HiOutlineBuildingLibrary, bg: 'bg-gradient-to-br from-amber-100 to-amber-50', iconColor: 'text-amber-600' },
  { label: '투자', to: '/student/investment', icon: HiOutlineChartBarSquare, bg: 'bg-gradient-to-br from-rose-100 to-rose-50', iconColor: 'text-rose-600' },
  { label: '보험', to: '/student/insurance', icon: HiOutlineShieldCheck, bg: 'bg-gradient-to-br from-violet-100 to-violet-50', iconColor: 'text-violet-600' },
  { label: '부동산', to: '/student/real-estate', icon: HiOutlineHomeModern, bg: 'bg-gradient-to-br from-teal-100 to-teal-50', iconColor: 'text-teal-600' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export function HomePage() {
  const navigate = useNavigate()
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  useEffect(() => {
    if (user?.must_change_password) {
      navigate('/student/change-password', { replace: true })
    }
  }, [user?.must_change_password, navigate])

  const { data: account } = useMyAccount()
  const { data: transactions } = useMyTransactions(5)
  const { data: monthlyStats } = useMonthlyStats()
  const { data: jobAssignment } = useMyJobAssignment()

  const creditInfo = CREDIT_GRADES.find((g) => g.grade === (account?.credit_grade ?? 3))

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" size="sm">{creditInfo?.grade ?? '-'}등급</Badge>
            {jobAssignment && <Badge variant="accent" size="sm">{jobAssignment.job.name}</Badge>}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-400" />
              <span className="text-sm text-text-secondary">수입 <span className="font-bold text-accent-600">+{monthlyStats?.income ?? 0}</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-danger-400" />
              <span className="text-sm text-text-secondary">지출 <span className="font-bold text-danger-500">-{monthlyStats?.expense ?? 0}</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <h3 className="text-sm font-bold text-text-secondary mb-3">바로가기</h3>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.93 }}
              onClick={() => navigate(action.to)}
              className={`flex flex-col items-center gap-2 py-5 px-2 rounded-2xl border border-border/40 active:border-primary-300 transition-all ${action.bg}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <action.icon className={`w-6 h-6 ${action.iconColor}`} />
              </div>
              <span className="text-xs font-bold text-text-primary">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <h3 className="font-bold mb-4">최근 거래</h3>
          {(!transactions || transactions.length === 0) ? (
            <div className="text-center py-6">
              <span className="text-3xl">📭</span>
              <p className="text-sm text-text-tertiary mt-2">아직 거래 내역이 없어요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                        tx.type === 'income'
                          ? 'bg-accent-100 text-accent-600'
                          : 'bg-danger-100 text-danger-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.description}</p>
                      <p className="text-xs text-text-tertiary">
                        {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-extrabold ${
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
    </motion.div>
  )
}
