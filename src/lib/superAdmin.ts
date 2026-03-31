import type { User } from '@/types/database'
import { SUPER_ADMIN_EMAILS } from '@/lib/constants'

export function isSuperAdmin(user: User | null): boolean {
  if (!user || !user.email) return false
  return (SUPER_ADMIN_EMAILS as readonly string[]).includes(user.email)
}
