import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { useAuthStore } from '@/stores/authStore'
import { useJobs, useMyJobAssignment, useAssignJob } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

const jobEmojis: Record<string, string> = {
  '은행원': '🏦',
  '통계청 직원': '📊',
  '국세청 직원': '📋',
  '신용평가위원': '⭐',
  '증권사 직원': '📈',
  '경찰': '🚔',
  '교실 청소부': '🧹',
  '인테리어 디자이너': '🎨',
  '기자': '📰',
  '공인중개사': '🏠',
  '보드게임 관리인': '🎲',
}

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
      toast.success(`'${jobName}' 직업에 지원했어요! 🎉`)
    } catch {
      toast.error('지원에 실패했어요.')
    }
  }

  const renderJobCard = (job: typeof requiredJobs[0], variant: 'primary' | 'accent') => {
    const emoji = jobEmojis[job.name] || '💼'
    return (
      <Card key={job.id} padding="sm" hover className="cursor-pointer">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
            variant === 'primary' ? 'bg-primary-100' : 'bg-accent-100'
          }`}>
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm">{job.name}</h4>
              <Badge variant={variant}>{variant === 'primary' ? '필수' : '선택'}</Badge>
            </div>
            <p className="text-xs text-text-tertiary mt-1 line-clamp-2">{job.description}</p>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-sm font-extrabold text-primary-600">월급 {job.salary}{currency}</span>
              {!myAssignment && (
                <Button
                  size="sm"
                  variant={variant === 'primary' ? 'primary' : 'secondary'}
                  onClick={(e) => { e.stopPropagation(); handleApply(job.id, job.name) }}
                  isLoading={assignMutation.isPending}
                >
                  지원하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">💼 직업</h2>

      {myAssignment && (
        <Card className="!bg-gradient-to-br !from-primary-100 !via-primary-50 !to-accent-50 !border-primary-200/80">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl">
              {jobEmojis[myAssignment.job.name] || '💼'}
            </div>
            <div className="flex-1">
              <Badge variant="primary">현재 직업</Badge>
              <h3 className="font-extrabold text-lg mt-1">{myAssignment.job.name}</h3>
              <p className="text-sm text-text-secondary leading-snug">{myAssignment.job.description}</p>
              <p className="text-base font-extrabold text-primary-600 mt-1.5">
                월급 {myAssignment.job.salary}{currency}
              </p>
            </div>
          </div>
        </Card>
      )}

      {!myAssignment && (
        <Card className="!bg-surface-tertiary text-center py-5">
          <span className="text-3xl">🔍</span>
          <p className="text-text-secondary text-sm font-medium mt-2">아직 직업이 없어요. 아래에서 지원해보세요!</p>
        </Card>
      )}

      {requiredJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-text-secondary mb-3">필수 직업</h3>
          <div className="space-y-3">
            {requiredJobs.map((job) => renderJobCard(job, 'primary'))}
          </div>
        </div>
      )}

      {optionalJobs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-text-secondary mb-3">선택 직업</h3>
          <div className="space-y-3">
            {optionalJobs.map((job) => renderJobCard(job, 'accent'))}
          </div>
        </div>
      )}

      {(jobs ?? []).length === 0 && (
        <EmptyState
          icon="💼"
          title="등록된 직업이 없어요"
          description="선생님이 직업을 등록하면 여기에 나타나요!"
        />
      )}
    </motion.div>
  )
}
