import { useState, useMemo, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import {
  useJobs, useJobAssignments, useCreateJob, useUpdateJob, useDeleteJob,
  usePaySalaries, useModuleConfigs, useUpdateModuleSettings,
} from '@/hooks/useQueries'
import { paySalaries, } from '@/lib/api/accounts'
import { updateModuleSettings } from '@/lib/api/modules'
import {
  HiOutlinePlusCircle, HiOutlinePencilSquare, HiOutlineTrash,
  HiOutlineUserGroup, HiOutlineBanknotes, HiOutlineCog6Tooth,
  HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineNoSymbol,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import type { Job } from '@/types/database'

type JobFormData = { name: string; description: string; salary: string; maxCount: string }
const emptyForm: JobFormData = { name: '', description: '', salary: '', maxCount: '' }

const PAY_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: '매주' },
  { value: 'biweekly', label: '격주' },
  { value: 'monthly', label: '매월' },
] as const

const DAY_OF_WEEK_OPTIONS = [
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
] as const

type PayFrequency = typeof PAY_FREQUENCY_OPTIONS[number]['value']

interface PaySchedule {
  frequency: PayFrequency
  dayOfWeek: number
  dayOfMonth: number
}

const DEFAULT_SCHEDULE: PaySchedule = { frequency: 'weekly', dayOfWeek: 5, dayOfMonth: 1 }

function getSeoulToday(): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
  const [y, m, d] = formatter.format(new Date()).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getSeoulDayOfWeek(): number {
  const dow = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(new Date())
  const map: Record<string, number> = { Sun: 7, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[dow] ?? 1
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLastScheduledPayday(schedule: PaySchedule): Date {
  const today = getSeoulToday()

  if (schedule.frequency === 'monthly') {
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), schedule.dayOfMonth)
    if (thisMonth <= today) return thisMonth
    return new Date(today.getFullYear(), today.getMonth() - 1, schedule.dayOfMonth)
  }

  const currentDay = getSeoulDayOfWeek()
  let daysSince = currentDay - schedule.dayOfWeek
  if (daysSince < 0) daysSince += 7
  const lastPayWeekDay = new Date(today.getTime() - daysSince * 86400000)

  if (schedule.frequency === 'weekly') return lastPayWeekDay

  const weekNum = Math.floor((lastPayWeekDay.getTime() - new Date(lastPayWeekDay.getFullYear(), 0, 1).getTime()) / (7 * 86400000))
  if (weekNum % 2 === 0) return lastPayWeekDay
  return new Date(lastPayWeekDay.getTime() - 7 * 86400000)
}

function getNextPayday(schedule: PaySchedule): string {
  const today = getSeoulToday()

  if (schedule.frequency === 'monthly') {
    let target = new Date(today.getFullYear(), today.getMonth(), schedule.dayOfMonth)
    if (target <= today) target = new Date(today.getFullYear(), today.getMonth() + 1, schedule.dayOfMonth)
    return `${target.getMonth() + 1}월 ${target.getDate()}일`
  }

  const currentDay = getSeoulDayOfWeek()
  let daysUntil = schedule.dayOfWeek - currentDay
  if (daysUntil <= 0) daysUntil += 7
  if (schedule.frequency === 'biweekly') {
    const weekNum = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))
    if (weekNum % 2 !== 0 && daysUntil < 7) daysUntil += 7
  }
  const target = new Date(today.getTime() + daysUntil * 24 * 60 * 60 * 1000)
  return `${target.getMonth() + 1}월 ${target.getDate()}일 (${DAY_OF_WEEK_OPTIONS.find((d) => d.value === schedule.dayOfWeek)?.label})`
}

