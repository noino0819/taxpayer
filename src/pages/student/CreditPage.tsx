import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useMyAccount } from '@/hooks/useQueries'
import { CREDIT_GRADES } from '@/lib/constants'

export function CreditPage() {
  const { data: account } = useMyAccount()

  const currentGrade = CREDIT_GRADES.find((g) => g.grade === (account?.credit_grade ?? 3))
  const score = account?.credit_score ?? 800

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📊 신용등급</h2>

      <Card className="text-center py-6">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-tertiary" />
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke={currentGrade?.color ?? '#3B82F6'}
              strokeWidth="3"
              strokeDasharray={`${(score / 1000) * 88} 88`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: currentGrade?.color }}>{score}</span>
            <span className="text-xs text-text-tertiary">/ 1000</span>
          </div>
        </div>
        <Badge variant="primary" size="md">
          {currentGrade?.grade ?? '-'}등급 ({currentGrade?.label ?? '보통'})
        </Badge>
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">등급별 혜택</h3>
        <div className="space-y-2.5">
          {CREDIT_GRADES.map((grade) => (
            <div
              key={grade.grade}
              className={`p-3 rounded-xl border ${
                grade.grade === (account?.credit_grade ?? 3) ? 'border-primary-300 bg-primary-50' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: grade.color }} />
                  <span className="font-semibold text-sm">{grade.grade}등급 ({grade.label})</span>
                </div>
                <span className="text-xs text-text-tertiary">{grade.min}~{grade.max}점</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
