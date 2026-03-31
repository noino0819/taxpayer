import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { EmojiAvatarPicker } from '@/components/common/EmojiAvatarPicker'
import { signUpStudent } from '@/lib/api/auth'
import toast from 'react-hot-toast'

export function StudentRegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [form, setForm] = useState({
    name: '',
    password: '',
    passwordConfirm: '',
    inviteCode: searchParams.get('code')?.toUpperCase() || '',
    avatar: '😊',
  })

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password.length < 4) {
      toast.error('비밀번호는 4자리 이상이어야 합니다.')
      return
    }

    if (form.password !== form.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (form.inviteCode.length !== 6) {
      toast.error('초대 코드는 6자리입니다.')
      return
    }

    setIsLoading(true)
    try {
      await signUpStudent(form.name, form.password, form.inviteCode, form.avatar)
      setDone(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '가입에 실패했습니다.'
      if (message === 'PENDING_APPROVAL') {
        setDone(true)
      } else {
        toast.error(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-accent-50 p-4 safe-top safe-bottom">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-surface rounded-2xl shadow-lg border border-border p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              ⏳
            </motion.div>
            <h2 className="text-xl font-bold mb-2">가입 신청 완료!</h2>
            <p className="text-text-secondary text-sm mb-6">
              선생님이 승인하면 로그인할 수 있어요.<br />
              조금만 기다려주세요!
            </p>
            <Button
              onClick={() => navigate('/login?tab=student')}
              className="w-full"
            >
              로그인 페이지로 돌아가기
            </Button>
          </div>
        </motion.div>
      </div>
    )
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
            🧒
          </motion.div>
          <h1 className="text-2xl font-bold">학급 참여하기</h1>
          <p className="text-text-secondary text-sm mt-1">선생님이 알려준 초대 코드로 가입해요</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="초대 코드"
              placeholder="6자리 코드를 입력하세요"
              value={form.inviteCode}
              onChange={(e) => updateForm('inviteCode', e.target.value.toUpperCase())}
              maxLength={6}
              required
            />
            <Input
              label="이름"
              placeholder="본인 이름을 입력하세요"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="4자리 이상 (영문, 숫자, 특수문자 가능)"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              required
            />
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm}
              onChange={(e) => updateForm('passwordConfirm', e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                아바타 선택
              </label>
              <EmojiAvatarPicker
                value={form.avatar}
                onChange={(emoji) => updateForm('avatar', emoji)}
                size="sm"
              />
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              가입 신청하기
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-4">
          이미 가입했나요?{' '}
          <Link to="/login?tab=student" className="text-primary-500 hover:underline">
            로그인
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
