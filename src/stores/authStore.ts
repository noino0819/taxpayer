import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Classroom } from '@/types/database'

interface AuthState {
  user: User | null
  currentClassroom: Classroom | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setCurrentClassroom: (classroom: Classroom | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      currentClassroom: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setCurrentClassroom: (classroom) => set({ currentClassroom: classroom }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, currentClassroom: null }),
    }),
    {
      name: 'taxpayer-auth',
      partialize: (state) => ({
        user: state.user,
        currentClassroom: state.currentClassroom,
      }),
    },
  ),
)
