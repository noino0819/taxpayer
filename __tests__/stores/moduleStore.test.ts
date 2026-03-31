import { describe, it, expect, beforeEach } from 'vitest'
import { useModuleStore } from '../../src/stores/moduleStore'
import type { ModuleConfig, ModuleName } from '../../src/types/database'

const ALL_MODULES: ModuleName[] = [
  'job', 'mart', 'real_estate', 'investment', 'insurance',
  'bank', 'credit', 'tax', 'fine', 'notification',
  'achievement', 'quiz',
]

const DEFAULT_ENABLED: ModuleName[] = ['tax', 'fine', 'notification']
const DEFAULT_DISABLED: ModuleName[] = ALL_MODULES.filter(m => !DEFAULT_ENABLED.includes(m))

describe('moduleStore', () => {
  beforeEach(() => {
    useModuleStore.setState({
      modules: {
        job: false, mart: false, real_estate: false, investment: false,
        insurance: false, bank: false, credit: false,
        tax: true, fine: true, notification: true,
        achievement: false, quiz: false,
      },
    })
  })

  describe('기본 상태', () => {
    it('tax, fine, notification만 기본 활성화되어 있다', () => {
      const state = useModuleStore.getState()
      for (const mod of DEFAULT_ENABLED) {
        expect(state.modules[mod]).toBe(true)
      }
      for (const mod of DEFAULT_DISABLED) {
        expect(state.modules[mod]).toBe(false)
      }
    })

    it('12개 모듈이 모두 존재한다', () => {
      const state = useModuleStore.getState()
      expect(Object.keys(state.modules)).toHaveLength(12)
      for (const mod of ALL_MODULES) {
        expect(mod in state.modules).toBe(true)
      }
    })
  })

  describe('setModule', () => {
    it('비활성 모듈을 활성화할 수 있다', () => {
      useModuleStore.getState().setModule('job', true)
      expect(useModuleStore.getState().modules.job).toBe(true)
    })

    it('활성 모듈을 비활성화할 수 있다', () => {
      useModuleStore.getState().setModule('tax', false)
      expect(useModuleStore.getState().modules.tax).toBe(false)
    })

    it('다른 모듈 상태에 영향을 주지 않는다', () => {
      useModuleStore.getState().setModule('investment', true)
      expect(useModuleStore.getState().modules.mart).toBe(false)
      expect(useModuleStore.getState().modules.tax).toBe(true)
    })
  })

  describe('isEnabled', () => {
    it('활성화된 모듈에 대해 true를 반환한다', () => {
      expect(useModuleStore.getState().isEnabled('tax')).toBe(true)
    })

    it('비활성화된 모듈에 대해 false를 반환한다', () => {
      expect(useModuleStore.getState().isEnabled('job')).toBe(false)
    })
  })

  describe('setModules', () => {
    it('전체 모듈 상태를 한번에 설정할 수 있다', () => {
      const newModules = {
        job: true, mart: true, real_estate: true, investment: true,
        insurance: true, bank: true, credit: true,
        tax: false, fine: false, notification: false,
        achievement: true, quiz: true,
      }
      useModuleStore.getState().setModules(newModules)
      const state = useModuleStore.getState()
      expect(state.modules.job).toBe(true)
      expect(state.modules.tax).toBe(false)
    })
  })

  describe('syncFromConfigs', () => {
    it('서버 설정에서 모듈 상태를 동기화한다', () => {
      const configs: ModuleConfig[] = [
        { id: '1', classroom_id: 'c1', module_name: 'job', is_enabled: true, settings_json: {}, updated_at: '' },
        { id: '2', classroom_id: 'c1', module_name: 'investment', is_enabled: true, settings_json: {}, updated_at: '' },
        { id: '3', classroom_id: 'c1', module_name: 'tax', is_enabled: false, settings_json: {}, updated_at: '' },
      ]
      useModuleStore.getState().syncFromConfigs(configs)
      const state = useModuleStore.getState()
      expect(state.modules.job).toBe(true)
      expect(state.modules.investment).toBe(true)
      expect(state.modules.tax).toBe(false)
    })

    it('설정에 없는 모듈은 기본값으로 복원된다', () => {
      useModuleStore.getState().setModule('mart', true)
      expect(useModuleStore.getState().modules.mart).toBe(true)

      useModuleStore.getState().syncFromConfigs([])
      expect(useModuleStore.getState().modules.mart).toBe(false)
      expect(useModuleStore.getState().modules.tax).toBe(true)
    })

    it('알 수 없는 모듈 이름은 무시한다', () => {
      const configs: ModuleConfig[] = [
        { id: '1', classroom_id: 'c1', module_name: 'unknown_module', is_enabled: true, settings_json: {}, updated_at: '' },
      ]
      useModuleStore.getState().syncFromConfigs(configs)
      expect(Object.keys(useModuleStore.getState().modules)).toHaveLength(12)
    })
  })
})
