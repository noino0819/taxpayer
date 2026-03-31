import { create } from 'zustand'
import type { ModuleName, ModuleConfig } from '@/types/database'

interface ModuleState {
  modules: Record<ModuleName, boolean>
  setModule: (key: ModuleName, enabled: boolean) => void
  setModules: (modules: Record<ModuleName, boolean>) => void
  isEnabled: (key: ModuleName) => boolean
  syncFromConfigs: (configs: ModuleConfig[]) => void
}

const defaultModules: Record<ModuleName, boolean> = {
  job: false,
  mart: false,
  real_estate: false,
  investment: false,
  insurance: false,
  bank: false,
  credit: false,
  tax: true,
  fine: true,
  notification: true,
  achievement: false,
  quiz: false,
}

export const useModuleStore = create<ModuleState>()((set, get) => ({
  modules: { ...defaultModules },
  setModule: (key, enabled) =>
    set((state) => ({ modules: { ...state.modules, [key]: enabled } })),
  setModules: (modules) => set({ modules }),
  isEnabled: (key) => get().modules[key] ?? false,
  syncFromConfigs: (configs) => {
    const updated = { ...defaultModules }
    for (const config of configs) {
      if (config.module_name in updated) {
        updated[config.module_name as ModuleName] = config.is_enabled
      }
    }
    set({ modules: updated })
  },
}))
