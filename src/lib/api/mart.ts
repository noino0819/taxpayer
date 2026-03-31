import { supabase } from '@/lib/supabase'
import type { Product, Store } from '@/types/database'

export async function getStores(classroomId: string): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('status', 'open')
  if (error) throw error
  return data as Store[]
}

export async function getProducts(classroomId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('classroom_id', classroomId)
    .gt('stock', 0)
    .order('category')
    .order('name')
  if (error) throw error
  return data as Product[]
}

export async function purchaseProduct(productId: string, buyerAccountId: string, approvedBy?: string) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single()
  if (error || !product) throw new Error('상품을 찾을 수 없습니다.')
  if (product.stock <= 0) throw new Error('품절된 상품입니다.')

  await supabase.from('products').update({ stock: product.stock - 1 }).eq('id', productId)

  await supabase.from('transactions').insert({
    account_id: buyerAccountId,
    type: 'expense',
    category: 'consumption',
    amount: product.price,
    description: `마트 구매 - ${product.name}`,
    approved_by: approvedBy,
  })

  await supabase.rpc('update_balance', { p_account_id: buyerAccountId, p_amount: -product.price })
}

export async function createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(product).select().single()
  if (error) throw error
  return data as Product
}
