import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import {
  HiOutlineHome,
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
  HiOutlineBriefcase,
  HiOutlineEllipsisHorizontal,
} from 'react-icons/hi2'

export function StudentLayout() {
  const { user, currentClassroom, logout } = useAuthStore()
  const { isEnabled } = useModuleStore()
  const navigate = useNavigate()

  const tabs = [
    { to: '/student', icon: HiOutlineHome, label: '홈', show: true, end: true },
    { to: '/student/bankbook', icon: HiOutlineBanknotes, label: '통장', show: true },
    { to: '/student/mart', icon: HiOutlineShoppingBag, label: '마트', show: isEnabled('mart') },
    { to: '/student/jobs', icon: HiOutlineBriefcase, label: '직업', show: isEnabled('job') },
    { to: '/student/more', icon: HiOutlineEllipsisHorizontal, label: '더보기', show: true },
  ].filter((tab) => tab.show)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-secondary">
      {/* Header */}
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-40 pwa-header">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{user?.avatar_preset_id || '😊'}</span>
          <div>
            <h2 className="text-base font-bold">{user?.name}</h2>
            <p className="text-[11px] text-text-tertiary leading-none mt-0.5">
              {currentClassroom?.school} {currentClassroom?.grade}-{currentClassroom?.class_num}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-text-tertiary hover:text-text-secondary active:text-text-primary px-3 py-2 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 pb-20 px-4 py-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-40 pwa-bottom-nav">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 min-w-[56px] flex-1 transition-colors active:bg-surface-tertiary ${
                  isActive ? 'text-primary-600' : 'text-text-tertiary'
                }`
              }
            >
              <tab.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium leading-none">{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
