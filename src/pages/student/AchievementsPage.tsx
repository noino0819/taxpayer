import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'

const achievements = [
  { id: '1', name: '첫 월급', emoji: '💰', description: '첫 번째 월급을 수령했어요!', condition: '첫 번째 월급 수령', earned: true, earnedDate: '2026-03-10' },
  { id: '2', name: '저축왕', emoji: '🏆', description: '잔액 100미소를 달성했어요!', condition: '잔액 목표 100미소 달성', earned: true, earnedDate: '2026-03-25' },
  { id: '3', name: '성실 납세자', emoji: '📋', description: '3개월 연속 세금 정시 납부', condition: '3개월 연속 세금 정시 납부', earned: false, progress: 1, total: 3 },
  { id: '4', name: '투자 시작', emoji: '📈', description: '처음으로 주식을 구매했어요!', condition: '첫 주식 구매', earned: true, earnedDate: '2026-03-20' },
  { id: '5', name: '사업가', emoji: '🏪', description: '마트 사업자로 등록했어요!', condition: '마트 사업자 등록', earned: false },
  { id: '6', name: '신용 최고', emoji: '⭐', description: '신용 1등급을 달성했어요!', condition: '신용 1등급 달성', earned: false },
  { id: '7', name: '보험 마스터', emoji: '🛡️', description: '보험 가입 후 보험금을 수령', condition: '보험금 수령 경험', earned: false },
  { id: '8', name: '부동산 소유자', emoji: '🏠', description: '처음으로 자리를 구매했어요!', condition: '첫 자리 구매', earned: false },
  { id: '9', name: '첫 소비', emoji: '🛒', description: '마트에서 첫 물건을 구매했어요!', condition: '첫 마트 구매', earned: true, earnedDate: '2026-03-12' },
  { id: '10', name: '자격증 보유자', emoji: '📜', description: '첫 번째 자격증을 취득했어요!', condition: '자격증 1개 취득', earned: true, earnedDate: '2026-03-18' },
  { id: '11', name: '근면한 직업인', emoji: '👷', description: '직업을 4주 연속 성실 수행', condition: '4주 연속 직업 성실 수행', earned: false, progress: 2, total: 4 },
  { id: '12', name: '경제 박사', emoji: '🎓', description: '경제 퀴즈 5회 만점!', condition: '경제 퀴즈 5회 만점', earned: false, progress: 0, total: 5 },
]

export function AchievementsPage() {
  const earned = achievements.filter((a) => a.earned)
  const notEarned = achievements.filter((a) => !a.earned)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">🏅 성취 배지</h2>
        <p className="text-sm text-text-tertiary mt-1">
          {earned.length}/{achievements.length}개 달성
        </p>
      </div>

      <Card className="!bg-gradient-to-r from-yellow-50 to-amber-50 !border-amber-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🏅</div>
          <div>
            <p className="text-sm text-amber-700 font-semibold">배지 수집 현황</p>
            <div className="flex gap-1 mt-2">
              {achievements.map((a) => (
                <span
                  key={a.id}
                  className={`text-lg ${a.earned ? '' : 'grayscale opacity-30'}`}
                  title={a.name}
                >
                  {a.emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {earned.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">획득한 배지</h3>
          <div className="grid grid-cols-2 gap-3">
            {earned.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.03 }}
              >
                <Card padding="sm" className="text-center h-full">
                  <span className="text-4xl">{badge.emoji}</span>
                  <h4 className="font-bold text-sm mt-2">{badge.name}</h4>
                  <p className="text-xs text-text-tertiary mt-1">{badge.description}</p>
                  <p className="text-[10px] text-accent-600 mt-2">{badge.earnedDate} 획득</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">도전 중인 배지</h3>
        <div className="grid grid-cols-2 gap-3">
          {notEarned.map((badge) => (
            <Card key={badge.id} padding="sm" className="text-center opacity-70 h-full">
              <span className="text-4xl grayscale">{badge.emoji}</span>
              <h4 className="font-bold text-sm mt-2">{badge.name}</h4>
              <p className="text-xs text-text-tertiary mt-1">{badge.condition}</p>
              {'progress' in badge && badge.progress !== undefined && badge.total && (
                <div className="mt-2">
                  <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${(badge.progress / badge.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    {badge.progress}/{badge.total}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
