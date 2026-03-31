import { useState } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Tooltip } from '@/components/common/Tooltip'
import { useAuthStore } from '@/stores/authStore'
import { useAccountStats, useClassroomTransactions, useJobs, useFines } from '@/hooks/useQueries'
import {
  HiOutlineBanknotes,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineExclamationTriangle,
  HiOutlineInformationCircle,
  HiOutlineQrCode,
} from 'react-icons/hi2'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

export function DashboardPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [showQR, setShowQR] = useState(false)
  const inviteUrl = `${window.location.origin}/login?tab=student&code=${currentClassroom?.invite_code || ''}`

  const { data: stats } = useAccountStats()
  const { data: transactions } = useClassroomTransactions(5)
  const { data: jobs } = useJobs()
  const { data: pendingFines } = useFines('pending')

  const activeJobs = jobs?.length ?? 0
  const pendingCount = pendingFines?.length ?? 0

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">교사 대시보드</h1>
        <p className="text-text-secondary mt-1">
          {currentClassroom?.school} {currentClassroom?.grade}학년 {currentClassroom?.class_num}반 경제 현황
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">전체 학생</p>
              <p className="text-2xl font-bold mt-1">{stats?.studentCount ?? 0}명</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineUserGroup className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">총 통화량</p>
              <p className="text-2xl font-bold mt-1">
                {(stats?.totalBalance ?? 0).toLocaleString()}
                <span className="text-sm font-normal text-text-tertiary ml-1">{currency}</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
              <HiOutlineBanknotes className="w-5 h-5 text-accent-600" />
            </div>
          </div>
          <p className="text-xs text-text-tertiary mt-2">평균 잔액: {stats?.avgBalance ?? 0}{currency}</p>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">활성 직업</p>
              <p className="text-2xl font-bold mt-1">{activeJobs}개</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5 text-warning-500" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary">대기 중 벌금</p>
              <p className="text-2xl font-bold mt-1">{pendingCount}건</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-danger-100 flex items-center justify-center">
              <HiOutlineExclamationTriangle className="w-5 h-5 text-danger-500" />
            </div>
          </div>
          {pendingCount > 0 && <Badge variant="warning" size="sm">승인 필요</Badge>}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">최근 거래 내역</h3>
          <div className="space-y-3">
            {(transactions ?? []).length === 0 && (
              <p className="text-sm text-text-tertiary text-center py-4">아직 거래 내역이 없습니다.</p>
            )}
            {(transactions ?? []).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      tx.type === 'income' ? 'bg-accent-100 text-accent-600' : 'bg-danger-100 text-danger-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{tx.account?.user?.name ?? '알 수 없음'}</p>
                    <p className="text-xs text-text-tertiary">{tx.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-accent-600' : 'text-danger-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {tx.amount}
                    {currency}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">학급 경제 건강도</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-text-secondary inline-flex items-center gap-1">
                  양극화 지수 (지니계수)
                  <Tooltip content="지니계수는 학급 내 자산 불평등 정도를 0~1 사이 숫자로 나타냅니다. 0에 가까울수록 학생들의 자산이 고르게 분포되어 있고, 1에 가까울수록 소수에게 자산이 편중되어 있다는 뜻입니다.">
                    <HiOutlineInformationCircle className="w-4 h-4 text-text-tertiary cursor-help" />
                  </Tooltip>
                </span>
                <span className="font-medium">{stats?.giniIndex ?? 0}</span>
              </div>
              <div className="h-2 bg-surface-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-400 rounded-full transition-all"
                  style={{ width: `${(stats?.giniIndex ?? 0) * 100}%` }}
                />
              </div>
              <p className="text-xs text-text-tertiary mt-1">0.3 이하: 양호 | 0.4 이상: 주의</p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-3">초대 코드</h4>
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary-600 tracking-widest">
                  {currentClassroom?.invite_code}
                </p>
                <p className="text-xs text-text-tertiary mt-1">학생에게 이 코드를 알려주세요</p>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-medium text-text-secondary mb-2">운영 모드</h4>
              <Badge variant="primary" size="md">
                {currentClassroom?.economy_mode === 'auto'
                  ? '완전 자동'
                  : currentClassroom?.economy_mode === 'semi'
                    ? '반자동 (추천)'
                    : '완전 수동'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
