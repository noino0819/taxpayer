import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useMyAccount } from '@/hooks/useQueries'
import { CREDIT_GRADES } from '@/lib/constants'

export function CreditPage() {
  const { data: account } = useMyAccount()

  const currentGrade = CREDIT_GRADES.find((g) => g.grade === (account?.credit_grade ?? 3))
  const score = account?.credit_score ?? 800

  const gradeEmojis: Record<number, string> = { 1: '👑', 2: '⭐', 3: '🙂', 4: '⚠️', 5: '🚨' }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📊 신용등급</h2>

      <Card className="text-center py-8">
        <div className="relative w-36 h-36 mx-auto mb-5">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-surface-tertiary" />
            <motion.circle
              cx="18" cy="18" r="14" fill="none"
              stroke={currentGrade?.color ?? '#6366F1'}
              strokeWidth="2.5"
              strokeDasharray={`${(score / 1000) * 88} 88`}
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 88' }}
              animate={{ strokeDasharray: `${(score / 1000) * 88} 88` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-extrabold" style={{ color: currentGrade?.color }}>{score}</span>
            <span className="text-xs text-text-tertiary font-medium">/ 1000</span>
          </div>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="text-2xl">{gradeEmojis[currentGrade?.grade ?? 3]}</span>
          <Badge variant="primary" size="md">
            {currentGrade?.grade ?? '-'}등급 ({currentGrade?.label ?? '보통'})
          </Badge>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold mb-4">등급별 혜택</h3>
        <div className="space-y-2.5">
          {CREDIT_GRADES.map((grade) => {
            const isCurrentGrade = grade.grade === (account?.credit_grade ?? 3)
            return (
              <motion.div
                key={grade.grade}
                initial={false}
                animate={isCurrentGrade ? { scale: 1.02 } : { scale: 1 }}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrentGrade
                    ? 'border-primary-300 bg-gradient-to-r from-primary-50 to-surface shadow-[0_2px_8px_rgba(99,102,241,0.1)]'
                    : 'border-border/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{gradeEmojis[grade.grade]}</span>
                    <div>
                      <span className="font-bold text-sm">{grade.grade}등급 ({grade.label})</span>
                      {isCurrentGrade && <Badge variant="primary" size="sm">현재</Badge>}
                    </div>
                  </div>
                  <span className="text-xs text-text-tertiary font-medium">{grade.min}~{grade.max}점</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}
