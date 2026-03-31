import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { useMyAccount } from '@/hooks/useQueries'
import {
  HiOutlineHome,
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
  HiOutlineBriefcase,
  HiOutlineEllipsisHorizontal,
} from 'react-icons/hi2'

export function StudentLayout() {
  const { user, currentClassroom } = useAuthStore()
  const { isEnabled } = useModuleStore()
  const { data: account } = useMyAccount()
  const currency = currentClassroom?.currency_name || '미소'

  const tabs = [
    { to: '/student', icon: HiOutlineHome, label: '홈', show: true, end: true },
    { to: '/student/bankbook', icon: HiOutlineBanknotes, label: '통장', show: true },
    { to: '/student/mart', icon: HiOutlineShoppingBag, label: '마트', show: isEnabled('mart') },
    { to: '/student/jobs', icon: HiOutlineBriefcase, label: '직업', show: isEnabled('job') },
    { to: '/student/more', icon: HiOutlineEllipsisHorizontal, label: '더보기', show: true },
  ].filter((tab) => tab.show)

  return (
    <div className="min-h-screen flex flex-col bg-surface-secondary">
      <header className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 px-4 py-4 sticky top-0 z-40 pwa-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-sm">
              {user?.avatar_preset_id || '😊'}
            </div>
            <div className="text-white">
              <h2 className="text-base font-bold leading-tight">{user?.name}</h2>
              <p className="text-[11px] text-primary-200 leading-none mt-0.5">
                {currentClassroom?.school} {currentClassroom?.grade}학년 {currentClassroom?.class_num}반
              </p>
            </div>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2 text-right">
            <p className="text-[10px] text-primary-200 leading-none">내 잔액</p>
            <p className="text-lg font-extrabold text-white leading-tight mt-0.5">
              {(account?.balance ?? 0).toLocaleString()}
              <span className="text-xs font-medium text-primary-200 ml-0.5">{currency}</span>
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 px-4 py-5 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border/50 z-40 pwa-bottom-nav">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2.5 px-1 min-w-[56px] flex-1 transition-all active:scale-95 ${
                  isActive ? 'text-primary-600' : 'text-text-tertiary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <tab.icon className="w-6 h-6" />
                    {isActive && (
                      <motion.div
                        layoutId="tab-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                      />
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-primary-600' : ''}`}>
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
