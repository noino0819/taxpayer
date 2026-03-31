import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/stores/authStore'
import { useProducts, useMyAccount, usePurchaseProduct } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function MartPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [activeCategory, setActiveCategory] = useState<string>('전체')

  const { data: products } = useProducts()
  const { data: account } = useMyAccount()
  const purchaseMutation = usePurchaseProduct()

  const categories = ['전체', ...new Set((products ?? []).map((p) => p.category))]

  const filtered = activeCategory === '전체'
    ? (products ?? [])
    : (products ?? []).filter((p) => p.category === activeCategory)

  const handlePurchase = async (productId: string, productName: string, price: number) => {
    if (!account) return
    if (account.balance < price) {
      toast.error('잔액이 부족합니다.')
      return
    }
    try {
      await purchaseMutation.mutateAsync({ productId, buyerAccountId: account.id })
      toast.success(`${productName}을(를) 구매했습니다!`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '구매에 실패했습니다.'
      toast.error(msg)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🛒 마트</h2>
        <Badge variant="primary">잔액: {account?.balance ?? 0}{currency}</Badge>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((product) => (
          <Card key={product.id} padding="sm" className="flex flex-col h-full">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">{product.name}</h4>
                <Badge variant="neutral" size="sm">{product.category}</Badge>
              </div>
              <p className="text-lg font-bold text-primary-600">{product.price}{currency}</p>
              <p className="text-xs text-text-tertiary mt-1">재고: {product.stock}개</p>
            </div>
            <Button
              size="sm"
              className="w-full mt-3"
              onClick={() => handlePurchase(product.id, product.name, product.price)}
              isLoading={purchaseMutation.isPending}
              disabled={!account || account.balance < product.price || product.stock <= 0}
            >
              {product.stock <= 0 ? '품절' : '구매하기'}
            </Button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-text-tertiary py-8">상품이 없습니다.</p>
      )}
    </motion.div>
  )
}
