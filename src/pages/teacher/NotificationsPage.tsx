import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { EmptyState } from '@/components/common/EmptyState'

const demoNotifications = [
  { id: 1, type: 'fine', title: '벌금 승인 요청', message: '경찰 박지민이 정우성에 대한 벌금(교실 뛰기)을 신고했습니다.', time: '5분 전', isRead: false },
  { id: 2, type: 'job', title: '직업 지원', message: '유재석이 "기자" 직업에 지원했습니다.', time: '1시간 전', isRead: false },
  { id: 3, type: 'fine', title: '벌금 승인 요청', message: '경찰 김민지가 강다니엘에 대한 벌금(수업 방해)을 신고했습니다.', time: '2시간 전', isRead: false },
  { id: 4, type: 'system', title: '경제 지표 업데이트', message: '소비자물가지수가 업데이트되었습니다. 학급 물가가 자동 조정됩니다.', time: '1일 전', isRead: true },
  { id: 5, type: 'salary', title: '월급일 알림', message: '이번 주 금요일이 월급일입니다. 은행원의 처리를 확인해주세요.', time: '2일 전', isRead: true },
]

const typeLabels: Record<string, { label: string; variant: 'danger' | 'primary' | 'accent' | 'warning' }> = {
  fine: { label: '벌금', variant: 'danger' },
  job: { label: '직업', variant: 'primary' },
  system: { label: '시스템', variant: 'accent' },
  salary: { label: '월급', variant: 'warning' },
}

export function NotificationsPage() {
  const unread = demoNotifications.filter((n) => !n.isRead)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">알림</h1>
          <p className="text-text-secondary text-sm mt-1">
            {unread.length > 0 ? `읽지 않은 알림 ${unread.length}건` : '모든 알림을 확인했습니다'}
          </p>
        </div>
        <Button variant="ghost" size="sm">모두 읽음 처리</Button>
      </div>

      {demoNotifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="알림이 없습니다"
          description="새로운 알림이 생기면 여기에 표시됩니다."
        />
      ) : (
        <div className="space-y-3">
          {demoNotifications.map((noti) => {
            const typeInfo = typeLabels[noti.type]
            return (
              <Card
                key={noti.id}
                padding="sm"
                className={!noti.isRead ? '!border-primary-200 !bg-primary-50/50' : ''}
              >
                <div className="flex items-start gap-3">
                  {!noti.isRead && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {typeInfo && <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>}
                      <h4 className="text-sm font-semibold">{noti.title}</h4>
                    </div>
                    <p className="text-sm text-text-secondary">{noti.message}</p>
                    <p className="text-xs text-text-tertiary mt-1">{noti.time}</p>
                  </div>
                  {noti.type === 'fine' && !noti.isRead && (
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="accent">승인</Button>
                      <Button size="sm" variant="ghost">거절</Button>
                    </div>
                  )}
                  {noti.type === 'job' && !noti.isRead && (
                    <div className="flex gap-1.5">
                      <Button size="sm">배정</Button>
                      <Button size="sm" variant="ghost">거절</Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
