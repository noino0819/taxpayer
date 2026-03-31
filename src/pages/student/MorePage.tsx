import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { EmojiAvatarPicker } from '@/components/common/EmojiAvatarPicker'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { useMyAccount, useUpdateStudentAvatar } from '@/hooks/useQueries'
import { CREDIT_GRADES } from '@/lib/constants'
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
  HiOutlineKey,
  HiOutlinePencilSquare,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'

const menuItems = [
  { label: '은행', to: '/student/bank', icon: HiOutlineBuildingLibrary, module: 'bank' as const, emoji: '🏦', bg: 'bg-amber-100', color: 'text-amber-600' },
  { label: '투자', to: '/student/investment', icon: HiOutlineChartBarSquare, module: 'investment' as const, emoji: '📈', bg: 'bg-rose-100', color: 'text-rose-600' },
  { label: '보험', to: '/student/insurance', icon: HiOutlineShieldCheck, module: 'insurance' as const, emoji: '🛡️', bg: 'bg-violet-100', color: 'text-violet-600' },
  { label: '부동산', to: '/student/real-estate', icon: HiOutlineHomeModern, module: 'real_estate' as const, emoji: '🏠', bg: 'bg-teal-100', color: 'text-teal-600' },
  { label: '신용 등급', to: '/student/credit', icon: HiOutlineChartBar, module: 'credit' as const, emoji: '📊', bg: 'bg-blue-100', color: 'text-blue-600' },
  { label: '성취 배지', to: '/student/achievements', icon: HiOutlineTrophy, module: 'achievement' as const, emoji: '🏆', bg: 'bg-yellow-100', color: 'text-yellow-600' },
  { label: '경제 퀴즈', to: '/student/quiz', icon: HiOutlinePuzzlePiece, module: 'quiz' as const, emoji: '📝', bg: 'bg-green-100', color: 'text-green-600' },
  { label: '학급 게시판', to: '/student/board', icon: HiOutlineNewspaper, module: 'notification' as const, emoji: '📋', bg: 'bg-indigo-100', color: 'text-indigo-600' },
]

export function MorePage() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuthStore()
  const { isEnabled } = useModuleStore()
  const { data: account } = useMyAccount()
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const updateAvatarMutation = useUpdateStudentAvatar()

  const creditInfo = CREDIT_GRADES.find((g) => g.grade === (account?.credit_grade ?? 3))

  const handleAvatarChange = async (emoji: string) => {
    if (!user) return
    try {
      await updateAvatarMutation.mutateAsync({ userId: user.id, avatarEmoji: emoji })
      setUser({ ...user, avatar_preset_id: emoji })
      toast.success('아바타가 변경되었습니다!')
      setShowAvatarPicker(false)
    } catch {
      toast.error('아바타 변경에 실패했습니다.')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">더보기</h2>

      <Card padding="sm">
        <div className="flex items-center gap-3.5 p-1">
          <button
            type="button"
            onClick={() => setShowAvatarPicker(!showAvatarPicker)}
            className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-3xl shadow-sm group transition-all hover:ring-2 hover:ring-primary-300"
          >
            {user?.avatar_preset_id ?? '😊'}
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <HiOutlinePencilSquare className="w-3 h-3 text-white" />
            </div>
          </button>
          <div className="flex-1">
            <p className="font-bold text-lg">{user?.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="primary" size="sm">{creditInfo?.grade ?? '-'}등급</Badge>
              <span className="text-xs text-text-tertiary">잔액: {(account?.balance ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <AnimatePresence>
          {showAvatarPicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3"
            >
              <EmojiAvatarPicker
                value={user?.avatar_preset_id ?? '😊'}
                onChange={handleAvatarChange}
                size="sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="space-y-2">
        {menuItems.map((item) => {
          const enabled = isEnabled(item.module)
          if (!enabled) return null
          return (
            <motion.button
              key={item.to}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.to)}
              className="w-full flex items-center gap-3.5 p-3.5 bg-surface rounded-2xl border border-border/50 hover:bg-surface-tertiary active:bg-border-light transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-2xl ${item.bg} flex items-center justify-center text-xl`}>
                {item.emoji}
              </div>
              <span className="font-bold text-sm flex-1">{item.label}</span>
              <span className="text-text-tertiary text-sm">›</span>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate('/student/change-password')}
        className="w-full flex items-center gap-3.5 p-3.5 bg-surface rounded-2xl border border-border/50 hover:bg-surface-tertiary transition-all text-left"
      >
        <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center">
          <HiOutlineKey className="w-5 h-5 text-primary-600" />
        </div>
        <span className="font-bold text-sm">비밀번호 변경</span>
        <span className="text-text-tertiary text-sm ml-auto">›</span>
      </motion.button>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="w-full flex items-center gap-3.5 p-3.5 bg-surface rounded-2xl border border-danger-200/60 hover:bg-danger-50 text-danger-500 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-2xl bg-danger-100 flex items-center justify-center">
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm">로그아웃</span>
      </motion.button>
    </motion.div>
  )
}
