import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useModuleConfigs } from '@/hooks/useQueries'
import { closeMarketDay } from '@/lib/api/investment'
import { updateModuleSettings } from '@/lib/api/modules'
import toast from 'react-hot-toast'

function getSeoulHour(): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', hour: 'numeric', hour12: false }).format(new Date()))
}

function getSeoulDateStr(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export function useAutoCloseMarket() {
  const { currentClassroom } = useAuthStore()
  const classroomId = currentClassroom?.id
  const queryClient = useQueryClient()
  const { data: moduleConfigs } = useModuleConfigs()
  const status = useRef<'idle' | 'running' | 'done'>('idle')
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!classroomId || !moduleConfigs) return

    const investmentConfig = moduleConfigs.find((c) => c.module_name === 'investment')
    const settings = investmentConfig?.settings_json as Record<string, unknown> | undefined
    const autoCloseEnabled = settings?.autoCloseEnabled === true
    const autoCloseHour = typeof settings?.autoCloseHour === 'number' ? settings.autoCloseHour : null

    if (!autoCloseEnabled || autoCloseHour === null) return

    const tryClose = async () => {
      if (status.current !== 'idle') return

      const currentHour = getSeoulHour()
      if (currentHour < autoCloseHour) return

      const todayStr = getSeoulDateStr()
      const lastClosedAt = (settings?.lastAutoClosedAt as string) ?? null
      if (lastClosedAt && lastClosedAt >= todayStr) return

      status.current = 'running'
      try {
        await closeMarketDay(classroomId)
        await updateModuleSettings(classroomId, 'investment', { lastAutoClosedAt: todayStr })
        queryClient.invalidateQueries({ queryKey: ['stocks'] })
        queryClient.invalidateQueries({ queryKey: ['module-configs'] })
        toast.success('주식 시장이 자동으로 마감되었습니다.')
        status.current = 'done'
      } catch {
        status.current = 'idle'
      }
    }

    tryClose()
    intervalRef.current = setInterval(tryClose, 60_000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [classroomId, moduleConfigs, queryClient])
}
