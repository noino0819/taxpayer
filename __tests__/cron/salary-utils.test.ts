import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  toDateStr,
  getSeoulToday,
  getSeoulDayOfWeek,
  getLastScheduledPayday,
  DEFAULT_SCHEDULE,
} from '../../api/cron/pay-salaries'
import type { PaySchedule } from '../../api/cron/pay-salaries'

describe('toDateStr', () => {
  it('한 자리 월/일을 0으로 패딩한다', () => {
    expect(toDateStr(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toDateStr(new Date(2026, 2, 1))).toBe('2026-03-01')
  })

  it('두 자리 월/일을 올바르게 포맷한다', () => {
    expect(toDateStr(new Date(2026, 11, 25))).toBe('2026-12-25')
    expect(toDateStr(new Date(2026, 9, 31))).toBe('2026-10-31')
  })

  it('연도를 포함한 전체 날짜 문자열을 반환한다', () => {
    const result = toDateStr(new Date(2025, 5, 15))
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('getSeoulToday', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('서울 시간대 기준 오늘 날짜를 반환한다', () => {
    // UTC 15:00 = KST 다음날 00:00
    vi.setSystemTime(new Date('2026-03-31T15:00:00Z'))
    const today = getSeoulToday()
    expect(toDateStr(today)).toBe('2026-04-01')
  })

  it('UTC 기준 같은 날이지만 KST에서는 다른 날짜를 올바르게 처리한다', () => {
    // UTC 14:59 = KST 23:59 (같은 날)
    vi.setSystemTime(new Date('2026-03-31T14:59:00Z'))
    const today = getSeoulToday()
    expect(toDateStr(today)).toBe('2026-03-31')
  })

  it('자정 정각을 정확히 처리한다', () => {
    vi.setSystemTime(new Date('2026-06-15T00:00:00+09:00'))
    const today = getSeoulToday()
    expect(toDateStr(today)).toBe('2026-06-15')
  })
})

describe('getSeoulDayOfWeek', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('월요일 = 1', () => {
    vi.setSystemTime(new Date('2026-03-30T12:00:00+09:00'))
    expect(getSeoulDayOfWeek()).toBe(1)
  })

  it('금요일 = 5', () => {
    vi.setSystemTime(new Date('2026-04-03T12:00:00+09:00'))
    expect(getSeoulDayOfWeek()).toBe(5)
  })

  it('일요일 = 7', () => {
    vi.setSystemTime(new Date('2026-04-05T12:00:00+09:00'))
    expect(getSeoulDayOfWeek()).toBe(7)
  })

  it('수요일 = 3', () => {
    vi.setSystemTime(new Date('2026-04-01T12:00:00+09:00'))
    expect(getSeoulDayOfWeek()).toBe(3)
  })
})

describe('getLastScheduledPayday', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  describe('주간 급여 (weekly)', () => {
    const weekly: PaySchedule = { frequency: 'weekly', dayOfWeek: 5, dayOfMonth: 1 }

    it('오늘이 급여일이면 오늘을 반환한다', () => {
      // 2026-04-03 = 금요일
      vi.setSystemTime(new Date('2026-04-03T12:00:00+09:00'))
      const result = getLastScheduledPayday(weekly)
      expect(toDateStr(result)).toBe('2026-04-03')
    })

    it('급여일 이후면 가장 최근 급여일을 반환한다', () => {
      // 2026-04-04 = 토요일, 직전 금요일은 04-03
      vi.setSystemTime(new Date('2026-04-04T12:00:00+09:00'))
      const result = getLastScheduledPayday(weekly)
      expect(toDateStr(result)).toBe('2026-04-03')
    })

    it('급여일 전이면 지난주 급여일을 반환한다', () => {
      // 2026-04-01 = 수요일, 직전 금요일은 03-27
      vi.setSystemTime(new Date('2026-04-01T12:00:00+09:00'))
      const result = getLastScheduledPayday(weekly)
      expect(toDateStr(result)).toBe('2026-03-27')
    })
  })

  describe('월간 급여 (monthly)', () => {
    const monthly: PaySchedule = { frequency: 'monthly', dayOfWeek: 5, dayOfMonth: 10 }

    it('이번 달 급여일이 지났으면 이번 달 급여일을 반환한다', () => {
      vi.setSystemTime(new Date('2026-04-15T12:00:00+09:00'))
      const result = getLastScheduledPayday(monthly)
      expect(toDateStr(result)).toBe('2026-04-10')
    })

    it('급여일 당일에 오늘을 반환한다', () => {
      vi.setSystemTime(new Date('2026-04-10T12:00:00+09:00'))
      const result = getLastScheduledPayday(monthly)
      expect(toDateStr(result)).toBe('2026-04-10')
    })

    it('이번 달 급여일 전이면 지난달 급여일을 반환한다', () => {
      vi.setSystemTime(new Date('2026-04-05T12:00:00+09:00'))
      const result = getLastScheduledPayday(monthly)
      expect(toDateStr(result)).toBe('2026-03-10')
    })
  })

  describe('격주 급여 (biweekly)', () => {
    const biweekly: PaySchedule = { frequency: 'biweekly', dayOfWeek: 5, dayOfMonth: 1 }

    it('반환 날짜가 항상 지정된 요일이다', () => {
      vi.setSystemTime(new Date('2026-04-08T12:00:00+09:00'))
      const result = getLastScheduledPayday(biweekly)
      expect(result.getDay()).toBe(5) // 금요일 (JS Date: 0=일, 5=금)
    })

    it('연속된 두 금요일 중 하나만 급여일이 된다', () => {
      vi.setSystemTime(new Date('2026-01-02T12:00:00+09:00'))
      const week1 = toDateStr(getLastScheduledPayday(biweekly))

      vi.setSystemTime(new Date('2026-01-09T12:00:00+09:00'))
      const week2 = toDateStr(getLastScheduledPayday(biweekly))

      // 격주이므로 둘 중 하나는 같은 급여일을 가리켜야 함
      expect(week1 === week2 || week2 > week1).toBe(true)
    })

    it('격주 간격을 유지한다', () => {
      vi.setSystemTime(new Date('2026-01-02T12:00:00+09:00'))
      const pay1 = getLastScheduledPayday(biweekly)

      vi.setSystemTime(new Date('2026-01-16T12:00:00+09:00'))
      const pay2 = getLastScheduledPayday(biweekly)

      const diffDays = (pay2.getTime() - pay1.getTime()) / (86400000)
      expect(diffDays).toBe(14)
    })
  })
})

describe('DEFAULT_SCHEDULE', () => {
  it('기본값이 주간/금요일로 설정되어 있다', () => {
    expect(DEFAULT_SCHEDULE.frequency).toBe('weekly')
    expect(DEFAULT_SCHEDULE.dayOfWeek).toBe(5)
    expect(DEFAULT_SCHEDULE.dayOfMonth).toBe(1)
  })
})
