import { supabase } from '@/lib/supabase'
import type { Job, JobAssignment } from '@/types/database'

export async function getJobs(classroomId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('is_active', true)
    .order('created_at')
    .order('name')
  if (error) throw error
  return data as Job[]
}

export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'is_active'>): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert(job)
    .select()
    .single()
  if (error) throw error
  return data as Job
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .update(updates)
    .eq('id', jobId)
    .select()
    .single()
  if (error) throw error
  return data as Job
}

export async function getJobAssignments(classroomId: string): Promise<(JobAssignment & { job: Job; user: { id: string; name: string; avatar_preset_id: string | null } })[]> {
  const { data, error } = await supabase
    .from('job_assignments')
    .select('*, job:jobs!inner(*, classroom_id), user:users(id, name, avatar_preset_id)')
    .eq('job.classroom_id', classroomId)
    .eq('status', 'active')
  if (error) throw error
  return data as never
}

export async function getUserAssignment(userId: string, classroomId: string): Promise<(JobAssignment & { job: Job }) | null> {
  const { data } = await supabase
    .from('job_assignments')
    .select('*, job:jobs!inner(*)')
    .eq('user_id', userId)
    .eq('job.classroom_id', classroomId)
    .eq('status', 'active')
    .maybeSingle()
  return data as (JobAssignment & { job: Job }) | null
}

export async function assignJob(jobId: string, userId: string): Promise<JobAssignment> {
  const { data, error } = await supabase
    .from('job_assignments')
    .insert({ job_id: jobId, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data as JobAssignment
}

export async function deleteJob(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .update({ is_active: false })
    .eq('id', jobId)
  if (error) throw error
}

export async function unassignJob(assignmentId: string): Promise<void> {
  await supabase.from('job_assignments').update({ status: 'inactive' }).eq('id', assignmentId)
}
