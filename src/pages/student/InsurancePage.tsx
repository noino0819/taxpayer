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
      toast.success(`${name} 보험에 가입했어요! 🛡️`)
    } catch {
      toast.error('가입에 실패했어요.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🛡️ 보험</h2>
      <p className="text-xs text-text-tertiary -mt-3 leading-relaxed">
        보험은 혹시 모를 상황에 대비하는 거예요. 매달 조금씩 돈(보험료)을 내면, 나중에 특정 조건이 생겼을 때 큰 돈(보상금)을 받을 수 있어요!
      </p>

      {(myContracts ?? []).length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-text-secondary mb-3">내 보험</h3>
          <div className="space-y-3">
            {(myContracts ?? []).map((c: any) => (
              <Card key={c.id} padding="sm" className="!border-accent-200/60 !bg-gradient-to-r !from-accent-50/40 !to-surface">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-accent-100 flex items-center justify-center text-xl">🛡️</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{c.insurance.name}</h4>
                      <Badge variant="accent">가입 중</Badge>
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5">{c.insurance.description}</p>
                    <p className="text-xs text-text-secondary mt-1">
                      내는 돈: <span className="font-bold">{c.insurance.premium}{currency}</span>/{c.insurance.payment_type === 'monthly' ? '매달' : '한 번'}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-bold text-text-secondary mb-3">보험 상품</h3>
        <div className="space-y-3">
          {(products ?? []).map((product) => {
            const isJoined = myContractIds.has(product.id)
            return (
              <Card key={product.id} padding="sm">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center text-xl flex-shrink-0">
                    {product.payment_type === 'monthly' ? '📅' : '💳'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{product.name}</h4>
                      <Badge variant={product.payment_type === 'monthly' ? 'primary' : 'warning'}>
                        {product.payment_type === 'monthly' ? '매달 내기' : '한 번에 내기'}
                      </Badge>
                    </div>
                    <p className="text-sm text-text-secondary mt-1 leading-relaxed">{product.description}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>내는 돈: <span className="font-extrabold">{product.premium}{currency}</span></span>
                      <span>받는 돈: <span className="font-extrabold text-accent-600">{product.payout}{currency}</span></span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-1.5 bg-surface-tertiary rounded-xl px-2.5 py-1.5 inline-block">
                      📋 이럴 때 보상받아요: {product.condition}
                    </p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant={isJoined ? 'ghost' : 'primary'}
                        disabled={isJoined}
                        onClick={() => handleJoin(product.id, product.name)}
                        isLoading={joinMutation.isPending}
                      >
                        {isJoined ? '✅ 가입됨' : '가입하기'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
          {(products ?? []).length === 0 && (
            <div className="text-center py-8">
              <span className="text-4xl">🛡️</span>
              <p className="text-text-tertiary mt-2">보험 상품이 없어요</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
