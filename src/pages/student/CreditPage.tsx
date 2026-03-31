import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { CREDIT_GRADES } from '@/lib/constants'

const myCreditScore = 820
const myCreditGrade = 2

const scoreHistory = [
  { date: '2026-03-28', change: +10, reason: '과제 기한 내 제출', score: 820 },
  { date: '2026-03-25', change: +5, reason: '세금 정시 납부', score: 810 },
  { date: '2026-03-22', change: -15, reason: '과제 미제출', score: 805 },
  { date: '2026-03-20', change: +10, reason: '직업 성실 수행 (주간 평가)', score: 820 },
  { date: '2026-03-18', change: +5, reason: '자격증 취득 (독서 인증)', score: 810 },
  { date: '2026-03-15', change: -10, reason: '벌금 부과 (교실 뛰기)', score: 805 },
]

const gradeEffects = [
  { grade: 1, effects: ['예금 이자율 최대', '모든 직업 지원 가능', '대출 이자율 최저'] },
  { grade: 2, effects: ['이자율 우대', '대부분 직업 지원 가능'] },
  { grade: 3, effects: ['기본 이자율 적용'] },
  { grade: 4, effects: ['일부 직업 지원 제한', '대출 이자율 상승'] },
  { grade: 5, effects: ['직업 지원 대폭 제한', '대출 불가', '이자율 최저'] },
]

export function CreditPage() {
  const creditInfo = CREDIT_GRADES.find((g) => g.grade === myCreditGrade)!
  const scorePercentage = myCreditScore / 1000

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📊 신용 등급</h2>

      <Card className="!bg-gradient-to-br from-primary-600 to-primary-800 !border-none text-white">
        <div className="text-center py-4">
          <p className="text-primary-200 text-sm">나의 신용 점수</p>
          <div className="relative w-40 h-40 mx-auto my-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="8"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke={creditInfo.color}
                strokeWidth="8"
                strokeDasharray={`${scorePercentage * 264} 264`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{myCreditScore}</span>
              <span className="text-sm text-primary-200">/ 1000</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: creditInfo.color }}
            />
            <span className="text-lg font-bold">
              {creditInfo.grade}등급 ({creditInfo.label})
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">등급별 혜택/불이익</h3>
        <div className="space-y-3">
          {CREDIT_GRADES.map((grade) => {
            const effects = gradeEffects.find((g) => g.grade === grade.grade)
            const isMyGrade = grade.grade === myCreditGrade
            return (
              <div
                key={grade.grade}
                className={`p-3 rounded-xl border transition-colors ${
                  isMyGrade
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: grade.color }}
                  />
                  <span className="font-semibold text-sm">
                    {grade.grade}등급 ({grade.label})
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {grade.min}~{grade.max}점
                  </span>
                  {isMyGrade && <Badge variant="primary">현재</Badge>}
                </div>
                <div className="flex gap-1 flex-wrap mt-1">
                  {effects?.effects.map((eff) => (
                    <Badge key={eff} variant="neutral">{eff}</Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">최근 점수 변동</h3>
        <div className="space-y-2.5">
          {scoreHistory.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 border-b border-border-light last:border-0">
              <div>
                <p className="text-sm font-medium">{item.reason}</p>
                <p className="text-xs text-text-tertiary">{item.date}</p>
              </div>
              <span
                className={`text-sm font-bold ${
                  item.change > 0 ? 'text-accent-600' : 'text-danger-500'
                }`}
              >
                {item.change > 0 ? '+' : ''}{item.change}점
              </span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
