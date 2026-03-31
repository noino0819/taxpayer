import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuthStore } from '@/stores/authStore'
import { useJobs, useMyJobAssignment, useAssignJob } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function JobsPage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  const { data: jobs } = useJobs()
  const { data: myAssignment } = useMyJobAssignment()
  const assignMutation = useAssignJob()

  const requiredJobs = (jobs ?? []).filter((j) => j.type === 'required')
  const optionalJobs = (jobs ?? []).filter((j) => j.type === 'optional')

  const handleApply = async (jobId: string, jobName: string) => {
    if (!user) return
    try {
      await assignMutation.mutateAsync({ jobId, userId: user.id })
      toast.success(`'${jobName}' 직업에 지원했습니다!`)
    } catch {
      toast.error('지원에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">💼 직업</h2>

      {myAssignment && (
        <Card className="!border-primary-200 !bg-primary-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-200 flex items-center justify-center text-2xl">
              💼
            </div>
            <div>
              <Badge variant="primary">현재 직업</Badge>
              <h3 className="font-bold mt-1">{myAssignment.job.name}</h3>
              <p className="text-sm text-text-secondary">{myAssignment.job.description}</p>
              <p className="text-sm font-medium text-primary-600 mt-1">
                월급: {myAssignment.job.salary}{currency}
              </p>
            </div>
          </div>
        </Card>
      )}

      {!myAssignment && (
        <Card className="!bg-surface-tertiary text-center py-4">
          <p className="text-text-secondary text-sm">아직 직업이 없습니다. 아래에서 지원해보세요!</p>
        </Card>
      )}

      {requiredJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">필수 직업</h3>
          <div className="space-y-3">
            {requiredJobs.map((job) => (
              <Card key={job.id} padding="sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.name}</h4>
                      <Badge variant="primary">필수</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{job.description}</p>
                    <p className="text-sm font-medium text-primary-600 mt-1">월급: {job.salary}{currency}</p>
                  </div>
                  {!myAssignment && (
                    <Button
                      size="sm"
                      onClick={() => handleApply(job.id, job.name)}
                      isLoading={assignMutation.isPending}
                    >
                      지원
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {optionalJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">선택 직업</h3>
          <div className="space-y-3">
            {optionalJobs.map((job) => (
              <Card key={job.id} padding="sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{job.name}</h4>
                      <Badge variant="accent">선택</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">{job.description}</p>
                    <p className="text-sm font-medium text-primary-600 mt-1">월급: {job.salary}{currency}</p>
                  </div>
                  {!myAssignment && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleApply(job.id, job.name)}
                      isLoading={assignMutation.isPending}
                    >
                      지원
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(jobs ?? []).length === 0 && (
        <EmptyState
          icon="💼"
          title="등록된 직업이 없습니다"
          description="선생님이 직업을 등록하면 여기에 나타납니다."
        />
      )}
    </motion.div>
  )
}
