import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { REQUIRED_JOBS, OPTIONAL_JOBS } from '@/lib/constants'
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineUserGroup } from 'react-icons/hi2'
import toast from 'react-hot-toast'

const demoAssignments: Record<string, string[]> = {
  '은행원': ['김영희', '한예슬'],
  '국세청 직원': ['이철수'],
  '경찰': ['박지민', '김민지'],
  '통계청 직원': ['최수정'],
  '신용평가위원': ['한예슬'],
  '교실 청소부': ['강다니엘', '유재석'],
  '기자': ['송혜교'],
}

export function JobsManagePage() {
  const { currentClassroom } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newJob, setNewJob] = useState({ name: '', description: '', salary: '', maxCount: '' })
  const currency = currentClassroom?.currency_name || '미소'

  const handleCreateJob = () => {
    if (!newJob.name || !newJob.salary) {
      toast.error('직업명과 월급을 입력해주세요.')
      return
    }
    toast.success(`'${newJob.name}' 직업이 생성되었습니다.`)
    setShowCreateModal(false)
    setNewJob({ name: '', description: '', salary: '', maxCount: '' })
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">직업 관리</h1>
          <p className="text-text-secondary text-sm mt-1">직업 생성, 배정, 월급 설정</p>
        </div>
        <Button icon={<HiOutlinePlusCircle className="w-5 h-5" />} onClick={() => setShowCreateModal(true)}>
          직업 추가
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">필수 직업</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {REQUIRED_JOBS.map((job) => {
            const assigned = demoAssignments[job.name] || []
            return (
              <Card key={job.name} padding="sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.name}</h4>
                      <Badge variant="primary">필수</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{job.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-medium text-primary-600">
                        월급: {job.salary}{currency}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-tertiary">
                        <HiOutlineUserGroup className="w-3.5 h-3.5" />
                        {assigned.length}/{job.maxCount}
                      </div>
                    </div>
                    {assigned.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {assigned.map((name) => (
                          <Badge key={name} variant="neutral">{name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="p-1.5 hover:bg-surface-tertiary rounded-lg transition-colors">
                    <HiOutlinePencilSquare className="w-4 h-4 text-text-tertiary" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">선택 직업</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OPTIONAL_JOBS.map((job) => {
            const assigned = demoAssignments[job.name] || []
            return (
              <Card key={job.name} padding="sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.name}</h4>
                      <Badge variant="accent">선택</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{job.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-medium text-primary-600">
                        월급: {job.salary}{currency}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-tertiary">
                        <HiOutlineUserGroup className="w-3.5 h-3.5" />
                        {assigned.length}/{job.maxCount}
                      </div>
                    </div>
                    {assigned.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {assigned.map((name) => (
                          <Badge key={name} variant="neutral">{name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <button className="p-1.5 hover:bg-surface-tertiary rounded-lg transition-colors">
                    <HiOutlinePencilSquare className="w-4 h-4 text-text-tertiary" />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="새 직업 추가">
        <div className="space-y-4">
          <Input
            label="직업명"
            placeholder="예: 교실 사서"
            value={newJob.name}
            onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
          />
          <Input
            label="역할 설명"
            placeholder="이 직업이 하는 일을 설명하세요"
            value={newJob.description}
            onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`월급 (${currency})`}
              type="number"
              placeholder="20"
              value={newJob.salary}
              onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
            />
            <Input
              label="최대 인원"
              type="number"
              placeholder="2"
              value={newJob.maxCount}
              onChange={(e) => setNewJob({ ...newJob, maxCount: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleCreateJob}>
            직업 생성
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
