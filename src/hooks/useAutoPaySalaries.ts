import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useJobAssignments, useModuleConfigs } from '@/hooks/useQueries'
import { paySalaries } from '@/lib/api/accounts'
import { updateModuleSettings } from '@/lib/api/modules'
import toast from 'react-hot-toast'

type PayFrequency = 'weekly' | 'biweekly' | 'monthly'

interface PaySchedule {
  frequency: PayFrequency
  dayOfWeek: number
  dayOfMonth: number
}

const DEFAULT_SCHEDULE: PaySchedule = { frequency: 'weekly', dayOfWeek: 5, dayOfMonth: 1 }

function getSeoulToday(): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' })
  const [y, m, d] = formatter.format(new Date()).split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getSeoulDayOfWeek(): number {
  const dow = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', weekday: 'short' }).format(new Date())
  const map: Record<string, number> = { Sun: 7, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[dow] ?? 1
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getLastScheduledPayday(schedule: PaySchedule): Date {
  const today = getSeoulToday()

  if (schedule.frequency === 'monthly') {
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), schedule.dayOfMonth)
    if (thisMonth <= today) return thisMonth
    return new Date(today.getFullYear(), today.getMonth() - 1, schedule.dayOfMonth)
  }

  const currentDay = getSeoulDayOfWeek()
  let daysSince = currentDay - schedule.dayOfWeek
  if (daysSince < 0) daysSince += 7
  const lastPayWeekDay = new Date(today.getTime() - daysSince * 86400000)

  if (schedule.frequency === 'weekly') return lastPayWeekDay

  const weekNum = Math.floor((lastPayWeekDay.getTime() - new Date(lastPayWeekDay.getFullYear(), 0, 1).getTime()) / (7 * 86400000))
  if (weekNum % 2 === 0) return lastPayWeekDay
  return new Date(lastPayWeekDay.getTime() - 7 * 86400000)
}

export function useAutoPaySalaries() {
  const { currentClassroom, user } = useAuthStore()
  const classroomId = currentClassroom?.id
  const currency = currentClassroom?.currency_name || '미소'
  const queryClient = useQueryClient()

  const { data: assignments } = useJobAssignments()
  const { data: moduleConfigs } = useModuleConfigs()

  const status = useRef<'idle' | 'running' | 'done'>('idle')

  useEffect(() => {
    if (status.current !== 'idle') return
    if (!user || !classroomId || !moduleConfigs || !assignments) return

    const jobConfig = moduleConfigs.find((c) => c.module_name === 'job')
    const settings = jobConfig?.settings_json as Record<string, unknown> | undefined

    const schedule: PaySchedule = settings?.payFrequency
      ? {
          frequency: (settings.payFrequency as PayFrequency) || 'weekly',
          dayOfWeek: (settings.payDayOfWeek as number) || 5,
          dayOfMonth: (settings.payDayOfMonth as number) || 1,
        }
      : DEFAULT_SCHEDULE

    const lastPaidAt = (settings?.lastPaidAt as string) ?? null
    const excludedUserIds: string[] = (settings?.excludedUserIds as string[]) ?? []

    const lastPayday = getLastScheduledPayday(schedule)
    const paydayStr = toDateStr(lastPayday)
    const todayStr = toDateStr(getSeoulToday())

    if (paydayStr > todayStr) return
    if (lastPaidAt && lastPaidAt >= paydayStr) return

    const assignedStudents = assignments.map((a: any) => ({
      userId: a.user_id as string,
      jobName: (a.job?.name as string) ?? '',
      salary: (a.job?.salary as number) ?? 0,
    }))

    if (assignedStudents.length === 0) return

    const items = assignedStudents
      .filter((s) => !excludedUserIds.includes(s.userId))
      .map((s) => ({ userId: s.userId, amount: s.salary, jobName: s.jobName }))

    status.current = 'running'

    const run = async () => {
      try {
        if (items.length > 0) {
          const total = items.reduce((sum, i) => sum + i.amount, 0)
          await paySalaries(classroomId, items, user.id)
          toast.success(`월급일! ${items.length}명에게 총 ${total.toLocaleString()}${currency} 자동 지급 완료`)
        }
        await updateModuleSettings(classroomId, 'job', { lastPaidAt: paydayStr, excludedUserIds: [] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        queryClient.invalidateQueries({ queryKey: ['transactions'] })
        queryClient.invalidateQueries({ queryKey: ['my-account'] })
        queryClient.invalidateQueries({ queryKey: ['account-stats'] })
        queryClient.invalidateQueries({ queryKey: ['monthly-stats'] })
        queryClient.invalidateQueries({ queryKey: ['module-configs'] })
        status.current = 'done'
      } catch {
        status.current = 'idle'
        toast.error('자동 월급 지급에 실패했습니다.')
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, classroomId, moduleConfigs, assignments])
}
