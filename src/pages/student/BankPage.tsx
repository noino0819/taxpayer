import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import { useSavingsProducts, useMySavings, useMyAccount, useOpenSavings } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function BankPage() {
  const { user, currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [principal, setPrincipal] = useState('')

  const { data: products } = useSavingsProducts()
  const { data: mySavings } = useMySavings()
  const { data: account } = useMyAccount()
  const openMutation = useOpenSavings()

  const handleOpen = async () => {
    if (!selectedProduct || !user || !account) return
    const amt = Number(principal)
    if (!amt || amt <= 0) {
      toast.error('금액을 입력해주세요.')
      return
    }
    if (amt > (account.balance ?? 0)) {
      toast.error('잔액이 부족합니다.')
      return
    }
    try {
      await openMutation.mutateAsync({
        productId: selectedProduct.id,
        userId: user.id,
        accountId: account.id,
        principal: amt,
        termDays: selectedProduct.min_term_days,
      })
      toast.success(`${selectedProduct.name}에 가입했습니다!`)
      setSelectedProduct(null)
      setPrincipal('')
    } catch {
      toast.error('가입에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🏦 은행</h2>

      {(mySavings ?? []).length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">내 적금</h3>
          <div className="space-y-3">
            {(mySavings ?? []).map((s: any) => (
              <Card key={s.id} padding="sm" className="!border-accent-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{s.product.name}</h4>
                    <p className="text-sm text-text-secondary mt-0.5">원금: {s.principal}{currency}</p>
                    <p className="text-xs text-text-tertiary">
                      만기: {new Date(s.maturity_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <Badge variant="accent">{s.product.interest_rate}%</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">저축 상품</h3>
        <div className="space-y-3">
          {(products ?? []).map((product) => (
            <Card key={product.id} padding="sm" hover onClick={() => setSelectedProduct(product)} className="cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{product.name}</h4>
                    <Badge variant={product.type === 'compound' ? 'primary' : 'neutral'}>
                      {product.type === 'compound' ? '복리' : '단리'}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    이자율: <span className="font-bold text-accent-600">{product.interest_rate}%</span>
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    최소 {product.min_term_days}일 · {product.conditions}
                  </p>
                </div>
                <Button size="sm" variant="secondary">가입</Button>
              </div>
            </Card>
          ))}
          {(products ?? []).length === 0 && (
            <p className="text-center text-text-tertiary py-4">저축 상품이 없습니다.</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={!!selectedProduct}
        onClose={() => { setSelectedProduct(null); setPrincipal('') }}
        title={`${selectedProduct?.name} 가입`}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-surface-tertiary rounded-xl p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">이자율</span>
                <span className="font-bold text-accent-600">{selectedProduct.interest_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">유형</span>
                <span>{selectedProduct.type === 'compound' ? '복리' : '단리'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">최소 기간</span>
                <span>{selectedProduct.min_term_days}일</span>
              </div>
            </div>
            <Input
              label={`원금 (${currency})`}
              type="number"
              placeholder="금액을 입력하세요"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
            <p className="text-xs text-text-tertiary">내 잔액: {account?.balance ?? 0}{currency}</p>
            <Button className="w-full" onClick={handleOpen} isLoading={openMutation.isPending}>
              가입하기
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
