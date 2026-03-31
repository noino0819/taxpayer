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
    .select('*, memberships!inner(classroom_id, status)')
    .eq('name', name)
    .eq('pin', pin)
    .eq('role', 'student')
    .eq('memberships.classroom_id', classroom.id)
    .single()
  if (userError) throw new Error('이름 또는 PIN이 일치하지 않습니다.')

  const membership = (user as any).memberships?.[0]
  if (membership?.status === 'pending') {
    throw new Error('PENDING_APPROVAL')
  }
  if (membership?.status === 'inactive') {
    throw new Error('가입이 거절되었습니다. 선생님에게 문의하세요.')
  }

  return user as User
}

export async function signUpStudent(name: string, pin: string, inviteCode: string, avatarEmoji: string) {
  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('id, name, school, grade, class_num')
    .eq('invite_code', inviteCode)
    .eq('status', 'active')
    .single()
  if (classError) throw new Error('유효하지 않은 초대 코드입니다.')

  const { data: existing } = await supabase
    .from('users')
    .select('id, memberships!inner(classroom_id, status)')
    .eq('name', name)
    .eq('pin', pin)
    .eq('role', 'student')
    .eq('memberships.classroom_id', classroom.id)
    .maybeSingle()

  if (existing) {
    const membership = (existing as any).memberships?.[0]
    if (membership?.status === 'pending') throw new Error('PENDING_APPROVAL')
    if (membership?.status === 'active') throw new Error('이미 가입된 학생입니다. 로그인해주세요.')
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ name, pin, role: 'student', avatar_preset_id: avatarEmoji })
    .select()
    .single()
  if (userError) throw userError

  const { error: memError } = await supabase
    .from('memberships')
    .insert({ user_id: user.id, classroom_id: classroom.id, status: 'pending' })
  if (memError) throw memError

  return user as User
}

export async function getPendingMembers(classroomId: string) {
  const { data, error } = await supabase
    .from('memberships')
    .select('*, user:users(*)')
    .eq('classroom_id', classroomId)
    .eq('status', 'pending')
    .order('joined_at', { ascending: true })
  if (error) throw error
  return data as (import('@/types/database').Membership & { user: User })[]
}

export async function approveStudent(membershipId: string, classroomId: string, userId: string) {
  const { error: memError } = await supabase
    .from('memberships')
    .update({ status: 'active' })
    .eq('id', membershipId)
  if (memError) throw memError

  const { data: classroom } = await supabase
    .from('classrooms')
    .select('initial_balance')
    .eq('id', classroomId)
    .single()

  const { error: accError } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      classroom_id: classroomId,
      balance: classroom?.initial_balance ?? 50,
      credit_score: 800,
      credit_grade: '2',
    })
  if (accError) throw accError
}

export async function rejectStudent(membershipId: string) {
  const { data: membership, error: fetchError } = await supabase
    .from('memberships')
    .select('user_id')
    .eq('id', membershipId)
    .single()
  if (fetchError) throw fetchError

  const { error: delMemError } = await supabase
    .from('memberships')
    .delete()
    .eq('id', membershipId)
  if (delMemError) throw delMemError

  const { data: otherMemberships } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', membership.user_id)

  if (!otherMemberships || otherMemberships.length === 0) {
    await supabase.from('users').delete().eq('id', membership.user_id)
  }
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
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
