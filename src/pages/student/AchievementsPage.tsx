import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { useMyAccount, useMyTransactions, useMyHoldings, useMySavings, useMyJobAssignment } from '@/hooks/useQueries'

interface AchievementDef {
  id: string
  emoji: string
  name: string
  description: string
  condition: string
  check: (ctx: AchievementCtx) => boolean
}

interface AchievementCtx {
  balance: number
  transactionCount: number
  holdingCount: number
  savingsCount: number
  hasJob: boolean
}

const achievements: AchievementDef[] = [
  { id: '1', emoji: '💰', name: '첫 월급', description: '첫 번째 월급을 받았어요!', condition: '거래 1회 이상', check: (c) => c.transactionCount >= 1 },
  { id: '2', emoji: '🏦', name: '저축왕', description: '적금 상품에 가입했어요!', condition: '적금 1개 이상', check: (c) => c.savingsCount >= 1 },
  { id: '3', emoji: '📈', name: '투자 시작', description: '주식을 처음 구매했어요!', condition: '보유 종목 1개 이상', check: (c) => c.holdingCount >= 1 },
  { id: '4', emoji: '💼', name: '취업 성공', description: '직업을 구했어요!', condition: '직업 배정', check: (c) => c.hasJob },
  { id: '5', emoji: '💵', name: '부자의 꿈', description: '잔액 200 이상 달성!', condition: '잔액 200 이상', check: (c) => c.balance >= 200 },
  { id: '6', emoji: '🔥', name: '거래 달인', description: '거래 20회 이상!', condition: '거래 20회', check: (c) => c.transactionCount >= 20 },
  { id: '7', emoji: '🌟', name: '분산 투자', description: '3개 이상 종목 보유!', condition: '보유 종목 3개', check: (c) => c.holdingCount >= 3 },
  { id: '8', emoji: '🎯', name: '알뜰 저축러', description: '적금 3개 이상 가입!', condition: '적금 3개', check: (c) => c.savingsCount >= 3 },
]

export function AchievementsPage() {
  const { data: account } = useMyAccount()
  const { data: transactions } = useMyTransactions(50)
  const { data: holdings } = useMyHoldings()
  const { data: savings } = useMySavings()
  const { data: jobAssignment } = useMyJobAssignment()

  const ctx: AchievementCtx = {
    balance: account?.balance ?? 0,
    transactionCount: transactions?.length ?? 0,
    holdingCount: holdings?.length ?? 0,
    savingsCount: savings?.length ?? 0,
    hasJob: !!jobAssignment,
  }

  const earned = achievements.filter((a) => a.check(ctx))
  const notEarned = achievements.filter((a) => !a.check(ctx))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🏆 성취 배지</h2>
        <span className="text-sm text-text-secondary">{earned.length}/{achievements.length}</span>
      </div>

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
            <Card key={badge.id} padding="sm" className="text-center opacity-60 h-full">
              <span className="text-4xl grayscale">{badge.emoji}</span>
              <h4 className="font-bold text-sm mt-2">{badge.name}</h4>
              <p className="text-xs text-text-tertiary mt-1">{badge.condition}</p>
            </Card>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
