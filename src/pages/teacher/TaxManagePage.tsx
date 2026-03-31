import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import { useFines, useApproveFine, useRejectFine } from '@/hooks/useQueries'
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

export function TaxManagePage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  const { data: pendingFines } = useFines('pending')
  const { data: allFines } = useFines()
  const approveMutation = useApproveFine()
  const rejectMutation = useRejectFine()

  const processedFines = (allFines ?? []).filter((f) => f.status !== 'pending')

  const handleApprove = async (fineId: string, offenderName: string) => {
    try {
      await approveMutation.mutateAsync(fineId)
      toast.success(`${offenderName}의 벌금이 승인되었습니다.`)
    } catch {
      toast.error('승인에 실패했습니다.')
    }
  }

  const handleReject = async (fineId: string, offenderName: string) => {
    try {
      await rejectMutation.mutateAsync(fineId)
      toast.success(`${offenderName}의 벌금이 거절되었습니다.`)
    } catch {
      toast.error('거절에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">세금 및 벌금 관리</h1>
        <p className="text-text-secondary text-sm mt-1">벌금 승인 및 처리 내역</p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">벌금 승인 대기</h3>
          <Badge variant="danger">{(pendingFines ?? []).length}건</Badge>
        </div>
        {(pendingFines ?? []).length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">대기 중인 벌금이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {(pendingFines ?? []).map((fine: any) => (
              <div
                key={fine.id}
                className="flex items-center justify-between p-3 rounded-xl border border-warning-200 bg-warning-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{fine.offender?.name ?? '알 수 없음'}</span>
                    <Badge variant="danger">{fine.amount}{currency}</Badge>
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5">{fine.reason}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    신고자: {fine.reporter?.name ?? '알 수 없음'} · {new Date(fine.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(fine.id, fine.offender?.name)}
                    disabled={approveMutation.isPending}
                    className="p-2 bg-accent-100 rounded-lg hover:bg-accent-200 transition-colors disabled:opacity-50"
                  >
                    <HiOutlineCheckCircle className="w-5 h-5 text-accent-600" />
                  </button>
                  <button
                    onClick={() => handleReject(fine.id, fine.offender?.name)}
                    disabled={rejectMutation.isPending}
                    className="p-2 bg-danger-100 rounded-lg hover:bg-danger-200 transition-colors disabled:opacity-50"
                  >
                    <HiOutlineXCircle className="w-5 h-5 text-danger-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">벌금 처리 내역</h3>
        {processedFines.length === 0 ? (
          <p className="text-sm text-text-tertiary text-center py-4">처리된 벌금 내역이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {processedFines.map((fine: any) => (
              <div
                key={fine.id}
                className="flex items-center justify-between p-3 border-b border-border-light last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{fine.offender?.name ?? '알 수 없음'}</span>
                    <Badge variant={fine.status === 'approved' ? 'accent' : 'danger'}>
                      {fine.status === 'approved' ? '승인' : '거절'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {fine.reason} · {new Date(fine.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
                <span className="text-sm font-semibold">{fine.amount}{currency}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
