import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import { useMyAccount, useMyTransactions, useMonthlyStats } from '@/hooks/useQueries'
import type { TransactionCategory } from '@/types/database'
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2'

const categoryLabels: Record<TransactionCategory, string> = {
  salary: '월급',
  investment: '투자',
  interest: '이자',
  business: '사업',
  bonus: '보너스',
  other_income: '기타수입',
  tax: '세금',
  consumption: '소비',
  fine: '벌금',
  rent: '임대료',
  insurance: '보험',
  other_expense: '기타지출',
}

const categoryEmojis: Partial<Record<TransactionCategory, string>> = {
  salary: '💰',
  investment: '📈',
  interest: '🏦',
  business: '🏪',
  bonus: '🎁',
  tax: '📋',
  consumption: '🛒',
  fine: '⚖️',
  rent: '🏠',
  insurance: '🛡️',
}

export function BankbookPage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const { data: account } = useMyAccount()
  const { data: transactions } = useMyTransactions(50)
  const { data: monthlyStats } = useMonthlyStats()

  const filtered = (transactions ?? []).filter((tx) => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">💰 내 통장</h2>

      <Card className="!bg-gradient-to-br !from-primary-600 !via-primary-500 !to-primary-700 !border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        <div className="relative">
          <p className="text-primary-200 text-sm font-medium">{user?.name}님의 잔액</p>
          <p className="text-4xl font-extrabold mt-1.5 tracking-tight">
            {(account?.balance ?? 0).toLocaleString()}
            <span className="text-base font-semibold text-primary-200 ml-1">{currency}</span>
          </p>
          <div className="flex gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <HiOutlineArrowTrendingUp className="w-4 h-4 text-accent-300" />
              </div>
              <div>
                <span className="text-primary-300 text-[10px] block leading-none">이달 수입</span>
                <p className="font-bold text-sm">+{monthlyStats?.income ?? 0}{currency}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                <HiOutlineArrowTrendingDown className="w-4 h-4 text-danger-300" />
              </div>
              <div>
                <span className="text-primary-300 text-[10px] block leading-none">이달 지출</span>
                <p className="font-bold text-sm">-{monthlyStats?.expense ?? 0}{currency}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              filter === f
                ? 'bg-primary-500 text-white shadow-[0_2px_8px_rgba(82,179,56,0.3)]'
                : 'bg-surface border border-border/60 text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            {f === 'all' ? '전체' : f === 'income' ? '📥 수입' : '📤 지출'}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl">📭</span>
            <p className="text-sm text-text-tertiary mt-2">거래 내역이 없어요</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-1">
              {filtered.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between py-3 border-b border-border-light/60 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-base ${
                        tx.type === 'income' ? 'bg-accent-100' : 'bg-danger-100'
                      }`}
                    >
                      {categoryEmojis[tx.category] ?? (tx.type === 'income' ? '💵' : '💸')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="neutral" size="sm">
                          {categoryLabels[tx.category] ?? tx.category}
                        </Badge>
                        <span className="text-xs text-text-tertiary">
                          {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
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
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </Card>
    </motion.div>
  )
}
