import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthStore } from '@/stores/authStore'
import { useChangeStudentPassword } from '@/hooks/useQueries'
import toast from 'react-hot-toast'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const changePassword = useChangeStudentPassword()

  const isForced = user?.must_change_password === true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 4) {
      toast.error('새 비밀번호는 4자리 이상이어야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.')
      return
    }

    if (currentPassword === newPassword) {
      toast.error('현재 비밀번호와 다른 비밀번호를 입력해주세요.')
      return
    }

    try {
      await changePassword.mutateAsync({
        userId: user!.id,
        currentPassword,
        newPassword,
      })
      setUser({ ...user!, password: newPassword, must_change_password: false })
      toast.success('비밀번호가 변경되었습니다!')
      navigate('/student')
    } catch (err) {
      const message = err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.'
      toast.error(message)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-accent-50 p-4 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-5xl mb-2"
          >
            🔑
          </motion.div>
          <h1 className="text-2xl font-bold">비밀번호 변경</h1>
          <p className="text-text-secondary text-sm mt-1">
            {isForced
              ? '임시 비밀번호를 변경해주세요'
              : '새로운 비밀번호를 설정하세요'}
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={isForced ? '임시 비밀번호' : '현재 비밀번호'}
              type="password"
              placeholder={isForced ? '선생님이 알려준 비밀번호' : '현재 비밀번호를 입력하세요'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="새 비밀번호"
              type="password"
              placeholder="4자리 이상 (영문, 숫자, 특수문자 가능)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="새 비밀번호 확인"
              type="password"
              placeholder="새 비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" size="lg" isLoading={changePassword.isPending}>
              비밀번호 변경
            </Button>
            {!isForced && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full text-sm text-text-tertiary hover:text-text-secondary transition-colors"
              >
                돌아가기
              </button>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  )
}
