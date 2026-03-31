import { describe, it, expect } from 'vitest'
import {
  CREDIT_GRADES,
  MODULE_LABELS,
  DEFAULT_JOBS,
  AVATAR_PRESETS,
  STOCK_EVENT_PRESETS,
  STOCK_FACTOR_LABELS,
  DEFAULT_CURRENCY_NAME,
  DEFAULT_INITIAL_BALANCE,
  DEFAULT_CREDIT_SCORE,
  DEFAULT_CREDIT_GRADE,
} from '../../src/lib/constants'
import type { ModuleName } from '../../src/types/database'

const ALL_MODULES: ModuleName[] = [
  'job', 'mart', 'real_estate', 'investment', 'insurance',
  'bank', 'credit', 'tax', 'fine', 'notification',
  'achievement', 'quiz',
]

describe('CREDIT_GRADES', () => {
  it('5개 등급이 정의되어 있다', () => {
    expect(CREDIT_GRADES).toHaveLength(5)
  })

  it('등급이 1부터 5까지 순서대로 정렬되어 있다', () => {
    CREDIT_GRADES.forEach((g, i) => {
      expect(g.grade).toBe(i + 1)
    })
  })

  it('0~1000 전체 범위를 빈틈없이 커버한다', () => {
    const sorted = [...CREDIT_GRADES].sort((a, b) => a.min - b.min)
    expect(sorted[0].min).toBe(0)
    expect(sorted[sorted.length - 1].max).toBe(1000)

    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].min).toBe(sorted[i - 1].max + 1)
    }
  })

  it('모든 등급에 label과 color가 있다', () => {
    for (const grade of CREDIT_GRADES) {
      expect(grade.label).toBeTruthy()
      expect(grade.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })
})

describe('MODULE_LABELS', () => {
  it('모든 ModuleName에 대한 라벨이 정의되어 있다', () => {
    for (const mod of ALL_MODULES) {
      expect(MODULE_LABELS[mod]).toBeDefined()
      expect(MODULE_LABELS[mod].name).toBeTruthy()
      expect(MODULE_LABELS[mod].description).toBeTruthy()
    }
  })

  it('defaultEnabled 값이 boolean이다', () => {
    for (const key of Object.keys(MODULE_LABELS)) {
      expect(typeof MODULE_LABELS[key].defaultEnabled).toBe('boolean')
    }
  })

  it('tax, fine, notification이 기본 활성화되어 있다', () => {
    expect(MODULE_LABELS.tax.defaultEnabled).toBe(true)
    expect(MODULE_LABELS.fine.defaultEnabled).toBe(true)
    expect(MODULE_LABELS.notification.defaultEnabled).toBe(true)
  })
})

describe('DEFAULT_JOBS', () => {
  it('기본 직업이 1개 이상 정의되어 있다', () => {
    expect(DEFAULT_JOBS.length).toBeGreaterThan(0)
  })

  it('모든 직업에 필수 필드가 있다', () => {
    for (const job of DEFAULT_JOBS) {
      expect(job.name).toBeTruthy()
      expect(job.description).toBeTruthy()
      expect(job.salary).toBeGreaterThan(0)
      expect(job.maxCount).toBeGreaterThan(0)
    }
  })

  it('직업 이름이 중복되지 않는다', () => {
    const names = DEFAULT_JOBS.map(j => j.name)
    expect(new Set(names).size).toBe(names.length)
  })
})

describe('AVATAR_PRESETS', () => {
  it('4개 카테고리가 정의되어 있다', () => {
    expect(AVATAR_PRESETS).toHaveLength(4)
  })

  it('각 카테고리에 이모지가 포함되어 있다', () => {
    for (const preset of AVATAR_PRESETS) {
      expect(preset.category).toBeTruthy()
      expect(preset.emojis.length).toBeGreaterThan(0)
    }
  })

  it('예상 카테고리가 모두 존재한다', () => {
    const categories = AVATAR_PRESETS.map(p => p.category)
    expect(categories).toContain('animal')
    expect(categories).toContain('character')
    expect(categories).toContain('job')
    expect(categories).toContain('color')
  })
})

describe('STOCK_EVENT_PRESETS', () => {
  it('이벤트 프리셋이 1개 이상 정의되어 있다', () => {
    expect(STOCK_EVENT_PRESETS.length).toBeGreaterThan(0)
  })

  it('모든 프리셋에 title, description, effects, type이 있다', () => {
    for (const preset of STOCK_EVENT_PRESETS) {
      expect(preset.title).toBeTruthy()
      expect(preset.description).toBeTruthy()
      expect(preset.effects).toBeDefined()
      expect(['positive', 'negative']).toContain(preset.type)
    }
  })

  it('positive와 negative 이벤트가 모두 있다', () => {
    const types = STOCK_EVENT_PRESETS.map(p => p.type)
    expect(types).toContain('positive')
    expect(types).toContain('negative')
  })
})

describe('STOCK_FACTOR_LABELS', () => {
  it('주요 팩터 라벨이 정의되어 있다', () => {
    expect(STOCK_FACTOR_LABELS.attendance).toBeTruthy()
    expect(STOCK_FACTOR_LABELS.satisfaction).toBeTruthy()
    expect(STOCK_FACTOR_LABELS.cleanliness).toBeTruthy()
  })
})

describe('기본 상수값', () => {
  it('기본 화폐 이름이 비어있지 않다', () => {
    expect(DEFAULT_CURRENCY_NAME).toBeTruthy()
  })

  it('기본 초기 잔액이 양수이다', () => {
    expect(DEFAULT_INITIAL_BALANCE).toBeGreaterThan(0)
  })

  it('기본 신용 점수가 유효한 범위이다', () => {
    expect(DEFAULT_CREDIT_SCORE).toBeGreaterThanOrEqual(0)
    expect(DEFAULT_CREDIT_SCORE).toBeLessThanOrEqual(1000)
  })

  it('기본 신용 등급이 1~5 범위이다', () => {
    expect(DEFAULT_CREDIT_GRADE).toBeGreaterThanOrEqual(1)
    expect(DEFAULT_CREDIT_GRADE).toBeLessThanOrEqual(5)
  })
})
