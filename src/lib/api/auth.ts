import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

export async function signUpTeacher(email: string, password: string, name: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  if (authError) throw authError
  if (!authData.user) throw new Error('회원가입에 실패했습니다.')

  const { data, error } = await supabase
    .from('users')
    .insert({ auth_id: authData.user.id, email, name, role: 'teacher' })
    .select()
    .single()
  if (error) throw error
  return data as User
}

export async function signInTeacher(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authError) throw authError

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authData.user.id)
    .single()
  if (error) throw error
  return data as User
}

export async function signInStudent(name: string, inviteCode: string, pin: string) {
  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('id')
    .eq('invite_code', inviteCode)
    .eq('status', 'active')
    .single()
  if (classError) throw new Error('유효하지 않은 초대 코드입니다.')

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*, memberships!inner(classroom_id)')
    .eq('name', name)
    .eq('pin', pin)
    .eq('role', 'student')
    .eq('memberships.classroom_id', classroom.id)
    .single()
  if (userError) throw new Error('이름 또는 PIN이 일치하지 않습니다.')

  return user as User
}

export async function signUpStudent(name: string, pin: string, classroomId: string, avatarEmoji: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ name, pin, role: 'student', avatar_preset_id: avatarEmoji })
    .select()
    .single()
  if (userError) throw userError

  await supabase.from('memberships').insert({ user_id: user.id, classroom_id: classroomId })

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('initial_balance')
    .eq('id', classroomId)
    .single()

  await supabase.from('accounts').insert({
    user_id: user.id,
    classroom_id: classroomId,
    balance: classroom?.initial_balance ?? 50,
    credit_score: 800,
    credit_grade: '2',
  })

  return user as User
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .single()
  return data as User | null
}
