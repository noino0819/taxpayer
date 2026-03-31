import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Classroom } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { getStudentClassroom, getTeacherClassrooms } from '@/lib/api/classrooms'

interface AuthState {
  user: User | null
  currentClassroom: Classroom | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setCurrentClassroom: (classroom: Classroom | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  initAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      currentClassroom: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setCurrentClassroom: (classroom) => set({ currentClassroom: classroom }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => {
        supabase.auth.signOut().catch(() => {})
        set({ user: null, currentClassroom: null })
      },
      initAuth: async (): Promise<void> => {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (!authUser) {
            const stored = get().user
            if (stored) { set({ isLoading: false }); return }
            set({ user: null, currentClassroom: null, isLoading: false })
            return
          }

          const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', authUser.id)
            .single()

          if (!dbUser) { set({ isLoading: false }); return }

          set({ user: dbUser as User })

          if (dbUser.role === 'teacher') {
            const classrooms = await getTeacherClassrooms(dbUser.id)
            if (classrooms.length > 0) set({ currentClassroom: classrooms[0] })
          } else {
            const classroom = await getStudentClassroom(dbUser.id)
            if (classroom) set({ currentClassroom: classroom })
          }
        } catch {
          // 네트워크 오류 시 persisted 상태 유지
        } finally {
          set({ isLoading: false })
        }
      },
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
