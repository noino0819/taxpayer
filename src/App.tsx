import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'

import { TeacherLayout } from '@/components/layout/TeacherLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'

import { LoginPage } from '@/pages/auth/LoginPage'
import { TeacherRegisterPage } from '@/pages/auth/TeacherRegisterPage'

import { DashboardPage } from '@/pages/teacher/DashboardPage'
import { StudentsPage } from '@/pages/teacher/StudentsPage'
import { JobsManagePage } from '@/pages/teacher/JobsManagePage'
import { BankbookManagePage } from '@/pages/teacher/BankbookManagePage'
import { EconomyPage } from '@/pages/teacher/EconomyPage'
import { NotificationsPage } from '@/pages/teacher/NotificationsPage'
import { SettingsPage } from '@/pages/teacher/SettingsPage'

import { HomePage } from '@/pages/student/HomePage'
import { BankbookPage } from '@/pages/student/BankbookPage'
import { JobsPage } from '@/pages/student/JobsPage'
import { MartPage } from '@/pages/student/MartPage'
import { MorePage } from '@/pages/student/MorePage'
import { BankPage } from '@/pages/student/BankPage'
import { CreditPage } from '@/pages/student/CreditPage'
import { RealEstatePage } from '@/pages/student/RealEstatePage'
import { InvestmentPage } from '@/pages/student/InvestmentPage'
import { InsurancePage } from '@/pages/student/InsurancePage'
import { TaxManagePage } from '@/pages/teacher/TaxManagePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'teacher' | 'student' }) {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />

  return <>{children}</>
}

export default function App() {
  const { user } = useAuthStore()

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/teacher" element={<TeacherRegisterPage />} />

          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="jobs" element={<JobsManagePage />} />
            <Route path="bankbook" element={<BankbookManagePage />} />
            <Route path="economy" element={<EconomyPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="tax" element={<TaxManagePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="bankbook" element={<BankbookPage />} />
            <Route path="jobs" element={<JobsPage />} />
            <Route path="mart" element={<MartPage />} />
            <Route path="bank" element={<BankPage />} />
            <Route path="credit" element={<CreditPage />} />
            <Route path="real-estate" element={<RealEstatePage />} />
            <Route path="investment" element={<InvestmentPage />} />
            <Route path="insurance" element={<InsurancePage />} />
            <Route path="more" element={<MorePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      />
    </QueryClientProvider>
  )
}
