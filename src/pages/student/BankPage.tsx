import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { HiOutlineBuildingLibrary } from 'react-icons/hi2'
import toast from 'react-hot-toast'

const savingsProducts = [
  { id: '1', name: '자유 적금', interestRate: 3, type: '단리', minTerm: '제한 없음', condition: '언제든 입출금 가능', emoji: '🏦' },
  { id: '2', name: '정기 적금 (1개월)', interestRate: 5, type: '단리', minTerm: '1개월', condition: '만기까지 출금 불가', emoji: '📅' },
  { id: '3', name: '정기 적금 (2개월)', interestRate: 8, type: '단리', minTerm: '2개월', condition: '만기까지 출금 불가', emoji: '📆' },
  { id: '4', name: '복리 적금 (특별)', interestRate: 5, type: '복리', minTerm: '2개월', condition: '신용 1~2등급만 가입 가능', emoji: '💎' },
]

const mySavings = [
  { id: 's1', product: '자유 적금', principal: 30, startDate: '2026-03-10', interestEarned: 1, status: 'active' },
  { id: 's2', product: '정기 적금 (1개월)', principal: 50, startDate: '2026-03-15', maturityDate: '2026-04-15', interestEarned: 0, status: 'active' },
]

export function BankPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedProduct, setSelectedProduct] = useState<typeof savingsProducts[0] | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [showCalc, setShowCalc] = useState(false)
  const [calcPrincipal, setCalcPrincipal] = useState('100')
  const [calcRate, setCalcRate] = useState('5')
  const [calcYears, setCalcYears] = useState('1')

  const simpleInterest = Math.floor(Number(calcPrincipal) * (Number(calcRate) / 100) * Number(calcYears))
  const compoundInterest = Math.floor(
    Number(calcPrincipal) * Math.pow(1 + Number(calcRate) / 100, Number(calcYears)) - Number(calcPrincipal),
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🏦 은행</h2>
        <Button variant="secondary" size="sm" onClick={() => setShowCalc(true)}>
          이자 계산기
        </Button>
      </div>

      {mySavings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">나의 저축</h3>
          <div className="space-y-3">
            {mySavings.map((saving) => (
              <Card key={saving.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{saving.product}</h4>
                      <Badge variant="accent">운영중</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">
                      가입일: {saving.startDate}
                      {saving.maturityDate && ` · 만기: ${saving.maturityDate}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-600">{saving.principal}{currency}</p>
                    <p className="text-xs text-accent-600">+{saving.interestEarned}{currency} 이자</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">저축 상품</h3>
        <div className="space-y-3">
          {savingsProducts.map((product) => (
            <Card
              key={product.id}
              hover
              padding="sm"
              className="cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{product.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{product.name}</h4>
                    <Badge variant={product.type === '복리' ? 'warning' : 'primary'}>
                      {product.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-tertiary mt-1">{product.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">연 {product.interestRate}%</p>
                  <p className="text-xs text-text-tertiary">{product.minTerm}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!selectedProduct}
        onClose={() => {
          setSelectedProduct(null)
          setDepositAmount('')
        }}
        title={selectedProduct?.name}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="text-center text-4xl">{selectedProduct.emoji}</div>
            <div className="bg-surface-tertiary rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">이자율</span>
                <span className="font-bold text-primary-600">연 {selectedProduct.interestRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">이자 방식</span>
                <span className="font-medium">{selectedProduct.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">최소 기간</span>
                <span className="font-medium">{selectedProduct.minTerm}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">조건</span>
                <span className="font-medium">{selectedProduct.condition}</span>
              </div>
            </div>
            <Input
              label={`예치금 (${currency})`}
              type="number"
              placeholder="예치할 금액을 입력하세요"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            {depositAmount && Number(depositAmount) > 0 && (
              <div className="bg-accent-50 rounded-xl p-3 text-center">
                <p className="text-sm text-accent-700">
                  예상 이자: <strong>{Math.floor(Number(depositAmount) * selectedProduct.interestRate / 100)}{currency}</strong> (1개월 후)
                </p>
              </div>
            )}
            <Button
              className="w-full"
              onClick={() => {
                toast.success(`${selectedProduct.name}에 ${depositAmount}${currency}를 예치했습니다!`)
                setSelectedProduct(null)
                setDepositAmount('')
              }}
              disabled={!depositAmount || Number(depositAmount) <= 0}
            >
              가입하기
            </Button>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showCalc}
        onClose={() => setShowCalc(false)}
        title="단리 vs 복리 계산기"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            같은 금액을 같은 이자율로 저축하면, 단리와 복리의 차이가 얼마나 될까요?
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label={`원금 (${currency})`}
              type="number"
              value={calcPrincipal}
              onChange={(e) => setCalcPrincipal(e.target.value)}
            />
            <Input
              label="이자율 (%)"
              type="number"
              value={calcRate}
              onChange={(e) => setCalcRate(e.target.value)}
            />
            <Input
              label="기간 (개월)"
              type="number"
              value={calcYears}
              onChange={(e) => setCalcYears(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <HiOutlineBuildingLibrary className="w-8 h-8 text-primary-500 mx-auto mb-2" />
              <h4 className="font-semibold text-primary-700">단리</h4>
              <p className="text-xs text-text-secondary mt-1">원금에 대해서만 이자 계산</p>
              <p className="text-2xl font-bold text-primary-600 mt-3">
                +{simpleInterest}{currency}
              </p>
              <p className="text-sm text-text-secondary">
                합계: {Number(calcPrincipal) + simpleInterest}{currency}
              </p>
            </div>
            <div className="bg-accent-50 rounded-xl p-4 text-center">
              <span className="text-3xl block mb-1">💎</span>
              <h4 className="font-semibold text-accent-700">복리</h4>
              <p className="text-xs text-text-secondary mt-1">원금+이자에 이자를 더함</p>
              <p className="text-2xl font-bold text-accent-600 mt-3">
                +{compoundInterest}{currency}
              </p>
              <p className="text-sm text-text-secondary">
                합계: {Number(calcPrincipal) + compoundInterest}{currency}
              </p>
            </div>
          </div>
          {compoundInterest > simpleInterest && (
            <div className="bg-warning-50 rounded-xl p-3 text-center">
              <p className="text-sm text-warning-500 font-medium">
                복리가 단리보다 <strong>{compoundInterest - simpleInterest}{currency}</strong> 더 많아요! 눈덩이 효과!
              </p>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  )
}
