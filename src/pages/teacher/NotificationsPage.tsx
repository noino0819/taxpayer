import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

const typeLabels: Record<string, { label: string; variant: 'danger' | 'primary' | 'accent' | 'warning' }> = {
  fine: { label: '벌금', variant: 'danger' },
  job: { label: '직업', variant: 'primary' },
  system: { label: '시스템', variant: 'accent' },
  salary: { label: '월급', variant: 'warning' },
  credit: { label: '신용', variant: 'primary' },
}

export function NotificationsPage() {
  const { data: notifications } = useNotifications()
  const markAsReadMutation = useMarkAsRead()
  const markAllMutation = useMarkAllAsRead()

  const items = notifications ?? []
  const unread = items.filter((n) => !n.is_read)

  const handleMarkAll = async () => {
    try {
      await markAllMutation.mutateAsync()
      toast.success('모든 알림을 읽음 처리했습니다.')
    } catch {
      toast.error('처리에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">알림</h1>
          <p className="text-text-secondary text-sm mt-1 font-bold">
            {unread.length > 0 ? `읽지 않은 알림 ${unread.length}건` : '모든 알림을 확인했습니다'}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleMarkAll} isLoading={markAllMutation.isPending}>
          모두 읽음 처리
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="알림이 없습니다"
          description="새로운 알림이 생기면 여기에 표시됩니다."
        />
      ) : (
        <div className="space-y-3">
          {items.map((noti) => {
            const typeInfo = typeLabels[noti.type]
            return (
              <Card
                key={noti.id}
                padding="sm"
                className={!noti.is_read ? '!border-primary-200 !bg-primary-50/50' : ''}
                onClick={() => {
                  if (!noti.is_read) markAsReadMutation.mutate(noti.id)
                }}
              >
                <div className="flex items-start gap-3">
                  {!noti.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {typeInfo && <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>}
                      <h4 className="text-sm font-bold">{noti.title}</h4>
                    </div>
                    <p className="text-sm text-text-secondary font-bold">{noti.message}</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      {new Date(noti.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
