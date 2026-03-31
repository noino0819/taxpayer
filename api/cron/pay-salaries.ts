import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

type PayFrequency = 'weekly' | 'biweekly' | 'monthly'

interface PaySchedule {
  frequency: PayFrequency
  dayOfWeek: number
  dayOfMonth: number
}

const DEFAULT_SCHEDULE: PaySchedule = { frequency: 'weekly', dayOfWeek: 5, dayOfMonth: 1 }

function getSeoulToday(): Date {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date()).split('-').map(Number)
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const authHeader = req.headers['authorization']
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  try {
    const { data: configs } = await supabase
      .from('module_configs')
      .select('classroom_id, settings_json')
      .eq('module_name', 'job')
      .eq('is_enabled', true)

    if (!configs || configs.length === 0) {
      return res.json({ message: 'No classrooms with job module', processed: 0 })
    }

    const todayStr = toDateStr(getSeoulToday())
    let processed = 0

    for (const config of configs) {
      const settings = config.settings_json as Record<string, unknown> | null
      if (!settings) continue

      const schedule: PaySchedule = settings.payFrequency
        ? {
            frequency: (settings.payFrequency as PayFrequency) || 'weekly',
            dayOfWeek: (settings.payDayOfWeek as number) || 5,
            dayOfMonth: (settings.payDayOfMonth as number) || 1,
          }
        : DEFAULT_SCHEDULE

      const lastPaidAt = (settings.lastPaidAt as string) ?? null
      const excludedUserIds: string[] = (settings.excludedUserIds as string[]) ?? []

      const lastPayday = getLastScheduledPayday(schedule)
      const paydayStr = toDateStr(lastPayday)

      if (paydayStr > todayStr) continue
      if (lastPaidAt && lastPaidAt >= paydayStr) continue

      const { data: assignments } = await supabase
        .from('job_assignments')
        .select('user_id, job:jobs!inner(name, salary, classroom_id)')
        .eq('job.classroom_id', config.classroom_id)
        .eq('status', 'active')

      if (!assignments || assignments.length === 0) continue

      const items = (assignments as unknown as { user_id: string; job: { name: string; salary: number } }[])
        .filter((a) => !excludedUserIds.includes(a.user_id))
        .map((a) => ({ userId: a.user_id, amount: a.job.salary, jobName: a.job.name }))

      if (items.length === 0) continue

      const userIds = items.map((i) => i.userId)
      const { data: accounts } = await supabase
        .from('accounts')
        .select('id, user_id')
        .eq('classroom_id', config.classroom_id)
        .in('user_id', userIds)

      if (!accounts || accounts.length === 0) continue

      const accountMap = new Map(accounts.map((a) => [a.user_id, a.id]))

      const txns = items
        .filter((item) => accountMap.has(item.userId))
        .map((item) => ({
          account_id: accountMap.get(item.userId)!,
          type: 'income' as const,
          category: 'salary' as const,
          amount: item.amount,
          description: `${item.jobName} 월급`,
          approved_by: null,
        }))

      if (txns.length === 0) continue

      const { error: txError } = await supabase.from('transactions').insert(txns)
      if (txError) {
        console.error(`Salary insert error for classroom ${config.classroom_id}:`, txError)
        continue
      }

      for (const txn of txns) {
        await supabase.rpc('update_balance', { p_account_id: txn.account_id, p_amount: txn.amount })
      }

      const merged = { ...settings, lastPaidAt: paydayStr, excludedUserIds: [] }
      await supabase
        .from('module_configs')
        .upsert(
          { classroom_id: config.classroom_id, module_name: 'job', settings_json: merged, updated_at: new Date().toISOString() },
          { onConflict: 'classroom_id,module_name' },
        )

      processed++
    }

    return res.json({ ok: true, processed, date: todayStr })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('pay-salaries cron error:', message)
    return res.status(500).json({ error: message })
  }
}
