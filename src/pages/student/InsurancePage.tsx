import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/stores/authStore'
import { useInsuranceProducts, useMyInsurance, useJoinInsurance } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function InsurancePage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'

  const { data: products } = useInsuranceProducts()
  const { data: myContracts } = useMyInsurance()
  const joinMutation = useJoinInsurance()

  const myContractIds = new Set((myContracts ?? []).map((c: any) => c.insurance_id))

  const handleJoin = async (insuranceId: string, name: string) => {
    if (!user) return
    try {
      await joinMutation.mutateAsync({ insuranceId, userId: user.id })
      toast.success(`${name} 보험에 가입했습니다!`)
    } catch {
      toast.error('가입에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🛡️ 보험</h2>

      {(myContracts ?? []).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">내 보험</h3>
          <div className="space-y-3">
            {(myContracts ?? []).map((c: any) => (
              <Card key={c.id} padding="sm" className="!border-accent-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{c.insurance.name}</h4>
                    <p className="text-xs text-text-tertiary mt-0.5">{c.insurance.description}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      보험료: {c.insurance.premium}{currency}/{c.insurance.payment_type === 'monthly' ? '월' : '일시납'}
                    </p>
                  </div>
                  <Badge variant="accent">가입 중</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">보험 상품</h3>
        <div className="space-y-3">
          {(products ?? []).map((product) => {
            const isJoined = myContractIds.has(product.id)
            return (
              <Card key={product.id} padding="sm">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{product.name}</h4>
                      <Badge variant={product.payment_type === 'monthly' ? 'primary' : 'warning'}>
                        {product.payment_type === 'monthly' ? '월납' : '일시납'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{product.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>보험료: <span className="font-bold">{product.premium}{currency}</span></span>
                      <span>보상금: <span className="font-bold text-accent-600">{product.payout}{currency}</span></span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1">조건: {product.condition}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isJoined ? 'ghost' : 'secondary'}
                    disabled={isJoined}
                    onClick={() => handleJoin(product.id, product.name)}
                    isLoading={joinMutation.isPending}
                  >
                    {isJoined ? '가입됨' : '가입'}
                  </Button>
                </div>
              </Card>
            )
          })}
          {(products ?? []).length === 0 && (
            <p className="text-center text-text-tertiary py-4">보험 상품이 없습니다.</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
