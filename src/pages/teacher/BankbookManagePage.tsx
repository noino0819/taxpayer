import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { HiOutlinePlusCircle, HiOutlineMinusCircle, HiOutlineBanknotes } from 'react-icons/hi2'
import toast from 'react-hot-toast'

const demoStudents = [
  { id: '1', name: '김영희', avatar: '🐶', balance: 152 },
  { id: '2', name: '이철수', avatar: '🐱', balance: 98 },
  { id: '3', name: '박지민', avatar: '🐰', balance: 134 },
  { id: '4', name: '최수정', avatar: '🐻', balance: 76 },
  { id: '5', name: '정우성', avatar: '🦊', balance: 45 },
  { id: '6', name: '한예슬', avatar: '🐼', balance: 201 },
  { id: '7', name: '강다니엘', avatar: '🐯', balance: 88 },
  { id: '8', name: '송혜교', avatar: '🦁', balance: 167 },
]

export function BankbookManagePage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const selectAll = () => {
    setSelectedStudents(demoStudents.map((s) => s.id))
  }

  const handleTransfer = () => {
    if (selectedStudents.length === 0) {
      toast.error('학생을 선택해주세요.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('금액을 입력해주세요.')
      return
    }
    const action = transferType === 'deposit' ? '입금' : '출금'
    toast.success(`${selectedStudents.length}명에게 ${amount}${currency} ${action} 완료!`)
    setShowTransferModal(false)
    setSelectedStudents([])
    setAmount('')
    setDescription('')
  }

  const totalBalance = demoStudents.reduce((sum, s) => sum + s.balance, 0)
  const avgBalance = Math.round(totalBalance / demoStudents.length)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">통장 관리</h1>
          <p className="text-text-secondary text-sm mt-1">학급 전체 입출금 관리</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="accent"
            icon={<HiOutlinePlusCircle className="w-5 h-5" />}
            onClick={() => {
              setTransferType('deposit')
              setShowTransferModal(true)
            }}
          >
            입금
          </Button>
          <Button
            variant="danger"
            icon={<HiOutlineMinusCircle className="w-5 h-5" />}
            onClick={() => {
              setTransferType('withdraw')
              setShowTransferModal(true)
            }}
          >
            출금
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">총 통화량</p>
              <p className="text-xl font-bold">{totalBalance.toLocaleString()}{currency}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">평균 잔액</p>
              <p className="text-xl font-bold">{avgBalance}{currency}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">학생 수</p>
              <p className="text-xl font-bold">{demoStudents.length}명</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">학생별 잔액</h3>
        <div className="space-y-2">
          {demoStudents
            .sort((a, b) => b.balance - a.balance)
            .map((student, idx) => (
              <div
                key={student.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-tertiary transition-colors"
              >
                <span className="w-6 text-center text-sm text-text-tertiary font-medium">{idx + 1}</span>
                <span className="text-2xl">{student.avatar}</span>
                <span className="font-medium flex-1">{student.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-surface-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-400 rounded-full"
                      style={{ width: `${(student.balance / 250) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">
                    {student.balance}{currency}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </Card>

      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title={transferType === 'deposit' ? '일괄 입금' : '일괄 출금'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-secondary">학생 선택</label>
              <button onClick={selectAll} className="text-xs text-primary-500 font-medium">
                전체 선택
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {demoStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-sm transition-colors text-left ${
                    selectedStudents.includes(student.id)
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-border hover:bg-surface-tertiary'
                  }`}
                >
                  <span>{student.avatar}</span>
                  <span className="font-medium">{student.name}</span>
                </button>
              ))}
            </div>
          </div>
          <Input
            label={`금액 (${currency})`}
            type="number"
            placeholder="입금할 금액"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Input
            label="사유"
            placeholder="예: 월급 지급, 세금 징수"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            className="w-full"
            variant={transferType === 'deposit' ? 'accent' : 'danger'}
            onClick={handleTransfer}
          >
            {transferType === 'deposit' ? '입금 처리' : '출금 처리'} ({selectedStudents.length}명)
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