export function JobsManagePage() {
  const { currentClassroom, user } = useAuthStore()
  const classroomId = currentClassroom?.id
  const currency = currentClassroom?.currency_name || '미소'
  const queryClient = useQueryClient()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deletingJob, setDeletingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<JobFormData>(emptyForm)
  const [showPayModal, setShowPayModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [excludedStudents, setExcludedStudents] = useState<Set<string>>(new Set())
  const [scheduleForm, setScheduleForm] = useState<PaySchedule>(DEFAULT_SCHEDULE)

  const { data: jobs } = useJobs()
  const { data: assignments } = useJobAssignments()
  const { data: moduleConfigs } = useModuleConfigs()
  const createMutation = useCreateJob()
  const updateMutation = useUpdateJob()
  const deleteMutation = useDeleteJob()
  const paySalaryMutation = usePaySalaries()
  const updateSettingsMutation = useUpdateModuleSettings()

  const jobModuleConfig = moduleConfigs?.find((c) => c.module_name === 'job')
  const jobSettings = jobModuleConfig?.settings_json as Record<string, unknown> | undefined

  const savedSchedule: PaySchedule = useMemo(() => {
    if (jobSettings?.payFrequency) {
      return {
        frequency: (jobSettings.payFrequency as PayFrequency) || 'weekly',
        dayOfWeek: (jobSettings.payDayOfWeek as number) || 5,
        dayOfMonth: (jobSettings.payDayOfMonth as number) || 1,
      }
    }
    return DEFAULT_SCHEDULE
  }, [jobSettings])

  const lastPaidAt = (jobSettings?.lastPaidAt as string) ?? null
  const savedExcludedUserIds: string[] = useMemo(
    () => (jobSettings?.excludedUserIds as string[]) ?? [],
    [jobSettings],
  )

  useEffect(() => {
    setScheduleForm(savedSchedule)
  }, [savedSchedule])

  useEffect(() => {
    setExcludedStudents(new Set(savedExcludedUserIds))
  }, [savedExcludedUserIds])

  const assignedStudents = useMemo(() => {
    if (!assignments) return []
    return assignments.map((a: any) => ({
      assignmentId: a.id,
      userId: a.user_id,
      userName: a.user?.name ?? '알 수 없음',
      avatar: a.user?.avatar_preset_id ?? '😊',
      jobId: a.job_id,
      jobName: a.job?.name ?? '',
      salary: a.job?.salary ?? 0,
    }))
  }, [assignments])

  const totalSalary = useMemo(() => {
    return assignedStudents
      .filter((s) => !excludedStudents.has(s.userId))
      .reduce((sum, s) => sum + s.salary, 0)
  }, [assignedStudents, excludedStudents])

  const payCount = assignedStudents.length - excludedStudents.size

  // ═══════════════════════════════════════════
  // 자동 월급 지급
  // ═══════════════════════════════════════════

  const autoPayStatus = useRef<'idle' | 'running' | 'done'>('idle')

  useEffect(() => {
    if (autoPayStatus.current !== 'idle') return
    if (!user || !classroomId || !moduleConfigs || assignedStudents.length === 0) return

    const lastPayday = getLastScheduledPayday(savedSchedule)
    const paydayStr = toDateStr(lastPayday)
    const todayStr = toDateStr(getSeoulToday())

    if (paydayStr > todayStr) return
    if (lastPaidAt && lastPaidAt >= paydayStr) return

    autoPayStatus.current = 'running'

    const items = assignedStudents
      .filter((s) => !savedExcludedUserIds.includes(s.userId))
      .map((s) => ({ userId: s.userId, amount: s.salary, jobName: s.jobName }))

    const run = async () => {
      try {
        if (items.length > 0) {
          const total = items.reduce((sum, i) => sum + i.amount, 0)
          await paySalaries(classroomId, items, user.id)
          toast.success(`월급일! ${items.length}명에게 총 ${total.toLocaleString()}${currency} 자동 지급 완료`)
        }
        await updateModuleSettings(classroomId, 'job', { lastPaidAt: paydayStr, excludedUserIds: [] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['my-account'] })
        queryClient.invalidateQueries({ queryKey: ['account-stats'] })
        queryClient.invalidateQueries({ queryKey: ['monthly-stats'] })
        queryClient.invalidateQueries({ queryKey: ['module-configs'] })
        autoPayStatus.current = 'done'
      } catch {
        autoPayStatus.current = 'idle'
        toast.error('자동 월급 지급에 실패했습니다.')
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, classroomId, moduleConfigs, assignedStudents, savedSchedule, lastPaidAt, savedExcludedUserIds])

  // ═══════════════════════════════════════════
  // 핸들러
  // ═══════════════════════════════════════════

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

  const openPayModal = () => {
    setShowPayModal(true)
  }

  const toggleExclude = (userId: string) => {
    const next = new Set(excludedStudents)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    setExcludedStudents(next)

    updateSettingsMutation.mutate({
      moduleName: 'job',
      settings: { excludedUserIds: [...next] },
    })
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

  const handlePaySalaries = async () => {
    if (!user || !classroomId) return
    const items = assignedStudents
      .filter((s) => !excludedStudents.has(s.userId))
      .map((s) => ({ userId: s.userId, amount: s.salary, jobName: s.jobName }))

    if (items.length === 0) {
      toast.error('지급할 학생이 없습니다.')
      return
    }

    try {
      await paySalaryMutation.mutateAsync({ items, approvedBy: user.id })
      await updateSettingsMutation.mutateAsync({
        moduleName: 'job',
        settings: { lastPaidAt: toDateStr(getSeoulToday()), excludedUserIds: [] },
      })
      toast.success(`${items.length}명에게 총 ${totalSalary.toLocaleString()}${currency} 월급 지급 완료!`)
      setShowPayModal(false)
    } catch {
      toast.error('월급 지급에 실패했습니다.')
    }
  }

  const handleSaveSchedule = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        moduleName: 'job',
        settings: {
          payFrequency: scheduleForm.frequency,
          payDayOfWeek: scheduleForm.dayOfWeek,
          payDayOfMonth: scheduleForm.dayOfMonth,
        },
      })
      toast.success('월급 지급 주기가 저장되었습니다.')
      setShowScheduleModal(false)
    } catch {
      toast.error('설정 저장에 실패했습니다.')
    }
  }

  const allJobs = jobs ?? []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">직업 관리</h1>
          <p className="text-text-secondary text-sm mt-1 font-bold">직업 생성, 수정, 배정, 월급 설정</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="accent"
            icon={<HiOutlineBanknotes className="w-5 h-5" />}
            onClick={openPayModal}
            disabled={assignedStudents.length === 0}
          >
            월급 지급
          </Button>
          <Button icon={<HiOutlinePlusCircle className="w-5 h-5" />} onClick={openCreateModal}>
            직업 추가
          </Button>
        </div>
      </div>

      {/* 월급 지급 주기 카드 */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-bold">월급 지급 주기</p>
              <p className="text-base font-bold">
                {PAY_FREQUENCY_OPTIONS.find((o) => o.value === savedSchedule.frequency)?.label}{' '}
                {savedSchedule.frequency === 'monthly'
                  ? `${savedSchedule.dayOfMonth}일`
                  : DAY_OF_WEEK_OPTIONS.find((d) => d.value === savedSchedule.dayOfWeek)?.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-text-tertiary">다음 지급일</p>
              <p className="text-sm font-bold text-primary-600">{getNextPayday(savedSchedule)}</p>
              {lastPaidAt && (
                <p className="text-xs text-text-tertiary mt-0.5">
                  마지막 지급: {lastPaidAt.replace(/-/g, '.')}
                </p>
              )}
            </div>
            <button
              className="p-2 hover:bg-white/60 rounded-xl transition-colors"
              onClick={() => setShowScheduleModal(true)}
            >
              <HiOutlineCog6Tooth className="w-5 h-5 text-text-tertiary" />
            </button>
          </div>
        </div>
      </Card>

      {/* 다음 월급 제외 학생 안내 */}
      {excludedStudents.size > 0 && (
        <Card className="bg-warning-50 border-warning-200/60">
          <div className="flex items-center gap-3">
            <HiOutlineNoSymbol className="w-5 h-5 text-warning-500 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-warning-700">
                다음 월급에서 {excludedStudents.size}명 제외
              </p>
              <p className="text-xs text-warning-600 mt-0.5">
                {assignedStudents
                  .filter((s) => excludedStudents.has(s.userId))
                  .map((s) => s.userName)
                  .join(', ')}
              </p>
            </div>
            <button
              onClick={() => {
                setExcludedStudents(new Set())
                updateSettingsMutation.mutate({ moduleName: 'job', settings: { excludedUserIds: [] } })
              }}
              className="text-xs text-warning-600 hover:text-warning-800 font-medium px-2 py-1 rounded-lg hover:bg-warning-100 transition-colors"
            >
              전체 해제
            </button>
          </div>
        </Card>
      )}

      {allJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allJobs.map((job) => {
            const assigned = getAssignments(job.id)
            return (
              <Card key={job.id} padding="sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold">{job.name}</h4>
                    {job.description && (
                      <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-bold text-primary-600">
                        월급: {job.salary}{currency}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-text-tertiary">
                        <HiOutlineUserGroup className="w-3.5 h-3.5" />
                        {assigned.length}/{job.max_count}
                      </div>
                    </div>
                    {assigned.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {assigned.map((a: any) => {
                          const isExcluded = excludedStudents.has(a.user_id)
                          return (
                            <button
                              key={a.id}
                              onClick={() => toggleExclude(a.user_id)}
                              title={isExcluded ? '월급 지급 대상으로 복원' : '다음 월급에서 제외'}
                            >
                              <Badge variant={isExcluded ? 'danger' : 'neutral'}>
                                <span className={isExcluded ? 'line-through opacity-70' : ''}>
                                  {a.user?.name}
                                </span>
                                {isExcluded && <HiOutlineNoSymbol className="w-3 h-3 ml-1" />}
                              </Badge>
                            </button>
                          )
                        })}
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

      {/* 월급 지급 모달 */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title="월급 지급" size="lg">
        <div className="space-y-4">
          {assignedStudents.length === 0 ? (
            <p className="text-sm text-text-tertiary text-center py-6">
              배정된 학생이 없습니다. 먼저 직업을 배정해주세요.
            </p>
          ) : (
            <>
              <p className="text-sm text-text-secondary">
                직업이 배정된 학생 목록입니다. 제대로 일하지 않은 학생은 선택 해제하세요.
              </p>
              <div className="space-y-1.5 max-h-72 overflow-y-auto">
                {assignedStudents.map((student) => {
                  const isIncluded = !excludedStudents.has(student.userId)
                  return (
                    <button
                      key={student.assignmentId}
                      onClick={() => toggleExclude(student.userId)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isIncluded
                          ? 'border-primary-200 bg-primary-50/50'
                          : 'border-border/50 bg-surface-secondary opacity-50'
                      }`}
                    >
                      {isIncluded ? (
                        <HiOutlineCheckCircle className="w-5 h-5 text-primary-500 shrink-0" />
                      ) : (
                        <HiOutlineXCircle className="w-5 h-5 text-text-tertiary shrink-0" />
                      )}
                      <span className="text-xl shrink-0">{student.avatar}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{student.userName}</p>
                        <p className="text-xs text-text-tertiary">{student.jobName}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${isIncluded ? 'text-primary-600' : 'text-text-tertiary line-through'}`}>
                        {student.salary}{currency}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center justify-between p-3 bg-surface-secondary rounded-2xl">
                <div>
                  <p className="text-xs text-text-tertiary">지급 대상</p>
                  <p className="font-bold">{payCount}명 / {assignedStudents.length}명</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-tertiary">총 지급액</p>
                  <p className="text-lg font-extrabold text-primary-600">{totalSalary.toLocaleString()}{currency}</p>
                </div>
              </div>

              {excludedStudents.size > 0 && (
                <p className="text-xs text-warning-500 font-medium text-center">
                  {excludedStudents.size}명의 학생이 이번 월급에서 제외됩니다.
                </p>
              )}

              <Button
                className="w-full"
                variant="accent"
                icon={<HiOutlineBanknotes className="w-5 h-5" />}
                onClick={handlePaySalaries}
                isLoading={paySalaryMutation.isPending}
                disabled={payCount === 0}
              >
                {payCount}명에게 월급 지급
              </Button>
            </>
          )}
        </div>
      </Modal>

      {/* 월급 주기 설정 모달 */}
      <Modal isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="월급 지급 주기 설정">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-text-secondary mb-2 block">지급 주기</label>
            <div className="grid grid-cols-3 gap-2">
              {PAY_FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScheduleForm({ ...scheduleForm, frequency: opt.value })}
                  className={`py-2.5 px-3 rounded-2xl border text-sm font-medium transition-all ${
                    scheduleForm.frequency === opt.value
                      ? 'border-primary-400 bg-primary-50 text-primary-700'
                      : 'border-border/50 hover:bg-surface-tertiary text-text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {scheduleForm.frequency === 'monthly' ? (
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">지급일</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">매월</span>
                <Input
                  type="number"
                  value={String(scheduleForm.dayOfMonth)}
                  onChange={(e) => {
                    const v = Math.min(28, Math.max(1, Number(e.target.value)))
                    setScheduleForm({ ...scheduleForm, dayOfMonth: v })
                  }}
                  className="w-20"
                />
                <span className="text-sm text-text-secondary">일</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-text-secondary mb-2 block">지급 요일</label>
              <div className="grid grid-cols-5 gap-2">
                {DAY_OF_WEEK_OPTIONS.map((day) => (
                  <button
                    key={day.value}
                    onClick={() => setScheduleForm({ ...scheduleForm, dayOfWeek: day.value })}
                    className={`py-2.5 px-2 rounded-2xl border text-sm font-medium transition-all ${
                      scheduleForm.dayOfWeek === day.value
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-border/50 hover:bg-surface-tertiary text-text-secondary'
                    }`}
                  >
                    {day.label.replace('요일', '')}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-surface-secondary rounded-2xl text-center">
            <p className="text-xs text-text-tertiary">다음 예정 지급일</p>
            <p className="text-sm font-bold text-primary-600 mt-1">{getNextPayday(scheduleForm)}</p>
          </div>

          <Button
            className="w-full"
            onClick={handleSaveSchedule}
            isLoading={updateSettingsMutation.isPending}
          >
            저장
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
