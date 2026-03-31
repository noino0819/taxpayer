import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { CREDIT_GRADES } from '@/lib/constants'
import { HiOutlineMagnifyingGlass, HiOutlinePlusCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

const demoStudents = [
  { id: '1', name: '김영희', avatar: '🐶', balance: 152, creditGrade: 1, job: '은행원' },
  { id: '2', name: '이철수', avatar: '🐱', balance: 98, creditGrade: 2, job: '국세청 직원' },
  { id: '3', name: '박지민', avatar: '🐰', balance: 134, creditGrade: 2, job: '경찰' },
  { id: '4', name: '최수정', avatar: '🐻', balance: 76, creditGrade: 3, job: '통계청 직원' },
  { id: '5', name: '정우성', avatar: '🦊', balance: 45, creditGrade: 4, job: null },
  { id: '6', name: '한예슬', avatar: '🐼', balance: 201, creditGrade: 1, job: '신용평가위원' },
  { id: '7', name: '강다니엘', avatar: '🐯', balance: 88, creditGrade: 3, job: '교실 청소부' },
  { id: '8', name: '송혜교', avatar: '🦁', balance: 167, creditGrade: 1, job: '기자' },
  { id: '9', name: '유재석', avatar: '😎', balance: 55, creditGrade: 3, job: null },
  { id: '10', name: '김민지', avatar: '🐸', balance: 120, creditGrade: 2, job: '경찰' },
]

export function StudentsPage() {
  const { currentClassroom } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<typeof demoStudents[0] | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const currency = currentClassroom?.currency_name || '미소'

  const filtered = demoStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">학생 관리</h1>
          <p className="text-text-secondary text-sm mt-1">총 {demoStudents.length}명</p>
        </div>
        <Button icon={<HiOutlinePlusCircle className="w-5 h-5" />} onClick={() => setShowAddModal(true)}>
          학생 추가
        </Button>
      </div>

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
                    <h4 className="font-semibold">{student.name}</h4>
                    {student.job && <Badge variant="accent">{student.job}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-text-secondary">
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
      </div>

      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent?.name}
        size="md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-5xl">{selectedStudent.avatar}</span>
              <h3 className="text-xl font-bold mt-2">{selectedStudent.name}</h3>
            </div>
            <div className="bg-surface-tertiary rounded-xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-text-secondary">잔액</span>
                <span className="font-semibold">{selectedStudent.balance}{currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">직업</span>
                <span className="font-semibold">{selectedStudent.job || '없음'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">신용등급</span>
                <span className="font-semibold">{selectedStudent.creditGrade}등급</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => toast.success('입금 처리됨')}>
                입금
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => toast.success('출금 처리됨')}>
                출금
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="학생 추가">
        <div className="space-y-4">
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <p className="text-sm text-text-secondary mb-2">학급 초대 코드를 학생에게 알려주세요</p>
            <p className="text-3xl font-bold text-primary-600 tracking-widest">
              {currentClassroom?.invite_code}
            </p>
          </div>
          <p className="text-sm text-text-secondary text-center">
            학생이 로그인 화면에서 이 코드를 입력하면 자동으로 학급에 참여합니다.
          </p>
        </div>
      </Modal>
    </motion.div>
  )
}
