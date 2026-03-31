import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface Seat {
  row: number
  col: number
  label: string
  owner: string | null
  resident: string | null
  price: number
  rentPrice: number
  isOwned: boolean
  isMine: boolean
  isTeacherFixed: boolean
}

const ROWS = 5
const COLS = 6

const demoSeats: Seat[] = Array.from({ length: ROWS * COLS }, (_, i) => {
  const row = Math.floor(i / COLS)
  const col = i % COLS
  const names = ['김영희', '이철수', '박지민', '최수정', '정우성', '한예슬', '강다니엘', '송혜교', '유재석', '김민지']
  const ownerIdx = Math.random() > 0.6 ? Math.floor(Math.random() * names.length) : -1
  const residentIdx = Math.floor(Math.random() * names.length)
  const isMine = row === 2 && col === 3
  const isTeacherFixed = row === 0 && col === 0

  return {
    row,
    col,
    label: `${row + 1}-${col + 1}`,
    owner: isMine ? '나' : ownerIdx >= 0 ? names[ownerIdx] : null,
    resident: isMine ? '나' : names[residentIdx],
    price: 20 + Math.floor(Math.random() * 30),
    rentPrice: 3 + Math.floor(Math.random() * 5),
    isOwned: isMine || ownerIdx >= 0,
    isMine,
    isTeacherFixed,
  }
})

function getSeatColor(seat: Seat): string {
  if (seat.isTeacherFixed) return 'bg-gray-200 border-gray-300'
  if (seat.isMine) return 'bg-accent-100 border-accent-400'
  if (!seat.isOwned) return 'bg-warning-100 border-warning-300'
  return 'bg-primary-100 border-primary-300'
}

export function RealEstatePage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🏠 부동산 (자리)</h2>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-accent-100 border border-accent-400" />
          <span className="text-xs">내 자리</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-warning-100 border border-warning-300" />
          <span className="text-xs">판매 중</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-primary-100 border border-primary-300" />
          <span className="text-xs">다른 사람 소유</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gray-200 border border-gray-300" />
          <span className="text-xs">교사 지정석</span>
        </div>
      </div>

      <Card>
        <div className="mb-3 text-center">
          <Badge variant="neutral">칠판</Badge>
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {demoSeats.map((seat) => (
            <motion.button
              key={seat.label}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedSeat(seat)}
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 text-center transition-all hover:shadow-md ${getSeatColor(seat)}`}
            >
              <span className="text-[10px] font-bold">{seat.label}</span>
              <span className="text-[9px] text-text-secondary truncate w-full">
                {seat.resident || '-'}
              </span>
              {seat.isOwned && (
                <span className="text-[8px] text-text-tertiary">
                  {seat.owner === '나' ? '내꺼' : seat.owner}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-sm text-text-secondary">내가 소유한 자리</p>
          <p className="text-2xl font-bold mt-1">1개</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary">이번 달 임대 수입</p>
          <p className="text-2xl font-bold mt-1 text-accent-600">+0{currency}</p>
        </Card>
      </div>

      <Modal
        isOpen={!!selectedSeat}
        onClose={() => setSelectedSeat(null)}
        title={`자리 ${selectedSeat?.label}`}
      >
        {selectedSeat && (
          <div className="space-y-4">
            <div className="bg-surface-tertiary rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">소유자</span>
                <span className="font-medium">{selectedSeat.owner || '없음 (판매 중)'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">거주자</span>
                <span className="font-medium">{selectedSeat.resident || '비어 있음'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">매매 가격</span>
                <span className="font-bold text-primary-600">{selectedSeat.price}{currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">월세</span>
                <span className="font-medium">{selectedSeat.rentPrice}{currency}/월</span>
              </div>
            </div>

            {!selectedSeat.isOwned && !selectedSeat.isTeacherFixed && (
              <Button
                className="w-full"
                onClick={() => {
                  toast.success(`자리 ${selectedSeat.label}을(를) 구매했습니다!`)
                  setSelectedSeat(null)
                }}
              >
                구매하기 ({selectedSeat.price}{currency})
              </Button>
            )}
            {selectedSeat.isMine && (
              <div className="bg-accent-50 rounded-xl p-3 text-center">
                <p className="text-sm text-accent-700 font-medium">내가 소유한 자리입니다</p>
              </div>
            )}
            {selectedSeat.isTeacherFixed && (
              <div className="bg-gray-100 rounded-xl p-3 text-center">
                <p className="text-sm text-text-secondary">교사 지정 고정석입니다</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
