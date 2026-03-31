import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { BrandLogo } from '@/components/common/BrandLogo'
import {
  HiOutlineDocumentText,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineAcademicCap,
} from 'react-icons/hi2'

const navItems = [
  { to: '/admin/policies', icon: HiOutlineDocumentText, label: '약관 관리' },
]

export function AdminLayout() {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      <aside className="hidden lg:flex w-[260px] bg-surface border-r border-border/50 flex-col fixed h-full">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white shadow-[0_2px_8px_rgba(139,92,246,0.3)]">
              <BrandLogo size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-violet-600">관리자 패널</h1>
              <p className="text-[11px] text-text-tertiary leading-none mt-0.5">
                Super Admin
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((navItem) => (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-50 text-violet-600 shadow-[0_1px_4px_rgba(139,92,246,0.08)]'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`
              }
            >
              <navItem.icon className="w-5 h-5 flex-shrink-0" />
              {navItem.label}
            </NavLink>
          ))}

          <div className="my-3 border-t border-border/50" />

          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-text-secondary hover:bg-surface-tertiary hover:text-text-primary w-full"
          >
            <HiOutlineAcademicCap className="w-5 h-5 flex-shrink-0" />
            교사 페이지로
          </button>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 flex items-center justify-center text-lg">
              🛡️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-text-tertiary">슈퍼 관리자</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-b border-border/50 z-50 pwa-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white">
              <BrandLogo size={17} className="text-white" />
            </div>
            <h1 className="text-sm font-extrabold text-violet-600">관리자 패널</h1>
          </div>
          <button
            onClick={() => navigate('/teacher')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-600 bg-violet-50 hover:bg-violet-100 transition-colors"
          >
            <HiOutlineArrowLeftOnRectangle className="w-4 h-4" />
            교사 페이지
          </button>
        </div>
        <div className="flex border-t border-border/30">
          {navItems.map((navItem) => (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors ${
                  isActive ? 'text-violet-600 border-b-2 border-violet-500' : 'text-text-tertiary'
                }`
              }
            >
              <navItem.icon className="w-4 h-4" />
              {navItem.label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="flex-1 lg:ml-[260px] pt-24 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  )
}
