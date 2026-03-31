import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/stores/authStore'
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useQueries'
import { useAutoPaySalaries } from '@/hooks/useAutoPaySalaries'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
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
import toast from 'react-hot-toast'

const navItems = [
  { to: '/teacher', icon: HiOutlineHome, label: '대시보드', end: true },
  { to: '/teacher/students', icon: HiOutlineUserGroup, label: '학생 관리' },
  { to: '/teacher/jobs', icon: HiOutlineBriefcase, label: '직업 관리' },
  { to: '/teacher/bankbook', icon: HiOutlineBanknotes, label: '통장 관리' },
  { to: '/teacher/tax', icon: HiOutlineReceiptPercent, label: '세금/벌금' },
  { to: '/teacher/economy', icon: HiOutlineChartBar, label: '경제 현황' },
  { to: '/teacher/settings', icon: HiOutlineCog6Tooth, label: '학급 설정' },
]

const typeLabels: Record<string, { label: string; variant: 'danger' | 'primary' | 'accent' | 'warning' }> = {
  fine: { label: '벌금', variant: 'danger' },
  job: { label: '직업', variant: 'primary' },
  system: { label: '시스템', variant: 'accent' },
  salary: { label: '월급', variant: 'warning' },
  credit: { label: '신용', variant: 'primary' },
}

export function TeacherLayout() {
  const { user, currentClassroom, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notiDrawerOpen, setNotiDrawerOpen] = useState(false)
  const { data: notifications } = useNotifications()
  const markAsReadMutation = useMarkAsRead()
  const markAllMutation = useMarkAllAsRead()
  useAutoPaySalaries()
  const unreadCount = (notifications ?? []).filter((n: any) => !n.is_read).length

  const openNotiDrawer = useCallback(() => {
    setNotiDrawerOpen(true)
    window.history.pushState({ notiDrawer: true }, '')
  }, [])

  const closeNotiDrawer = useCallback(() => {
    setNotiDrawerOpen(false)
  }, [])

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (notiDrawerOpen) {
        e.preventDefault()
        closeNotiDrawer()
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [notiDrawerOpen, closeNotiDrawer])

  const handleCloseNotiWithHistory = useCallback(() => {
    if (notiDrawerOpen) {
      window.history.back()
    }
  }, [notiDrawerOpen])

  const handleMarkAll = async () => {
    try {
      await markAllMutation.mutateAsync()
      toast.success('모든 알림을 읽음 처리했습니다.')
    } catch {
      toast.error('처리에 실패했습니다.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const notiItems = notifications ?? []

  return (
    <div className="min-h-screen flex bg-surface-secondary">
      <aside className="hidden lg:flex w-[260px] bg-surface border-r border-border/50 flex-col fixed h-full">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-extrabold shadow-[0_2px_8px_rgba(99,102,241,0.3)]">
              TP
            </div>
            <div>
              <h1 className="text-base font-extrabold text-primary-600">세금 내는 아이들</h1>
              {currentClassroom && (
                <p className="text-[11px] text-text-tertiary leading-none mt-0.5">
                  {currentClassroom.school} {currentClassroom.grade}-{currentClassroom.class_num}
                </p>
              )}
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((navItem) => (
            <NavLink
              key={navItem.to}
              to={navItem.to}
              end={navItem.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 shadow-[0_1px_4px_rgba(99,102,241,0.08)]'
                    : 'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary'
                }`
              }
            >
              <navItem.icon className="w-5 h-5 flex-shrink-0" />
              {navItem.label}
            </NavLink>
          ))}
          <button
            onClick={openNotiDrawer}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-text-secondary hover:bg-surface-tertiary hover:text-text-primary w-full"
          >
            <HiOutlineBellAlert className="w-5 h-5 flex-shrink-0" />
            알림
            {unreadCount > 0 && (
              <span className="ml-auto bg-danger-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-lg">
              👨‍🏫
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-text-tertiary">교사</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-surface-tertiary transition-colors font-medium"
          >
            <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-b border-border/50 z-50 pwa-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl hover:bg-surface-tertiary active:bg-border transition-colors"
            >
              <HiBars3 className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-[10px] font-extrabold">
                TP
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-primary-600">세금 내는 아이들</h1>
                {currentClassroom && (
                  <p className="text-[10px] text-text-tertiary leading-none">
                    {currentClassroom.school} {currentClassroom.grade}-{currentClassroom.class_num}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={openNotiDrawer}
            className="p-2 rounded-xl hover:bg-surface-tertiary relative"
          >
            <HiOutlineBellAlert className="w-5 h-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-500" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-[2px] z-50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-surface z-50 flex flex-col shadow-2xl safe-top"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-xs font-extrabold">
                    TP
                  </div>
                  <h1 className="text-base font-extrabold text-primary-600">세금 내는 아이들</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-surface-tertiary"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {navItems.map((navItem) => (
                  <NavLink
                    key={navItem.to}
                    to={navItem.to}
                    end={navItem.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-primary-50 text-primary-600'
                          : 'text-text-secondary hover:bg-surface-tertiary active:bg-border-light'
                      }`
                    }
                  >
                    <navItem.icon className="w-5 h-5 flex-shrink-0" />
                    {navItem.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => { setMobileMenuOpen(false); openNotiDrawer() }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-text-secondary hover:bg-surface-tertiary active:bg-border-light w-full"
                >
                  <HiOutlineBellAlert className="w-5 h-5 flex-shrink-0" />
                  알림
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-danger-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </nav>

              <div className="p-4 border-t border-border/50 safe-bottom">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-xl">
                    👨‍🏫
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-xs text-text-tertiary">교사</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:bg-surface-tertiary active:bg-border-light transition-colors font-medium"
                >
                  <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Notification Drawer (Right) */}
      <AnimatePresence>
        {notiDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[60]"
              onClick={handleCloseNotiWithHistory}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-surface z-[60] flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50 safe-top">
                <div>
                  <h2 className="text-lg font-extrabold">알림</h2>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}건` : '모든 알림을 확인했습니다'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={handleMarkAll} isLoading={markAllMutation.isPending}>
                      모두 읽음
                    </Button>
                  )}
                  <button
                    onClick={handleCloseNotiWithHistory}
                    className="p-2 rounded-xl hover:bg-surface-tertiary transition-colors"
                  >
                    <HiXMark className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 safe-bottom">
                {notiItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <span className="text-4xl mb-3">🔔</span>
                    <p className="text-sm font-semibold text-text-secondary">알림이 없습니다</p>
                    <p className="text-xs text-text-tertiary mt-1">새로운 알림이 생기면 여기에 표시됩니다.</p>
                  </div>
                ) : (
                  notiItems.map((noti) => {
                    const typeInfo = typeLabels[noti.type]
                    return (
                      <Card
                        key={noti.id}
                        padding="sm"
                        className={`transition-colors ${!noti.is_read ? '!border-primary-200 !bg-primary-50/50' : ''}`}
                        onClick={() => {
                          if (!noti.is_read) markAsReadMutation.mutate(noti.id)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {!noti.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {typeInfo && <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>}
                              <h4 className="text-sm font-bold truncate">{noti.title}</h4>
                            </div>
                            <p className="text-sm text-text-secondary">{noti.message}</p>
                            <p className="text-xs text-text-tertiary mt-1">
                              {new Date(noti.created_at).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
