import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
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
      toast.error('잔액이 부족합니다.')
      return
    }
    try {
      await purchaseMutation.mutateAsync({ seatId, buyerId: user.id, accountId: account.id })
      toast.success(`${label} 자리를 구매했습니다!`)
    } catch {
      toast.error('구매에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🏠 부동산 (자리)</h2>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">교실 자리 배치</h3>
          <Badge variant="primary">잔액: {account?.balance ?? 0}{currency}</Badge>
        </div>

        <div className="text-center mb-2 text-xs text-text-tertiary">👨‍🏫 칠판</div>
        <div className="bg-surface-tertiary rounded-xl p-3 overflow-x-auto">
          <div className="min-w-fit mx-auto" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`, gap: '8px' }}>
            {Array.from({ length: rows }, (_, r) =>
              Array.from({ length: cols }, (_, c) => {
                const seat = getSeat(r + 1, c + 1)
                if (!seat) return <div key={`${r}-${c}`} />

                const isMine = seat.owner_id === user?.id
                const isOccupied = !!seat.owner_id

                return (
                  <motion.button
                    key={seat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!isOccupied) handlePurchase(seat.id, seat.label, seat.price)
                    }}
                    disabled={isOccupied}
                    className={`p-2 rounded-xl border text-center text-xs transition-all min-h-[60px] ${
                      isMine
                        ? 'border-primary-400 bg-primary-100 text-primary-700'
                        : isOccupied
                          ? 'border-border bg-surface-tertiary text-text-tertiary'
                          : 'border-border bg-surface hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <p className="font-medium">{seat.label}</p>
                    {isMine && <p className="text-[10px]">내 자리</p>}
                    {isOccupied && !isMine && <p className="text-[10px]">{(seat as any).owner?.name ?? '소유됨'}</p>}
                    {!isOccupied && <p className="text-[10px] text-primary-600">{seat.price}{currency}</p>}
                  </motion.button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-3 text-xs text-text-tertiary justify-center">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-primary-100 border border-primary-400" />
            내 자리
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-surface-tertiary border border-border" />
            소유됨
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-surface border border-border" />
            구매 가능
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
