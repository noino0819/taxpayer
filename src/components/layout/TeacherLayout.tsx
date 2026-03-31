import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineBanknotes,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBellAlert,
  HiOutlineChartBar,
  HiOutlineReceiptPercent,
  HiBars3,
  HiXMark,
} from 'react-icons/hi2'

const navItems = [
  { to: '/teacher', icon: HiOutlineHome, label: '대시보드', end: true },
  { to: '/teacher/students', icon: HiOutlineUserGroup, label: '학생 관리' },
  { to: '/teacher/jobs', icon: HiOutlineBriefcase, label: '직업 관리' },
  { to: '/teacher/bankbook', icon: HiOutlineBanknotes, label: '통장 관리' },
  { to: '/teacher/tax', icon: HiOutlineReceiptPercent, label: '세금/벌금' },
  { to: '/teacher/economy', icon: HiOutlineChartBar, label: '경제 현황' },
  { to: '/teacher/notifications', icon: HiOutlineBellAlert, label: '알림' },
  { to: '/teacher/settings', icon: HiOutlineCog6Tooth, label: '학급 설정' },
]

export function TeacherLayout() {
  const { user, currentClassroom, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-border flex-col fixed h-full">
        <div className="p-5 border-b border-border">
          <h1 className="text-xl font-bold text-primary-600">🏫 TaxPayer</h1>
          {currentClassroom && (
            <p className="text-sm text-text-secondary mt-1">
              {currentClassroom.school} {currentClassroom.grade}학년 {currentClassroom.class_num}반
            </p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-lg">
              👨‍🏫
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-text-tertiary">교사</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-tertiary transition-colors"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-surface border-b border-border z-50 pwa-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-surface-tertiary active:bg-border transition-colors"
            >
              <HiBars3 className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-base font-bold text-primary-600">🏫 TaxPayer</h1>
              {currentClassroom && (
                <p className="text-[11px] text-text-tertiary">
                  {currentClassroom.school} {currentClassroom.grade}학년 {currentClassroom.class_num}반
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/teacher/notifications"
              className="p-2 rounded-xl hover:bg-surface-tertiary relative"
            >
              <HiOutlineBellAlert className="w-5 h-5 text-text-secondary" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500" />
            </NavLink>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 flex flex-col shadow-xl safe-top"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h1 className="text-lg font-bold text-primary-600">🏫 TaxPayer</h1>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-surface-tertiary"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-text-secondary hover:bg-surface-tertiary active:bg-border-light'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-border safe-bottom">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-xl">
                    👨‍🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-text-tertiary">교사</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-surface-tertiary active:bg-border-light transition-colors"
                >
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
