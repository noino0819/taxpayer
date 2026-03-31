import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import {
  HiOutlineBuildingLibrary,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineHomeModern,
  HiOutlineTrophy,
  HiOutlinePuzzlePiece,
  HiOutlineChartBar,
  HiOutlineNewspaper,
  HiOutlineArrowRightOnRectangle,
} from 'react-icons/hi2'

const menuItems = [
  { label: '은행', to: '/student/bank', icon: HiOutlineBuildingLibrary, module: 'bank' as const },
  { label: '투자', to: '/student/investment', icon: HiOutlineChartBarSquare, module: 'investment' as const },
  { label: '보험', to: '/student/insurance', icon: HiOutlineShieldCheck, module: 'insurance' as const },
  { label: '부동산', to: '/student/real-estate', icon: HiOutlineHomeModern, module: 'real_estate' as const },
  { label: '신용 등급', to: '/student/credit', icon: HiOutlineChartBar, module: 'credit' as const },
  { label: '성취 배지', to: '/student/achievements', icon: HiOutlineTrophy, module: 'achievement' as const },
  { label: '경제 퀴즈', to: '/student/quiz', icon: HiOutlinePuzzlePiece, module: 'quiz' as const },
  { label: '학급 게시판', to: '/student/board', icon: HiOutlineNewspaper, module: 'notification' as const },
]

export function MorePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { isEnabled } = useModuleStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">더보기</h2>

      <Card padding="sm">
        <div className="flex items-center gap-3 p-1">
          <span className="text-3xl">{user?.avatar_preset_id ?? '😊'}</span>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-xs text-text-tertiary">학생</p>
          </div>
        </div>
      </Card>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const enabled = isEnabled(item.module)
          if (!enabled) return null
          return (
            <button
              key={item.to}
              onClick={() => navigate(item.to)}
              className="w-full flex items-center gap-3 p-3 bg-surface rounded-xl border border-border hover:bg-surface-tertiary active:bg-border transition-colors text-left"
            >
              <item.icon className="w-5 h-5 text-text-tertiary" />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 p-3 bg-surface rounded-xl border border-danger-200 hover:bg-danger-50 text-danger-500 transition-colors text-left"
      >
        <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
        <span className="font-medium text-sm">로그아웃</span>
      </button>
    </motion.div>
  )
}
