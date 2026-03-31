import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { PasswordStrength } from '@/components/common/PasswordStrength'
import { updatePassword } from '@/lib/api/auth'
import { supabase } from '@/lib/supabase'
import { HiOutlineLockClosed, HiOutlineCheckCircle, HiOutlineExclamationTriangle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

type PageState = 'loading' | 'ready' | 'success' | 'error'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready')
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState('ready')
      } else {
        const hash = window.location.hash
        if (!hash.includes('type=recovery')) {
          setPageState('error')
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      toast.error('비밀번호는 6자리 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    try {
      await updatePassword(password)
      setPageState('success')
    } catch (err) {
      const message = err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-accent-50 p-4 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-surface rounded-2xl shadow-lg border border-border p-6">
          {pageState === 'loading' && (
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-text-secondary">링크를 확인하고 있습니다...</p>
            </div>
          )}

          {pageState === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineExclamationTriangle className="w-9 h-9 text-danger-500" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">유효하지 않은 링크</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                이 링크는 만료되었거나 유효하지 않습니다.<br />
                비밀번호 찾기를 다시 시도해 주세요.
              </p>
              <div className="space-y-2">
                <Link to="/forgot-password">
                  <Button className="w-full" size="lg">비밀번호 찾기</Button>
                </Link>
                <Link
                  to="/login"
                  className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            </motion.div>
          )}

          {pageState === 'ready' && (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HiOutlineLockClosed className="w-7 h-7 text-primary-500" />
                </div>
                <h1 className="text-xl font-bold text-text-primary">새 비밀번호 설정</h1>
                <p className="text-sm text-text-secondary mt-1.5">
                  새로운 비밀번호를 입력해 주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="새 비밀번호"
                  type="password"
                  placeholder="6자리 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<HiOutlineLockClosed className="w-5 h-5" />}
                  required
                />
                <PasswordStrength
                  password={password}
                  confirmPassword={passwordConfirm}
                  showConfirmMatch
                />
                <Input
                  label="새 비밀번호 확인"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  icon={<HiOutlineLockClosed className="w-5 h-5" />}
                  required
                />
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  비밀번호 변경
                </Button>
              </form>
            </>
          )}

          {pageState === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">비밀번호가 변경되었습니다!</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                새 비밀번호로 로그인해 주세요.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full" size="lg">
                로그인하러 가기
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
