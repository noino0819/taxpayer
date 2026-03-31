import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'

type FilterType = 'all' | 'income' | 'expense'

const transactions = [
  { id: 1, type: 'income' as const, category: 'salary', amount: 30, desc: '월급 (은행원)', date: '2026-03-28', counterpart: '학급 계좌' },
  { id: 2, type: 'expense' as const, category: 'tax', amount: 3, desc: '소득세 원천징수', date: '2026-03-28', counterpart: '국세청' },
  { id: 3, type: 'expense' as const, category: 'consumption', amount: 2, desc: '마트 구매 - 연필', date: '2026-03-27', counterpart: '학급 마트' },
  { id: 4, type: 'income' as const, category: 'bonus', amount: 5, desc: '아르바이트 보수', date: '2026-03-26', counterpart: '학급 계좌' },
  { id: 5, type: 'expense' as const, category: 'rent', amount: 5, desc: '자리 임대료 (월세)', date: '2026-03-25', counterpart: '박지민' },
  { id: 6, type: 'expense' as const, category: 'consumption', amount: 3, desc: '일기 면제권 구매', date: '2026-03-24', counterpart: '학급 마트' },
  { id: 7, type: 'income' as const, category: 'interest', amount: 2, desc: '정기적금 이자', date: '2026-03-22', counterpart: '학급 은행' },
  { id: 8, type: 'expense' as const, category: 'insurance', amount: 2, desc: '고용보험료 납부', date: '2026-03-20', counterpart: '보험사' },
  { id: 9, type: 'income' as const, category: 'salary', amount: 30, desc: '월급 (은행원)', date: '2026-03-14', counterpart: '학급 계좌' },
  { id: 10, type: 'expense' as const, category: 'tax', amount: 3, desc: '소득세 원천징수', date: '2026-03-14', counterpart: '국세청' },
]

const categoryLabels: Record<string, string> = {
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
  insurance: '보험료',
  other_expense: '기타지출',
}

export function BankbookPage() {
  const { currentClassroom } = useAuthStore()
  const [filter, setFilter] = useState<FilterType>('all')
  const currency = currentClassroom?.currency_name || '미소'

  const filteredTx = transactions.filter((tx) => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <Card className="!bg-gradient-to-br from-primary-500 to-primary-700 !border-none text-white">
        <p className="text-primary-200 text-sm">💰 나의 통장</p>
        <p className="text-4xl font-bold mt-2">
          127<span className="text-xl font-normal ml-1">{currency}</span>
        </p>
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xs text-primary-200">이번 달 수입</p>
            <p className="text-lg font-bold mt-0.5">+{totalIncome}{currency}</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-xs text-primary-200">이번 달 지출</p>
            <p className="text-lg font-bold mt-0.5">-{totalExpense}{currency}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-2">
        {([['all', '전체'], ['income', '수입'], ['expense', '지출']] as const).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Card padding="sm">
        <AnimatePresence mode="popLayout">
          {filteredTx.map((tx) => (
            <motion.div
              key={tx.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-3 border-b border-border-light last:border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    tx.type === 'income'
                      ? 'bg-accent-100 text-accent-600'
                      : 'bg-danger-100 text-danger-500'
                  }`}
                >
                  {tx.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.desc}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="neutral" size="sm">{categoryLabels[tx.category]}</Badge>
                    <span className="text-xs text-text-tertiary">{tx.date}</span>
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
            </motion.div>
          ))}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
