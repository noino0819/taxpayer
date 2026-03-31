import { create } from 'zustand'
import type { ModuleName } from '@/types/database'

interface ModuleState {
  modules: Record<ModuleName, boolean>
  setModule: (name: ModuleName, enabled: boolean) => void
  setModules: (modules: Record<ModuleName, boolean>) => void
  isEnabled: (name: ModuleName) => boolean
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
  setModule: (name, enabled) =>
    set((state) => ({
      modules: { ...state.modules, [name]: enabled },
    })),
  setModules: (modules) => set({ modules }),
  isEnabled: (name) => get().modules[name] ?? false,
}))
