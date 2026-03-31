import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'

export async function getNotifications(classroomId: string, userId?: string): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (userId) {
    query = query.or(`user_id.eq.${userId},user_id.is.null`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Notification[]
}

export async function markAsRead(notificationId: string): Promise<void> {
  await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)
}

export async function markAllAsRead(classroomId: string, userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('classroom_id', classroomId)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .eq('is_read', false)
}

export async function createNotification(params: {
  classroomId: string
  userId?: string
  type: string
  title: string
  message: string
}): Promise<void> {
  await supabase.from('notifications').insert({
    classroom_id: params.classroomId,
    user_id: params.userId ?? null,
    type: params.type,
    title: params.title,
    message: params.message,
  })
}
