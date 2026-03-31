import { supabase } from '@/lib/supabase'
import type { Classroom, Membership, User } from '@/types/database'

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export async function createClassroom(
  teacherId: string,
  data: { school: string; grade: number; classNum: string; currencyName?: string; initialBalance?: number },
): Promise<Classroom> {
  const { data: classroom, error } = await supabase
    .from('classrooms')
    .insert({
      name: `${data.grade}학년 ${data.classNum}반`,
      school: data.school,
      grade: data.grade,
      class_num: data.classNum,
      teacher_id: teacherId,
      currency_name: data.currencyName || '미소',
      currency_unit: data.currencyName || '미소',
      initial_balance: data.initialBalance ?? 50,
      invite_code: generateInviteCode(),
    })
    .select()
    .single()
  if (error) throw error
  return classroom as Classroom
}

export async function getTeacherClassrooms(teacherId: string): Promise<Classroom[]> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('teacher_id', teacherId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Classroom[]
}

export async function getClassroom(classroomId: string): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', classroomId)
    .single()
  if (error) throw error
  return data as Classroom
}

export async function getClassroomByInviteCode(code: string): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('invite_code', code)
    .eq('status', 'active')
    .single()
  if (error) throw error
  return data as Classroom
}

export async function updateClassroom(classroomId: string, updates: Partial<Classroom>): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .update(updates)
    .eq('id', classroomId)
    .select()
    .single()
  if (error) throw error
  return data as Classroom
}

export async function getClassroomMembers(classroomId: string): Promise<(Membership & { user: User })[]> {
  const { data, error } = await supabase
    .from('memberships')
    .select('*, user:users(*)')
    .eq('classroom_id', classroomId)
    .eq('status', 'active')
    .order('joined_at')
  if (error) throw error
  return data as (Membership & { user: User })[]
}

export async function getStudentClassroom(userId: string): Promise<Classroom | null> {
  const { data } = await supabase
    .from('memberships')
    .select('classroom:classrooms(*)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  return ((data as any)?.classroom as Classroom) ?? null
}
