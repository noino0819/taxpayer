import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi2'
import toast from 'react-hot-toast'

const demoJobs = [
  { id: '1', name: '은행원', type: 'required', description: '월급 지급 처리, 저축 상품 관리, 이자 계산 및 지급', salary: 30, maxCount: 3, currentCount: 2, isMyJob: true },
  { id: '2', name: '국세청 직원', type: 'required', description: '세금 수입/지출 기록, 소득세/임대료/벌금 등 관리', salary: 25, maxCount: 2, currentCount: 2, isMyJob: false },
  { id: '3', name: '통계청 직원', type: 'required', description: '과제/숙제 등 제출물 기록 관리', salary: 25, maxCount: 2, currentCount: 1, isMyJob: false },
  { id: '4', name: '신용평가위원', type: 'required', description: '통계청 자료 기반 신용 포인트 관리', salary: 25, maxCount: 2, currentCount: 1, isMyJob: false },
  { id: '5', name: '경찰', type: 'required', description: '규칙 위반 신고 접수, 벌금 납부 확인', salary: 20, maxCount: 3, currentCount: 3, isMyJob: false },
  { id: '6', name: '교실 청소부', type: 'optional', description: '교실 청소 담당, 청소 상태 점검 및 보고', salary: 15, maxCount: 4, currentCount: 2, isMyJob: false },
  { id: '7', name: '기자', type: 'optional', description: '학급 신문 작성, 학급 소식 전달', salary: 15, maxCount: 2, currentCount: 0, isMyJob: false },
]

export function JobsPage() {
  const { currentClassroom } = useAuthStore()
  const [selectedJob, setSelectedJob] = useState<typeof demoJobs[0] | null>(null)
  const currency = currentClassroom?.currency_name || '미소'

  const myJob = demoJobs.find((j) => j.isMyJob)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">💼 직업</h2>

      {myJob && (
        <Card className="!bg-gradient-to-r from-warning-100 to-warning-50 !border-warning-200">
          <div className="flex items-center gap-2 mb-2">
            <HiOutlineBriefcase className="w-5 h-5 text-warning-500" />
            <span className="text-sm font-semibold text-warning-500">나의 직업</span>
          </div>
          <h3 className="text-lg font-bold">{myJob.name}</h3>
          <p className="text-sm text-text-secondary mt-1">{myJob.description}</p>
          <p className="text-sm font-semibold text-warning-500 mt-2">
            월급: {myJob.salary}{currency}
          </p>
        </Card>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">필수 직업</h3>
        <div className="space-y-3">
          {demoJobs
            .filter((j) => j.type === 'required')
            .map((job) => (
              <Card
                key={job.id}
                hover
                padding="sm"
                className="cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.name}</h4>
                      {job.isMyJob && <Badge variant="accent">나의 직업</Badge>}
                      {job.currentCount >= job.maxCount && !job.isMyJob && (
                        <Badge variant="neutral">모집완료</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-1">{job.description}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-primary-600">{job.salary}{currency}</p>
                    <div className="flex items-center gap-1 text-xs text-text-tertiary mt-0.5">
                      <HiOutlineUserGroup className="w-3.5 h-3.5" />
                      {job.currentCount}/{job.maxCount}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">선택 직업</h3>
        <div className="space-y-3">
          {demoJobs
            .filter((j) => j.type === 'optional')
            .map((job) => (
              <Card
                key={job.id}
                hover
                padding="sm"
                className="cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.name}</h4>
                      {job.currentCount < job.maxCount && (
                        <Badge variant="primary">모집중</Badge>
                      )}
                    </div>
                    <p className="text-xs text-text-tertiary mt-1 line-clamp-1">{job.description}</p>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-sm font-bold text-primary-600">{job.salary}{currency}</p>
                    <div className="flex items-center gap-1 text-xs text-text-tertiary mt-0.5">
                      <HiOutlineUserGroup className="w-3.5 h-3.5" />
                      {job.currentCount}/{job.maxCount}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>

      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.name}
      >
        {selectedJob && (
          <div className="space-y-4">
            <div>
              <Badge variant={selectedJob.type === 'required' ? 'primary' : 'accent'}>
                {selectedJob.type === 'required' ? '필수 직업' : '선택 직업'}
              </Badge>
            </div>
            <p className="text-text-secondary">{selectedJob.description}</p>
            <div className="bg-surface-tertiary rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">월급</span>
                <span className="font-semibold">{selectedJob.salary}{currency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">현재 인원</span>
                <span className="font-semibold">
                  {selectedJob.currentCount} / {selectedJob.maxCount}명
                </span>
              </div>
            </div>
            {!selectedJob.isMyJob && selectedJob.currentCount < selectedJob.maxCount && (
              <Button
                className="w-full"
                onClick={() => {
                  toast.success('직업 지원이 완료되었습니다! 교사 승인을 기다려주세요.')
                  setSelectedJob(null)
                }}
              >
                지원하기
              </Button>
            )}
            {selectedJob.isMyJob && (
              <div className="bg-accent-50 rounded-xl p-3 text-center">
                <p className="text-accent-700 font-medium">현재 수행 중인 직업입니다</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
