import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { useJobs, useJobAssignments, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useQueries'
import { HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi2'
import toast from 'react-hot-toast'
import type { Job } from '@/types/database'

type JobFormData = { name: string; description: string; salary: string; maxCount: string }
const emptyForm: JobFormData = { name: '', description: '', salary: '', maxCount: '' }

export function JobsManagePage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deletingJob, setDeletingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<JobFormData>(emptyForm)

  const { data: jobs } = useJobs()
  const { data: assignments } = useJobAssignments()
  const createMutation = useCreateJob()
  const updateMutation = useUpdateJob()
  const deleteMutation = useDeleteJob()

  const getAssignments = (jobId: string) =>
    (assignments ?? []).filter((a: any) => a.job_id === jobId)

  const openCreateModal = () => {
    setFormData(emptyForm)
    setShowCreateModal(true)
  }

  const openEditModal = (job: Job) => {
    setFormData({
      name: job.name,
      description: job.description,
      salary: String(job.salary),
      maxCount: String(job.max_count),
    })
    setEditingJob(job)
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.salary || !currentClassroom) {
      toast.error('직업명과 월급을 입력해주세요.')
      return
    }
    try {
      await createMutation.mutateAsync({
        classroom_id: currentClassroom.id,
        name: formData.name,
        type: 'custom',
        description: formData.description,
        salary: Number(formData.salary),
        max_count: Number(formData.maxCount) || 2,
        qualifications: null,
      })
      toast.success(`'${formData.name}' 직업이 생성되었습니다.`)
      setShowCreateModal(false)
      setFormData(emptyForm)
    } catch {
      toast.error('직업 생성에 실패했습니다.')
    }
  }

  const handleUpdate = async () => {
    if (!editingJob || !formData.name || !formData.salary) {
      toast.error('직업명과 월급을 입력해주세요.')
      return
    }
    try {
      await updateMutation.mutateAsync({
        jobId: editingJob.id,
        updates: {
          name: formData.name,
          description: formData.description,
          salary: Number(formData.salary),
          max_count: Number(formData.maxCount) || 2,
        },
      })
      toast.success(`'${formData.name}' 직업이 수정되었습니다.`)
      setEditingJob(null)
      setFormData(emptyForm)
    } catch {
      toast.error('직업 수정에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!deletingJob) return
    try {
      await deleteMutation.mutateAsync(deletingJob.id)
      toast.success(`'${deletingJob.name}' 직업이 삭제되었습니다.`)
      setDeletingJob(null)
    } catch {
      toast.error('직업 삭제에 실패했습니다.')
    }
  }

  const allJobs = jobs ?? []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">직업 관리</h1>
          <p className="text-text-secondary text-sm mt-1">직업 생성, 수정, 배정, 월급 설정</p>
        </div>
        <Button icon={<HiOutlinePlusCircle className="w-5 h-5" />} onClick={openCreateModal}>
          직업 추가
        </Button>
      </div>

      {allJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allJobs.map((job) => {
            const assigned = getAssignments(job.id)
            return (
              <Card key={job.id} padding="sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{job.name}</h4>
                    {job.description && (
                      <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-medium text-primary-600">
                        월급: {job.salary}{currency}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-tertiary">
                        <HiOutlineUserGroup className="w-3.5 h-3.5" />
                        {assigned.length}/{job.max_count}
                      </div>
                    </div>
                    {assigned.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {assigned.map((a: any) => (
                          <Badge key={a.id} variant="neutral">{a.user?.name}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <button
                      className="p-1.5 hover:bg-surface-tertiary rounded-lg transition-colors"
                      onClick={() => openEditModal(job)}
                    >
                      <HiOutlinePencilSquare className="w-4 h-4 text-text-tertiary" />
                    </button>
                    <button
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => setDeletingJob(job)}
                    >
                      <HiOutlineTrash className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-text-tertiary py-8">아직 등록된 직업이 없습니다.</p>
      )}

      {/* 생성 모달 */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="새 직업 추가">
        <div className="space-y-4">
          <Input
            label="직업명"
            placeholder="예: 교실 사서"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="역할 설명"
            placeholder="이 직업이 하는 일을 설명하세요"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`월급 (${currency})`}
              type="number"
              placeholder="20"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            <Input
              label="최대 인원"
              type="number"
              placeholder="2"
              value={formData.maxCount}
              onChange={(e) => setFormData({ ...formData, maxCount: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleCreate} isLoading={createMutation.isPending}>
            직업 생성
          </Button>
        </div>
      </Modal>

      {/* 수정 모달 */}
      <Modal isOpen={!!editingJob} onClose={() => setEditingJob(null)} title="직업 수정">
        <div className="space-y-4">
          <Input
            label="직업명"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="역할 설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={`월급 (${currency})`}
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            />
            <Input
              label="최대 인원"
              type="number"
              value={formData.maxCount}
              onChange={(e) => setFormData({ ...formData, maxCount: e.target.value })}
            />
          </div>
          <Button className="w-full" onClick={handleUpdate} isLoading={updateMutation.isPending}>
            수정 완료
          </Button>
        </div>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal isOpen={!!deletingJob} onClose={() => setDeletingJob(null)} title="직업 삭제">
        <div className="space-y-4">
          <p className="text-text-secondary">
            <strong>'{deletingJob?.name}'</strong> 직업을 삭제하시겠습니까?
          </p>
          <p className="text-xs text-text-tertiary">
            해당 직업에 배정된 학생들의 직업도 해제됩니다.
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant="secondary"
              onClick={() => setDeletingJob(null)}
            >
              취소
            </Button>
            <Button
              className="flex-1 !bg-red-500 hover:!bg-red-600 !text-white"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
