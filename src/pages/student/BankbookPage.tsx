import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import { useMyAccount, useMyTransactions, useMonthlyStats } from '@/hooks/useQueries'
import type { TransactionCategory } from '@/types/database'

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

      <Card className="!bg-gradient-to-r !from-primary-500 !to-primary-600 !border-0 text-white">
        <p className="text-primary-100 text-sm">{user?.name}님의 잔액</p>
        <p className="text-3xl font-bold mt-1">
          {(account?.balance ?? 0).toLocaleString()}
          <span className="text-base font-normal text-primary-200 ml-1">{currency}</span>
        </p>
        <div className="flex gap-6 mt-3 text-sm">
          <div>
            <span className="text-primary-200">이달 수입</span>
            <p className="font-semibold">+{monthlyStats?.income ?? 0}{currency}</p>
          </div>
          <div>
            <span className="text-primary-200">이달 지출</span>
            <p className="font-semibold">-{monthlyStats?.expense ?? 0}{currency}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {(['all', 'income', 'expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            {f === 'all' ? '전체' : f === 'income' ? '수입' : '지출'}
          </button>
        ))}
      </div>

      <Card>
        {filtered.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-6">거래 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                      tx.type === 'income' ? 'bg-accent-100 text-accent-600' : 'bg-danger-100 text-danger-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
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
                  className={`text-sm font-bold ${
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
