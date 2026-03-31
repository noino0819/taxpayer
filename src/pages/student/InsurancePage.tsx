import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const insuranceProducts = [
  {
    id: '1',
    name: '고용보험',
    emoji: '💼',
    description: '직업을 잃었을 때 실업급여를 지급받습니다.',
    premium: 2,
    payout: '실업 시 월급의 50% (최대 3개월)',
    paymentType: '월납',
    condition: '직업 상실 시',
  },
  {
    id: '2',
    name: '체육 취소 보험',
    emoji: '⚽',
    description: '비/날씨 등으로 체육 수업이 취소될 경우 보상을 받습니다.',
    premium: 1,
    payout: '체육 취소 시 3미소 지급',
    paymentType: '월납',
    condition: '체육 수업 취소 시',
  },
]

const myContracts = [
  { id: 'c1', insuranceName: '고용보험', status: 'active', startDate: '2026-03-15', monthlyCost: 2 },
]

export function InsurancePage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedInsurance, setSelectedInsurance] = useState<typeof insuranceProducts[0] | null>(null)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🛡️ 보험</h2>

      <Card className="!bg-gradient-to-r from-cyan-50 to-cyan-100 !border-cyan-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚠️</span>
          <span className="text-sm font-semibold text-cyan-700">보험 안내</span>
        </div>
        <p className="text-xs text-cyan-600">
          보험은 미래의 불확실한 위험에 대비하는 방법입니다.
          매달 적은 보험료를 내고, 만약의 상황이 생기면 보험금을 받을 수 있어요.
          하지만 보험금을 받는 상황이 오지 않는 것이 가장 좋다는 것을 기억하세요!
        </p>
      </Card>

      {myContracts.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">가입한 보험</h3>
          <div className="space-y-3">
            {myContracts.map((contract) => (
              <Card key={contract.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{contract.insuranceName}</h4>
                      <Badge variant="accent">보장 중</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      가입일: {contract.startDate}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary-600">
                    월 {contract.monthlyCost}{currency}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">보험 상품</h3>
        <div className="space-y-3">
          {insuranceProducts.map((insurance) => {
            const isJoined = myContracts.some((c) => c.insuranceName === insurance.name)
            return (
              <Card
                key={insurance.id}
                hover
                padding="sm"
                className="cursor-pointer"
                onClick={() => setSelectedInsurance(insurance)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{insurance.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{insurance.name}</h4>
                      {isJoined && <Badge variant="accent">가입 완료</Badge>}
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{insurance.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary-600">월 {insurance.premium}{currency}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal
        isOpen={!!selectedInsurance}
        onClose={() => setSelectedInsurance(null)}
        title={selectedInsurance?.name}
      >
        {selectedInsurance && (
          <div className="space-y-4">
            <div className="text-center text-5xl">{selectedInsurance.emoji}</div>
            <p className="text-sm text-text-secondary text-center">{selectedInsurance.description}</p>

            <div className="bg-surface-tertiary rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">보험료</span>
                <span className="font-bold">월 {selectedInsurance.premium}{currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">보험금</span>
                <span className="font-medium">{selectedInsurance.payout}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">납부 방식</span>
                <span className="font-medium">{selectedInsurance.paymentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">보장 조건</span>
                <span className="font-medium">{selectedInsurance.condition}</span>
              </div>
            </div>

            <div className="bg-warning-50 rounded-xl p-3">
              <p className="text-xs text-warning-500">
                📋 <strong>약관 확인:</strong> 보험에 가입하면 매월 보험료가 자동으로 통장에서 차감됩니다.
                보장 조건이 충족되면 교사 확인 후 보험금이 지급됩니다.
              </p>
            </div>

            {myContracts.some((c) => c.insuranceName === selectedInsurance.name) ? (
              <div className="bg-accent-50 rounded-xl p-3 text-center">
                <p className="text-sm text-accent-700 font-medium">이미 가입한 보험입니다</p>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  toast.success(`${selectedInsurance.name}에 가입했습니다!`)
                  setSelectedInsurance(null)
                }}
              >
                가입하기 (월 {selectedInsurance.premium}{currency})
              </Button>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
