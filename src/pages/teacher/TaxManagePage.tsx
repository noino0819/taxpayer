import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { HiOutlinePencilSquare, HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

const taxSettings = [
  { id: '1', name: '소득세', description: '월급 수령 시 자동 원천징수', rate: 10, unit: '%', target: '월급' },
  { id: '2', name: '자리 임대료', description: '소유하지 않은 자리 사용 시 매월 부과', rate: 5, unit: '미소', target: '월별' },
  { id: '3', name: '건강보험료', description: '건강 보험 가입비', rate: 2, unit: '미소', target: '월별' },
  { id: '4', name: '전기요금', description: '교실 시설 이용 대가', rate: 1, unit: '미소', target: '월별' },
]

const pendingFines = [
  { id: '1', offender: '정우성', reporter: '박지민(경찰)', reason: '교실 내 뛰기', amount: 5, date: '2026-03-31' },
  { id: '2', offender: '강다니엘', reporter: '김민지(경찰)', reason: '수업 방해', amount: 3, date: '2026-03-30' },
  { id: '3', offender: '유재석', reporter: '박지민(경찰)', reason: '폭언', amount: 10, date: '2026-03-29' },
]

const fineHistory = [
  { id: '4', offender: '이철수', reason: '수업 중 핸드폰 사용', amount: 5, status: 'approved', date: '2026-03-25' },
  { id: '5', offender: '김영희', reason: '과제 미제출 (3회)', amount: 3, status: 'approved', date: '2026-03-22' },
  { id: '6', offender: '정우성', reason: '지각', amount: 2, status: 'rejected', date: '2026-03-20' },
]

export function TaxManagePage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [editingTax, setEditingTax] = useState<typeof taxSettings[0] | null>(null)
  const [editRate, setEditRate] = useState('')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">세금 및 벌금 관리</h1>
        <p className="text-text-secondary text-sm mt-1">세금 설정 및 벌금 승인</p>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">세금 설정</h3>
        <div className="space-y-3">
          {taxSettings.map((tax) => (
            <div
              key={tax.id}
              className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-surface-tertiary transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{tax.name}</h4>
                  <Badge variant="neutral">{tax.target}</Badge>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">{tax.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary-600">
                  {tax.rate}{tax.unit === '%' ? '%' : currency}
                </span>
                <button
                  onClick={() => {
                    setEditingTax(tax)
                    setEditRate(String(tax.rate))
                  }}
                  className="p-1.5 hover:bg-surface-tertiary rounded-lg"
                >
                  <HiOutlinePencilSquare className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">벌금 승인 대기</h3>
          <Badge variant="danger">{pendingFines.length}건</Badge>
        </div>
        <div className="space-y-3">
          {pendingFines.map((fine) => (
            <div
              key={fine.id}
              className="flex items-center justify-between p-3 rounded-xl border border-warning-200 bg-warning-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{fine.offender}</span>
                  <Badge variant="danger">{fine.amount}{currency}</Badge>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{fine.reason}</p>
                <p className="text-xs text-text-tertiary mt-0.5">
                  신고자: {fine.reporter} · {fine.date}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toast.success(`${fine.offender}의 벌금이 승인되었습니다.`)}
                  className="p-2 bg-accent-100 rounded-lg hover:bg-accent-200 transition-colors"
                >
                  <HiOutlineCheckCircle className="w-5 h-5 text-accent-600" />
                </button>
                <button
                  onClick={() => toast.success(`${fine.offender}의 벌금이 거절되었습니다.`)}
                  className="p-2 bg-danger-100 rounded-lg hover:bg-danger-200 transition-colors"
                >
                  <HiOutlineXCircle className="w-5 h-5 text-danger-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">벌금 처리 내역</h3>
        <div className="space-y-2">
          {fineHistory.map((fine) => (
            <div
              key={fine.id}
              className="flex items-center justify-between p-3 border-b border-border-light last:border-0"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{fine.offender}</span>
                  <Badge variant={fine.status === 'approved' ? 'accent' : 'danger'}>
                    {fine.status === 'approved' ? '승인' : '거절'}
                  </Badge>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5">{fine.reason} · {fine.date}</p>
              </div>
              <span className="text-sm font-semibold">{fine.amount}{currency}</span>
            </div>
          ))}
        </div>
      </Card>

      <Modal
        isOpen={!!editingTax}
        onClose={() => setEditingTax(null)}
        title={`${editingTax?.name} 설정`}
      >
        {editingTax && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">{editingTax.description}</p>
            <Input
              label={`세율 (${editingTax.unit})`}
              type="number"
              value={editRate}
              onChange={(e) => setEditRate(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={() => {
                toast.success(`${editingTax.name} 세율이 ${editRate}${editingTax.unit}로 변경되었습니다.`)
                setEditingTax(null)
              }}
            >
              저장
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
