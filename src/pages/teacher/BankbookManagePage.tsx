import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { useAllAccounts, useAccountStats, useBatchDeposit, useBatchWithdraw } from '@/hooks/useQueries'
import { HiOutlinePlusCircle, HiOutlineMinusCircle, HiOutlineBanknotes } from 'react-icons/hi2'
import toast from 'react-hot-toast'

export function BankbookManagePage() {
  const { currentClassroom, user } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const { data: accounts, isLoading, isError } = useAllAccounts()
  const { data: stats } = useAccountStats()
  const batchDepositMutation = useBatchDeposit()
  const batchWithdrawMutation = useBatchWithdraw()

  const students = (accounts ?? []).map((acc: any) => ({
    id: acc.user_id,
    name: acc.user?.name ?? '알 수 없음',
    avatar: acc.user?.avatar_preset_id ?? '😊',
    balance: acc.balance,
    accountId: acc.id,
  }))

  const hasStudents = students.length > 0

  const toggleStudent = (id: string) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    )
  }

  const selectAll = () => {
    setSelectedStudents(students.map((s: any) => s.id))
  }

  const handleTransfer = async () => {
    if (selectedStudents.length === 0) {
      toast.error('학생을 선택해주세요.')
      return
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('금액을 입력해주세요.')
      return
    }

    try {
      const params = {
        userIds: selectedStudents,
        amount: Number(amount),
        description: description || (transferType === 'deposit' ? '교사 입금' : '교사 출금'),
        approvedBy: user!.id,
      }

      if (transferType === 'deposit') {
        await batchDepositMutation.mutateAsync(params)
      } else {
        await batchWithdrawMutation.mutateAsync(params)
      }

      const action = transferType === 'deposit' ? '입금' : '출금'
      toast.success(`${selectedStudents.length}명에게 ${amount}${currency} ${action} 완료!`)
      setShowTransferModal(false)
      setSelectedStudents([])
      setAmount('')
      setDescription('')
    } catch {
      toast.error('처리에 실패했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <div className="w-8 h-8 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin mb-4" />
        <p className="text-sm">통장 데이터를 불러오는 중...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
        <p className="text-lg font-semibold text-danger-500 mb-2">데이터를 불러올 수 없습니다</p>
        <p className="text-sm">네트워크 상태를 확인하고 다시 시도해주세요.</p>
      </div>
    )
  }

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
            onClick={() => { setTransferType('deposit'); setShowTransferModal(true) }}
            disabled={!hasStudents}
          >
            입금
          </Button>
          <Button
            variant="danger"
            icon={<HiOutlineMinusCircle className="w-5 h-5" />}
            onClick={() => { setTransferType('withdraw'); setShowTransferModal(true) }}
            disabled={!hasStudents}
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
              <p className="text-xl font-bold">{(stats?.totalBalance ?? 0).toLocaleString()}{currency}</p>
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
              <p className="text-xl font-bold">{stats?.avgBalance ?? 0}{currency}</p>
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
              <p className="text-xl font-bold">{stats?.studentCount ?? 0}명</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">학생별 잔액</h3>
        <div className="space-y-2">
          {students.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">학생이 없습니다.</p>
          )}
          {students
            .sort((a: any, b: any) => b.balance - a.balance)
            .map((student: any, idx: number) => (
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
                      style={{ width: `${Math.min((student.balance / (stats?.avgBalance ? stats.avgBalance * 2 : 250)) * 100, 100)}%` }}
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
              {students.length === 0 ? (
                <p className="col-span-2 text-sm text-text-tertiary text-center py-4">
                  학급에 등록된 학생이 없습니다.
                </p>
              ) : (
                students.map((student: any) => (
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
                ))
              )}
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
            isLoading={batchDepositMutation.isPending || batchWithdrawMutation.isPending}
          >
            {transferType === 'deposit' ? '입금 처리' : '출금 처리'} ({selectedStudents.length}명)
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
