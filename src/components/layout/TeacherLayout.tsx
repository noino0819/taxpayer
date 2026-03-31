import { Outlet, NavLink, useNavigate } from 'react-router-dom'
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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      <aside className="w-64 bg-surface border-r border-border flex flex-col fixed h-full">
        <div className="p-5 border-b border-border">
          <h1 className="text-xl font-bold text-primary-600">🏫 TaxPayer</h1>
          {currentClassroom && (
            <p className="text-sm text-text-secondary mt-1">
              {currentClassroom.school} {currentClassroom.grade}-{currentClassroom.class_num}
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

      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  )
}
