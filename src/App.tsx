import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import toast, { Toaster, ToastBar } from 'react-hot-toast'
import { useAuthStore } from '@/stores/authStore'
import { InstallPrompt, IOSInstallGuide } from '@/components/common/InstallPrompt'

import { TeacherLayout } from '@/components/layout/TeacherLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { TeacherRegisterPage } from '@/pages/auth/TeacherRegisterPage'
import { StudentRegisterPage } from '@/pages/auth/StudentRegisterPage'
import { PendingApprovalPage } from '@/pages/auth/PendingApprovalPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'

const DashboardPage = lazy(() => import('@/pages/teacher/DashboardPage').then(m => ({ default: m.DashboardPage })))
const StudentsPage = lazy(() => import('@/pages/teacher/StudentsPage').then(m => ({ default: m.StudentsPage })))
const JobsManagePage = lazy(() => import('@/pages/teacher/JobsManagePage').then(m => ({ default: m.JobsManagePage })))
const BankbookManagePage = lazy(() => import('@/pages/teacher/BankbookManagePage').then(m => ({ default: m.BankbookManagePage })))
const EconomyPage = lazy(() => import('@/pages/teacher/EconomyPage').then(m => ({ default: m.EconomyPage })))
const NotificationsPage = lazy(() => import('@/pages/teacher/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const SettingsPage = lazy(() => import('@/pages/teacher/SettingsPage').then(m => ({ default: m.SettingsPage })))
const TaxManagePage = lazy(() => import('@/pages/teacher/TaxManagePage').then(m => ({ default: m.TaxManagePage })))

const HomePage = lazy(() => import('@/pages/student/HomePage').then(m => ({ default: m.HomePage })))
const BankbookPage = lazy(() => import('@/pages/student/BankbookPage').then(m => ({ default: m.BankbookPage })))
const JobsPage = lazy(() => import('@/pages/student/JobsPage').then(m => ({ default: m.JobsPage })))
const MartPage = lazy(() => import('@/pages/student/MartPage').then(m => ({ default: m.MartPage })))
const MorePage = lazy(() => import('@/pages/student/MorePage').then(m => ({ default: m.MorePage })))
const BankPage = lazy(() => import('@/pages/student/BankPage').then(m => ({ default: m.BankPage })))
const CreditPage = lazy(() => import('@/pages/student/CreditPage').then(m => ({ default: m.CreditPage })))
const RealEstatePage = lazy(() => import('@/pages/student/RealEstatePage').then(m => ({ default: m.RealEstatePage })))
const InvestmentPage = lazy(() => import('@/pages/student/InvestmentPage').then(m => ({ default: m.InvestmentPage })))
const InsurancePage = lazy(() => import('@/pages/student/InsurancePage').then(m => ({ default: m.InsurancePage })))
const AchievementsPage = lazy(() => import('@/pages/student/AchievementsPage').then(m => ({ default: m.AchievementsPage })))
const QuizPage = lazy(() => import('@/pages/student/QuizPage').then(m => ({ default: m.QuizPage })))
const BoardPage = lazy(() => import('@/pages/student/BoardPage').then(m => ({ default: m.BoardPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-text-tertiary">로딩 중...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: 'teacher' | 'student' }) {
  const { user } = useAuthStore()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.role === 'teacher' ? '/teacher' : '/student'} replace />

  return <>{children}</>
}

export default function App() {
  const { user, initAuth } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/register/student" element={<StudentRegisterPage />} />
            <Route path="/pending-approval" element={<PendingApprovalPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

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
              <Route path="achievements" element={<AchievementsPage />} />
              <Route path="quiz" element={<QuizPage />} />
              <Route path="board" element={<BoardPage />} />
              <Route path="more" element={<MorePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <InstallPrompt />
      <IOSInstallGuide />

      <Toaster
        position="top-center"
        containerStyle={{ top: 'env(safe-area-inset-top, 8px)' }}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            maxWidth: '90vw',
            cursor: 'pointer',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#fff' },
          },
        }}
      >
        {(t) => (
          <div onClick={() => toast.dismiss(t.id)}>
            <ToastBar toast={t} style={t.style}>
              {({ icon, message }) => (
                <div className="flex items-center gap-2 w-full">
                  {icon}
                  {message}
                </div>
              )}
            </ToastBar>
          </div>
        )}
      </Toaster>
    </QueryClientProvider>
  )
}
