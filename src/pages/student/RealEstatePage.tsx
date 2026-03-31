import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { useAuthStore } from '@/stores/authStore'
import { useSeats, useMyAccount, usePurchaseSeat } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function RealEstatePage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  const { data: seats } = useSeats()
  const { data: account } = useMyAccount()
  const purchaseMutation = usePurchaseSeat()

  const rows = Math.max(1, ...(seats ?? []).map((s) => s.position_row))
  const cols = Math.max(1, ...(seats ?? []).map((s) => s.position_col))

  const getSeat = (row: number, col: number) =>
    (seats ?? []).find((s) => s.position_row === row && s.position_col === col)

  const handlePurchase = async (seatId: string, label: string, price: number) => {
    if (!user || !account) return
    if ((account.balance ?? 0) < price) {
      toast.error('잔액이 부족해요! 💸')
      return
    }
    try {
      await purchaseMutation.mutateAsync({ seatId, buyerId: user.id, accountId: account.id })
      toast.success(`${label} 자리를 구매했어요! 🏠`)
    } catch {
      toast.error('구매에 실패했어요.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🏠 부동산 (자리)</h2>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">교실 자리 배치</h3>
          <div className="bg-primary-100 rounded-2xl px-3 py-1.5">
            <span className="text-xs text-primary-600 font-bold">💰 {account?.balance ?? 0}{currency}</span>
          </div>
        </div>

        <div className="bg-gradient-to-b from-surface-tertiary to-surface rounded-2xl p-2 mb-3 text-center">
          <span className="text-xs text-text-tertiary font-medium">👨‍🏫 칠판</span>
        </div>

        <div className="bg-surface-tertiary rounded-2xl p-3 overflow-x-auto">
          <div
            className="min-w-fit mx-auto"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(64px, 1fr))`, gap: '8px' }}
          >
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const seat = getSeat(r + 1, c + 1)
                if (!seat) return <div key={`${r}-${c}`} />

                const isMine = seat.owner_id === user?.id
                const isOccupied = !!seat.owner_id

                return (
                  <motion.button
                    key={seat.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      if (!isOccupied) handlePurchase(seat.id, seat.label, seat.price)
                    }}
                    disabled={isOccupied}
                    className={`p-2.5 rounded-2xl border-2 text-center text-xs transition-all min-h-[68px] ${
                      isMine
                        ? 'border-primary-400 bg-gradient-to-br from-primary-100 to-primary-50 text-primary-700 shadow-[0_2px_8px_rgba(99,102,241,0.15)]'
                        : isOccupied
                          ? 'border-border/60 bg-surface-tertiary text-text-tertiary'
                          : 'border-border/40 bg-surface hover:border-primary-300 hover:bg-primary-50/50 hover:shadow-sm'
                    }`}
                  >
                    <p className="font-bold">{seat.label}</p>
                    {isMine && <p className="text-[10px] font-bold mt-0.5">🏠 내 자리</p>}
                    {isOccupied && !isMine && <p className="text-[10px] mt-0.5">{(seat as any).owner?.name ?? '소유됨'}</p>}
                    {!isOccupied && <p className="text-[10px] text-primary-600 font-bold mt-0.5">{seat.price}{currency}</p>}
                  </motion.button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-4 text-xs text-text-secondary justify-center">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 border-2 border-primary-400" />
            <span className="font-medium">내 자리</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg bg-surface-tertiary border-2 border-border/60" />
            <span className="font-medium">소유됨</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-lg bg-surface border-2 border-border/40" />
            <span className="font-medium">구매 가능</span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
