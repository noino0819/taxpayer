import { supabase } from '@/lib/supabase'
import type { User, PrivacyConsent, PolicyDocument } from '@/types/database'
import { getCurrentPolicies } from '@/lib/api/policies'

export async function recordPrivacyConsent(userId: string, policyDocs?: PolicyDocument[]) {
  const docs = policyDocs ?? await getCurrentPolicies()
  const consents = docs.map((doc) => ({
    user_id: userId,
    consent_type: doc.type,
    version: doc.version,
    consented: true,
    policy_document_id: doc.id,
  }))
  if (consents.length === 0) return
  const { error } = await supabase.from('privacy_consents').insert(consents)
  if (error) throw error
}

export async function getPrivacyConsents(userId: string): Promise<PrivacyConsent[]> {
  const { data, error } = await supabase
    .from('privacy_consents')
    .select('*')
    .eq('user_id', userId)
    .order('consented_at', { ascending: false })
  if (error) throw error
  return data as PrivacyConsent[]
}

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

  await recordPrivacyConsent(data.id)
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

export async function signInStudent(loginId: string, inviteCode: string, password: string) {
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
    .eq('login_id', loginId)
    .eq('password', password)
    .eq('role', 'student')
    .eq('memberships.classroom_id', classroom.id)
    .single()
  if (userError) throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.')

  const membership = (user as any).memberships?.[0]
  if (membership?.status === 'pending') {
    throw new Error('PENDING_APPROVAL')
  }
  if (membership?.status === 'inactive') {
    throw new Error('가입이 거절되었습니다. 선생님에게 문의하세요.')
  }

  return user as User
}

export async function signUpStudent(loginId: string, name: string, password: string, inviteCode: string, avatarEmoji: string) {
  const { data: classroom, error: classError } = await supabase
    .from('classrooms')
    .select('id, name, school, grade, class_num')
    .eq('invite_code', inviteCode)
    .eq('status', 'active')
    .single()
  if (classError) throw new Error('유효하지 않은 초대 코드입니다.')

  const { data: duplicateId } = await supabase
    .from('users')
    .select('id, memberships!inner(classroom_id)')
    .eq('login_id', loginId)
    .eq('role', 'student')
    .eq('memberships.classroom_id', classroom.id)
    .maybeSingle()
  if (duplicateId) throw new Error('이미 사용 중인 아이디입니다. 다른 아이디를 입력해주세요.')

  const { data: existing } = await supabase
    .from('users')
    .select('id, memberships!inner(classroom_id, status)')
    .eq('login_id', loginId)
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
    .insert({ login_id: loginId, name, password, role: 'student', avatar_preset_id: avatarEmoji })
    .select()
    .single()
  if (userError) throw userError

  const { error: memError } = await supabase
    .from('memberships')
    .insert({ user_id: user.id, classroom_id: classroom.id, status: 'pending' })
  if (memError) throw memError

  await recordPrivacyConsent(user.id)
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

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function resetStudentPassword(userId: string): Promise<string> {
  const tempPassword = generateTempPassword()
  const { error } = await supabase
    .from('users')
    .update({ password: tempPassword, must_change_password: true })
    .eq('id', userId)
  if (error) throw error
  return tempPassword
}

export async function changeStudentPassword(userId: string, currentPassword: string, newPassword: string) {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('password')
    .eq('id', userId)
    .single()
  if (fetchError) throw fetchError
  if (user.password !== currentPassword) throw new Error('현재 비밀번호가 일치하지 않습니다.')

  const { error } = await supabase
    .from('users')
    .update({ password: newPassword, must_change_password: false })
    .eq('id', userId)
  if (error) throw error
}

export async function updateStudentAvatar(userId: string, avatarEmoji: string) {
  const { error } = await supabase
    .from('users')
    .update({ avatar_preset_id: avatarEmoji })
    .eq('id', userId)
  if (error) throw error
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

async function logAccountDeletion(userId: string, role: string, dataSummary: Record<string, unknown>) {
  await supabase.from('account_deletion_logs').insert({
    original_user_id: userId,
    role,
    deletion_reason: 'user_request',
    deleted_data_summary: dataSummary,
  })
}

export async function deleteTeacherAccount(userId: string) {
  await supabase
    .from('users')
    .select('name, email')
    .eq('id', userId)
    .single()

  const { data: classrooms } = await supabase
    .from('classrooms')
    .select('id, name')
    .eq('teacher_id', userId)

  let studentCount = 0
  const classroomNames: string[] = []

  if (classrooms && classrooms.length > 0) {
    for (const classroom of classrooms) {
      classroomNames.push(classroom.name)
      const { data: members } = await supabase
        .from('memberships')
        .select('user_id')
        .eq('classroom_id', classroom.id)

      if (members) {
        studentCount += members.length
        for (const member of members) {
          await supabase.from('accounts').delete().eq('user_id', member.user_id).eq('classroom_id', classroom.id)
          await supabase.from('job_assignments').delete().eq('user_id', member.user_id)
          await supabase.from('stock_transactions').delete().eq('user_id', member.user_id)
          await supabase.from('insurance_contracts').delete().eq('user_id', member.user_id)
          await supabase.from('savings_accounts').delete().eq('user_id', member.user_id)
          await supabase.from('privacy_consents').delete().eq('user_id', member.user_id)
        }
        const studentIds = members.map((m) => m.user_id)
        if (studentIds.length > 0) {
          await supabase.from('memberships').delete().eq('classroom_id', classroom.id)
          await supabase.from('users').delete().in('id', studentIds)
        }
      }

      await supabase.from('classrooms').delete().eq('id', classroom.id)
    }
  }

  await logAccountDeletion(userId, 'teacher', {
    deleted_at_iso: new Date().toISOString(),
    had_classrooms: classroomNames,
    student_count: studentCount,
  })

  await supabase.from('privacy_consents').delete().eq('user_id', userId)
  await supabase.from('users').delete().eq('id', userId)
  await supabase.auth.signOut()
}

export async function deleteStudentAccount(userId: string, classroomId: string) {
  await supabase
    .from('users')
    .select('name')
    .eq('id', userId)
    .single()

  const { data: account } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .eq('classroom_id', classroomId)
    .maybeSingle()

  await supabase.from('accounts').delete().eq('user_id', userId).eq('classroom_id', classroomId)
  await supabase.from('memberships').delete().eq('user_id', userId).eq('classroom_id', classroomId)
  await supabase.from('job_assignments').delete().eq('user_id', userId)
  await supabase.from('stock_transactions').delete().eq('user_id', userId)
  await supabase.from('insurance_contracts').delete().eq('user_id', userId)
  await supabase.from('savings_accounts').delete().eq('user_id', userId)
  await supabase.from('notifications').delete().eq('user_id', userId)
  await supabase.from('fines').delete().eq('offender_id', userId)
  await supabase.from('privacy_consents').delete().eq('user_id', userId)

  await logAccountDeletion(userId, 'student', {
    deleted_at_iso: new Date().toISOString(),
    classroom_id: classroomId,
    had_balance: account?.balance ?? 0,
  })

  const { data: otherMemberships } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', userId)

  if (!otherMemberships || otherMemberships.length === 0) {
    await supabase.from('users').delete().eq('id', userId)
  }
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
