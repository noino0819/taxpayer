import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useNotifications } from '@/hooks/useQueries'

type BoardTab = 'all' | 'system' | 'fine' | 'job' | 'salary'

const tabs: { value: BoardTab; label: string; emoji: string }[] = [
  { value: 'all', label: '전체', emoji: '📋' },
  { value: 'system', label: '공지', emoji: '📢' },
  { value: 'job', label: '직업', emoji: '💼' },
  { value: 'salary', label: '월급', emoji: '💰' },
  { value: 'fine', label: '벌금', emoji: '⚖️' },
]

const typeLabels: Record<string, { label: string; variant: 'danger' | 'primary' | 'accent' | 'warning' }> = {
  fine: { label: '벌금', variant: 'danger' },
  job: { label: '직업', variant: 'primary' },
  system: { label: '공지', variant: 'accent' },
  salary: { label: '월급', variant: 'warning' },
  credit: { label: '신용', variant: 'primary' },
}

export function BoardPage() {
  const [activeTab, setActiveTab] = useState<BoardTab>('all')
  const { data: notifications } = useNotifications()

  const filtered = activeTab === 'all'
    ? (notifications ?? [])
    : (notifications ?? []).filter((n) => n.type === activeTab)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📋 학급 게시판</h2>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-primary-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                : 'bg-surface border border-border/60 text-text-secondary'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">📭</span>
            <p className="text-text-tertiary mt-3 font-medium">게시글이 없어요</p>
          </div>
        ) : (
          filtered.map((noti) => {
            const typeInfo = typeLabels[noti.type]
            return (
              <Card key={noti.id} padding="sm">
                <div className="flex items-start gap-2 mb-2">
                  {typeInfo && <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>}
                  <h4 className="font-bold text-sm flex-1">{noti.title}</h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{noti.message}</p>
                <div className="flex items-center justify-end mt-3 pt-2.5 border-t border-border-light/60">
                  <span className="text-xs text-text-tertiary font-medium">
                    {new Date(noti.created_at).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </motion.div>
  )
}
