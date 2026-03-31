import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { useNavigate } from 'react-router-dom'
import {
  HiOutlineBuildingOffice2,
  HiOutlineChartBarSquare,
  HiOutlineShieldCheck,
  HiOutlineBuildingLibrary,
  HiOutlineTrophy,
  HiOutlineAcademicCap,
  HiOutlineCog6Tooth,
  HiOutlineInformationCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineStar,
} from 'react-icons/hi2'

export function MorePage() {
  const { user } = useAuthStore()
  const { isEnabled } = useModuleStore()
  const navigate = useNavigate()

  const menuItems = [
    { icon: HiOutlineBuildingOffice2, label: '부동산 (자리)', to: '/student/real-estate', show: isEnabled('real_estate'), color: 'text-emerald-500' },
    { icon: HiOutlineChartBarSquare, label: '투자 (주식)', to: '/student/investment', show: isEnabled('investment'), color: 'text-purple-500' },
    { icon: HiOutlineShieldCheck, label: '보험', to: '/student/insurance', show: isEnabled('insurance'), color: 'text-cyan-500' },
    { icon: HiOutlineBuildingLibrary, label: '은행', to: '/student/bank', show: isEnabled('bank'), color: 'text-amber-500' },
    { icon: HiOutlineTrophy, label: '성취 배지', to: '/student/achievements', show: isEnabled('achievement'), color: 'text-yellow-500' },
    { icon: HiOutlineAcademicCap, label: '경제 퀴즈', to: '/student/quiz', show: isEnabled('quiz'), color: 'text-blue-500' },
    { icon: HiOutlineStar, label: '신용 등급', to: '/student/credit', show: isEnabled('credit'), color: 'text-orange-500' },
    { icon: HiOutlineClipboardDocumentList, label: '학급 게시판', to: '/student/board', show: true, color: 'text-slate-500' },
  ].filter((item) => item.show)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">더보기</h2>

      <Card>
        <div className="flex items-center gap-4">
          <span className="text-4xl">{user?.avatar_preset_id || '😊'}</span>
          <div>
            <h3 className="font-bold text-lg">{user?.name}</h3>
            <p className="text-sm text-text-tertiary">학생</p>
          </div>
        </div>
      </Card>

      {menuItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-secondary mb-3">경제 활동</h3>
          <Card padding="sm">
            {menuItems.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => navigate(item.to)}
                className={`flex items-center gap-3 w-full p-3 text-left hover:bg-surface-tertiary rounded-xl transition-colors ${
                  idx < menuItems.length - 1 ? 'border-b border-border-light' : ''
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </Card>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-text-secondary mb-3">설정</h3>
        <Card padding="sm">
          <button className="flex items-center gap-3 w-full p-3 text-left hover:bg-surface-tertiary rounded-xl transition-colors border-b border-border-light">
            <HiOutlineCog6Tooth className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium">프로필 설정</span>
          </button>
          <button className="flex items-center gap-3 w-full p-3 text-left hover:bg-surface-tertiary rounded-xl transition-colors">
            <HiOutlineInformationCircle className="w-5 h-5 text-text-secondary" />
            <span className="text-sm font-medium">앱 정보</span>
          </button>
        </Card>
      </div>
    </motion.div>
  )
}
