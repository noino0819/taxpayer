import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'

export function PendingApprovalPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-accent-50 p-4 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="text-6xl mb-4 inline-block"
          >
            ⏳
          </motion.div>
          <h2 className="text-xl font-bold mb-2">승인 대기 중</h2>
          <p className="text-text-secondary text-sm mb-6">
            선생님이 가입을 승인하면 로그인할 수 있어요.<br />
            조금만 기다려주세요!
          </p>
          <Button
            onClick={() => navigate('/login?tab=student')}
            className="w-full"
            variant="secondary"
          >
            로그인 페이지로 돌아가기
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
