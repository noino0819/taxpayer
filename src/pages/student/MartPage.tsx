import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/stores/authStore'
import { useProducts, useMyAccount, usePurchaseProduct } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
}

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
      toast.error('잔액이 부족해요! 💸')
      return
    }
    try {
      await purchaseMutation.mutateAsync({ productId, buyerAccountId: account.id })
      toast.success(`${productName}을(를) 구매했어요! 🎉`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '구매에 실패했어요.'
      toast.error(msg)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">🛒 마트</h2>
        <div className="bg-primary-100 rounded-2xl px-3.5 py-1.5">
          <span className="text-xs text-primary-600 font-bold">💰 {account?.balance ?? 0}{currency}</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary-500 text-white shadow-[0_2px_8px_rgba(99,102,241,0.3)]'
                : 'bg-surface border border-border/60 text-text-secondary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-3">
        {filtered.map((product) => {
          const canAfford = account && account.balance >= product.price
          const soldOut = product.stock <= 0
          return (
            <motion.div key={product.id} variants={item}>
              <Card padding="sm" className="flex flex-col h-full !p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-surface-tertiary to-surface p-4 text-center">
                  <span className="text-4xl">🏷️</span>
                </div>
                <div className="p-3.5 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <h4 className="font-bold text-sm leading-tight">{product.name}</h4>
                    </div>
                    <Badge variant="neutral" size="sm">{product.category}</Badge>
                    <p className="text-lg font-extrabold text-primary-600 mt-2">{product.price}{currency}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {soldOut ? '🚫 품절' : `📦 재고: ${product.stock}개`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    variant={canAfford && !soldOut ? 'primary' : 'secondary'}
                    onClick={() => handlePurchase(product.id, product.name, product.price)}
                    isLoading={purchaseMutation.isPending}
                    disabled={!canAfford || soldOut}
                  >
                    {soldOut ? '품절' : !canAfford ? '잔액 부족' : '구매하기'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <span className="text-5xl">🏪</span>
          <p className="text-text-tertiary mt-3 font-medium">아직 상품이 없어요</p>
        </div>
      )}
    </motion.div>
  )
}
