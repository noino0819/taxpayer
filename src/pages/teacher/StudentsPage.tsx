import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { useClassroomMembers, useAllAccounts, useDeposit, useWithdraw, usePendingMembers, useApproveStudent, useRejectStudent, useResetStudentPassword } from '@/hooks/useQueries'
import { CREDIT_GRADES } from '@/lib/constants'
import { HiOutlineMagnifyingGlass, HiOutlinePlusCircle, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineKey } from 'react-icons/hi2'
import toast from 'react-hot-toast'

export function StudentsPage() {
  const { currentClassroom } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [actionAmount, setActionAmount] = useState('')
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const currency = currentClassroom?.currency_name || '미소'

  const { data: members } = useClassroomMembers()
  const { data: accounts } = useAllAccounts()
  const { data: pendingMembers } = usePendingMembers()
  const depositMutation = useDeposit()
  const withdrawMutation = useWithdraw()
  const approveMutation = useApproveStudent()
  const rejectMutation = useRejectStudent()
  const resetPasswordMutation = useResetStudentPassword()

  const students = (members ?? [])
    .filter((m) => m.user?.role === 'student')
    .map((m) => {
      const acc = (accounts ?? []).find((a: any) => a.user_id === m.user_id)
      return {
        id: m.user_id,
        name: m.user?.name ?? '',
        avatar: m.user?.avatar_preset_id ?? '😊',
        balance: acc?.balance ?? 0,
        creditGrade: acc?.credit_grade ?? 3,
        accountId: acc?.id,
      }
    })

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeposit = async () => {
    if (!selectedStudent?.accountId || !actionAmount) return
    try {
      await depositMutation.mutateAsync({
        accountId: selectedStudent.accountId,
        amount: Number(actionAmount),
        description: '교사 수동 입금',
      })
      toast.success(`${selectedStudent.name}에게 ${actionAmount}${currency} 입금 완료`)
      setActionAmount('')
    } catch {
      toast.error('입금에 실패했습니다.')
    }
  }

  const handleWithdraw = async () => {
    if (!selectedStudent?.accountId || !actionAmount) return
    try {
      await withdrawMutation.mutateAsync({
        accountId: selectedStudent.accountId,
        amount: Number(actionAmount),
        description: '교사 수동 출금',
      })
      toast.success(`${selectedStudent.name}에게서 ${actionAmount}${currency} 출금 완료`)
      setActionAmount('')
    } catch {
      toast.error('출금에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">학생 관리</h1>
          <p className="text-text-secondary text-sm mt-1 font-bold">총 {students.length}명</p>
        </div>
        <Button icon={<HiOutlinePlusCircle className="w-5 h-5" />} onClick={() => setShowAddModal(true)}>
          학생 추가
        </Button>
      </div>

      <AnimatePresence>
        {(pendingMembers ?? []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-warning-50 border border-warning-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⏳</span>
                <h3 className="font-bold text-warning-800">
                  가입 승인 대기 ({pendingMembers!.length}명)
                </h3>
              </div>
              <div className="space-y-2">
                {pendingMembers!.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between bg-surface rounded-2xl px-4 py-3 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.user?.avatar_preset_id || '😊'}</span>
                      <div>
                        <p className="font-medium text-sm">{m.user?.name}</p>
                        <p className="text-xs text-text-tertiary">
                          {new Date(m.joined_at).toLocaleDateString('ko-KR')} 신청
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<HiOutlineXCircle className="w-4 h-4" />}
                        onClick={async () => {
                          try {
                            await rejectMutation.mutateAsync(m.id)
                            toast.success(`${m.user?.name}의 가입을 거절했습니다.`)
                          } catch {
                            toast.error('거절에 실패했습니다.')
                          }
                        }}
                        isLoading={rejectMutation.isPending}
                      >
                        거절
                      </Button>
                      <Button
                        size="sm"
                        icon={<HiOutlineCheckCircle className="w-4 h-4" />}
                        onClick={async () => {
                          try {
                            await approveMutation.mutateAsync({
                              membershipId: m.id,
                              userId: m.user_id,
                            })
                            toast.success(`${m.user?.name}의 가입을 승인했습니다!`)
                          } catch {
                            toast.error('승인에 실패했습니다.')
                          }
                        }}
                        isLoading={approveMutation.isPending}
                      >
                        승인
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Input
        placeholder="학생 이름 검색..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        icon={<HiOutlineMagnifyingGlass className="w-5 h-5" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((student) => {
          const creditInfo = CREDIT_GRADES.find((g) => g.grade === student.creditGrade)
          return (
            <Card
              key={student.id}
              hover
              padding="sm"
              className="cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{student.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{student.name}</h4>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-text-secondary font-bold">
                      {student.balance.toLocaleString()}{currency}
                    </span>
                    {creditInfo && (
                      <span className="text-xs" style={{ color: creditInfo.color }}>
                        {creditInfo.grade}등급
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <p className="text-text-tertiary text-sm col-span-2 text-center py-8">
            {students.length === 0 ? '아직 학생이 없습니다. 초대 코드를 공유하세요!' : '검색 결과가 없습니다.'}
          </p>
        )}
      </div>

      <Modal
        isOpen={!!selectedStudent}
        onClose={() => { setSelectedStudent(null); setActionAmount(''); setTempPassword(null) }}
        title={selectedStudent?.name}
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-5xl">{selectedStudent.avatar}</span>
              <h3 className="text-xl font-bold mt-2">{selectedStudent.name}</h3>
            </div>
            <div className="bg-surface-tertiary rounded-2xl p-4 space-y-3 border border-border/50">
              <div className="flex justify-between">
                <span className="text-text-secondary font-bold">잔액</span>
                <span className="font-bold">{selectedStudent.balance}{currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary font-bold">신용등급</span>
                <span className="font-bold">{selectedStudent.creditGrade}등급</span>
              </div>
            </div>
            <Input
              label={`금액 (${currency})`}
              type="number"
              placeholder="금액을 입력하세요"
              value={actionAmount}
              onChange={(e) => setActionAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleDeposit}
                isLoading={depositMutation.isPending}
              >
                입금
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleWithdraw}
                isLoading={withdrawMutation.isPending}
              >
                출금
              </Button>
            </div>

            <div className="border-t border-border pt-4">
              {tempPassword ? (
                <div className="bg-primary-50 rounded-2xl p-4 text-center border border-primary-200">
                  <p className="text-sm text-text-secondary mb-2 font-bold">임시 비밀번호가 발급되었습니다</p>
                  <p className="text-2xl font-bold text-primary-600 tracking-widest font-mono">{tempPassword}</p>
                  <p className="text-xs text-text-tertiary mt-2">학생에게 이 비밀번호를 알려주세요.<br />로그인 시 새 비밀번호로 변경됩니다.</p>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  icon={<HiOutlineKey className="w-4 h-4" />}
                  isLoading={resetPasswordMutation.isPending}
                  onClick={async () => {
                    try {
                      const pw = await resetPasswordMutation.mutateAsync(selectedStudent.id)
                      setTempPassword(pw)
                      toast.success('임시 비밀번호가 발급되었습니다.')
                    } catch {
                      toast.error('비밀번호 초기화에 실패했습니다.')
                    }
                  }}
                >
                  비밀번호 초기화
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="학생 추가">
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-2xl p-4 text-center border border-border/50">
            <p className="text-sm text-text-secondary mb-2 font-bold">학급 초대 코드를 학생에게 알려주세요</p>
            <p className="text-3xl font-bold text-primary-600 tracking-widest">
              {currentClassroom?.invite_code}
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 py-2">
            <p className="text-sm text-text-secondary font-bold">또는 QR 코드를 스캔하세요</p>
            <QRCodeSVG
              value={`${window.location.origin}/register/student?code=${currentClassroom?.invite_code || ''}`}
              size={160}
              level="M"
            />
          </div>
          <p className="text-xs text-text-tertiary text-center">
            학생이 QR을 스캔하거나 초대 코드를 입력하고 가입 신청하면,<br />
            선생님이 승인한 뒤 학급에 참여할 수 있습니다.
          </p>
        </div>
      </Modal>
    </motion.div>
  )
}
