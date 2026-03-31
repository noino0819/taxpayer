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
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
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

  const statCards = [
    {
      label: '전체 학생',
      value: `${stats?.studentCount ?? 0}명`,
      icon: HiOutlineUserGroup,
      bg: 'bg-gradient-to-br from-blue-100 to-blue-50',
      iconColor: 'text-blue-600',
      tooltip: '현재 학급에 참여 중인 학생 수입니다.\n초대 코드를 공유하면 학생이 추가됩니다.',
    },
    {
      label: '총 통화량',
      value: `${(stats?.totalBalance ?? 0).toLocaleString()}`,
      suffix: currency,
      icon: HiOutlineBanknotes,
      bg: 'bg-gradient-to-br from-emerald-100 to-emerald-50',
      iconColor: 'text-emerald-600',
      extra: `평균: ${stats?.avgBalance ?? 0}${currency}`,
      tooltip: '학급에 풀린 전체 화폐량입니다.\n너무 많으면 인플레이션, 너무 적으면 디플레이션이 발생할 수 있습니다.',
    },
    {
      label: '활성 직업',
      value: `${activeJobs}개`,
      icon: HiOutlineBriefcase,
      bg: 'bg-gradient-to-br from-amber-100 to-amber-50',
      iconColor: 'text-amber-600',
      tooltip: '현재 학생들에게 배정 가능한 직업 수입니다.\n직업 관리 메뉴에서 추가/수정할 수 있습니다.',
    },
    {
      label: '대기 중 벌금',
      value: `${pendingCount}건`,
      icon: HiOutlineExclamationTriangle,
      bg: 'bg-gradient-to-br from-rose-100 to-rose-50',
      iconColor: 'text-rose-600',
      badge: pendingCount > 0 ? '승인 필요' : undefined,
      tooltip: '아직 처리되지 않은 벌금 건수입니다.\n승인하면 해당 학생의 통장에서 자동 차감됩니다.',
    },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-extrabold">교사 대시보드</h1>
        <p className="text-text-secondary mt-1">
          {currentClassroom?.school} {currentClassroom?.grade}학년 {currentClassroom?.class_num}반 경제 현황
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <motion.div key={card.label} variants={itemVariants}>
            <Card hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-text-secondary font-medium inline-flex items-center gap-1">
                    {card.label}
                    {card.tooltip && (
                      <Tooltip content={card.tooltip}>
                        <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
                      </Tooltip>
                    )}
                  </p>
                  <p className="text-2xl font-extrabold mt-1.5">
                    {card.value}
                    {card.suffix && <span className="text-sm font-semibold text-text-tertiary ml-1">{card.suffix}</span>}
                  </p>
                  {card.extra && <p className="text-xs text-text-tertiary mt-1">{card.extra}</p>}
                  {card.badge && <Badge variant="warning" size="sm">{card.badge}</Badge>}
                </div>
                <div className={`w-11 h-11 rounded-2xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <h3 className="font-bold mb-4">최근 거래 내역</h3>
            <div className="space-y-3">
              {(transactions ?? []).length === 0 && (
                <div className="text-center py-6">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm text-text-tertiary mt-2">아직 거래 내역이 없습니다.</p>
                </div>
              )}
              {(transactions ?? []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between py-2.5 border-b border-border-light/60 last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold ${
                        tx.type === 'income' ? 'bg-accent-100 text-accent-600' : 'bg-danger-100 text-danger-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{tx.account?.user?.name ?? '알 수 없음'}</p>
                      <p className="text-xs text-text-tertiary">{tx.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-extrabold ${
                        tx.type === 'income' ? 'text-accent-600' : 'text-danger-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}{tx.amount}{currency}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(tx.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <h3 className="font-bold mb-4">학급 경제 건강도</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-secondary inline-flex items-center gap-1 font-medium">
                    양극화 지수
                    <Tooltip content={"지니계수는 학급 내 자산 불평등 정도를\n0~1 사이 숫자로 나타냅니다.\n\n0에 가까울수록 고르게 분포\n1에 가까울수록 소수에게 편중됩니다."}>
                      <HiOutlineInformationCircle className="w-4 h-4 text-text-tertiary cursor-help" />
                    </Tooltip>
                  </span>
                  <span className="font-extrabold">{stats?.giniIndex ?? 0}</span>
                </div>
                <div className="h-2.5 bg-surface-tertiary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats?.giniIndex ?? 0) * 100}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-text-tertiary">0.3 이하: 양호</p>
                  <p className="text-xs text-text-tertiary">0.4 이상: 주의</p>
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-text-secondary">초대 코드</h4>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 transition-colors font-semibold"
                  >
                    <HiOutlineQrCode className="w-4 h-4" />
                    {showQR ? '코드 보기' : 'QR 보기'}
                  </button>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-surface rounded-2xl p-4 text-center">
                  {showQR ? (
                    <div className="flex flex-col items-center gap-2 py-1">
                      <QRCodeSVG value={inviteUrl} size={120} level="M" />
                      <p className="text-xs text-text-tertiary">스캔하면 학생 로그인 화면으로 이동합니다</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-extrabold text-primary-600 tracking-[0.2em]">
                        {currentClassroom?.invite_code}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1.5">학생에게 이 코드를 알려주세요</p>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-border/50 pt-4">
                <h4 className="text-sm font-bold text-text-secondary mb-2 inline-flex items-center gap-1">
                  운영 모드
                  <Tooltip content={"• 완전 자동: 실제 경제 지표에 연동되어 자동 운영\n• 반자동: 자동 운영 + 교사 미세 조정 가능 (추천)\n• 완전 수동: 교사가 모든 매개변수를 직접 관리"}>
                    <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
                  </Tooltip>
                </h4>
                <Badge variant="primary" size="md">
                  {currentClassroom?.economy_mode === 'auto'
                    ? '🤖 완전 자동'
                    : currentClassroom?.economy_mode === 'semi'
                      ? '⚙️ 반자동 (추천)'
                      : '✋ 완전 수동'}
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
