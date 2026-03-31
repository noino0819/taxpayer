import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

const demoProducts = [
  { id: '1', name: '연필', price: 1, stock: 20, category: '학용품', emoji: '✏️' },
  { id: '2', name: '지우개', price: 1, stock: 15, category: '학용품', emoji: '🧹' },
  { id: '3', name: '과자 세트', price: 3, stock: 10, category: '간식', emoji: '🍪' },
  { id: '4', name: '일기 면제권', price: 3, stock: 5, category: '특별권', emoji: '📝' },
  { id: '5', name: '자습시간 자유이용권', price: 2, stock: 8, category: '특별권', emoji: '🎮' },
  { id: '6', name: '특식 먼저 먹기', price: 1, stock: 3, category: '특별권', emoji: '🍽️' },
  { id: '7', name: '신청곡 신청하기', price: 1, stock: 5, category: '특별권', emoji: '🎵' },
  { id: '8', name: '색연필 세트', price: 5, stock: 3, category: '학용품', emoji: '🖍️' },
]

export function MartPage() {
  const { currentClassroom } = useAuthStore()
  const [selectedProduct, setSelectedProduct] = useState<typeof demoProducts[0] | null>(null)
  const [filter, setFilter] = useState('전체')
  const currency = currentClassroom?.currency_name || '미소'

  const categories = ['전체', ...new Set(demoProducts.map((p) => p.category))]
  const filtered = filter === '전체' ? demoProducts : demoProducts.filter((p) => p.category === filter)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">🛒 마트</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat
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
          <motion.div
            key={product.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSelectedProduct(product)}
          >
            <Card hover padding="sm" className="cursor-pointer h-full">
              <div className="text-center">
                <span className="text-4xl">{product.emoji}</span>
                <h4 className="font-semibold mt-2 text-sm">{product.name}</h4>
                <p className="text-primary-600 font-bold mt-1">{product.price}{currency}</p>
                <p className="text-xs text-text-tertiary mt-0.5">재고 {product.stock}개</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="상품 구매"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-6xl">{selectedProduct.emoji}</span>
              <h3 className="text-xl font-bold mt-3">{selectedProduct.name}</h3>
              <Badge variant="neutral">{selectedProduct.category}</Badge>
            </div>
            <div className="bg-surface-tertiary rounded-xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">가격</span>
                <span className="font-bold text-primary-600">{selectedProduct.price}{currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">남은 재고</span>
                <span className="font-medium">{selectedProduct.stock}개</span>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                toast.success(`${selectedProduct.name}을(를) 구매했습니다!`)
                setSelectedProduct(null)
              }}
            >
              구매하기 ({selectedProduct.price}{currency})
            </Button>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
