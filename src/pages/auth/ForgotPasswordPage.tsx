import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { requestPasswordReset } from '@/lib/api/auth'
import { HiOutlineEnvelope, HiOutlineArrowLeft, HiOutlinePaperAirplane, HiOutlineCheckCircle } from 'react-icons/hi2'
import toast from 'react-hot-toast'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await requestPasswordReset(email)
      setIsSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : '요청에 실패했습니다.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await requestPasswordReset(email)
      toast.success('재설정 메일을 다시 보냈습니다.')
    } catch (err) {
      const message = err instanceof Error ? err.message : '요청에 실패했습니다.'
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
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          로그인으로 돌아가기
        </Link>

        <div className="bg-surface rounded-2xl shadow-lg border border-border p-6">
          {!isSent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HiOutlineEnvelope className="w-7 h-7 text-primary-500" />
                </div>
                <h1 className="text-xl font-bold text-text-primary">비밀번호 찾기</h1>
                <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
                  가입하신 이메일 주소를 입력하시면<br />
                  비밀번호 재설정 링크를 보내드립니다.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="이메일"
                  type="email"
                  placeholder="teacher@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<HiOutlineEnvelope className="w-5 h-5" />}
                  required
                />
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  <HiOutlinePaperAirplane className="w-4 h-4 mr-1.5" />
                  재설정 링크 보내기
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineCheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">메일을 보냈습니다!</h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-1">
                <span className="font-medium text-text-primary">{email}</span>
              </p>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                으로 비밀번호 재설정 링크를 보냈습니다.<br />
                메일함을 확인해 주세요.
              </p>

              <div className="space-y-3">
                <div className="bg-surface-tertiary rounded-xl p-3.5">
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    메일이 보이지 않으면 스팸함을 확인해 주세요.<br />
                    링크는 1시간 동안 유효합니다.
                  </p>
                </div>

                <button
                  onClick={handleResend}
                  disabled={isLoading}
                  className="text-sm text-primary-500 hover:text-primary-600 hover:underline transition-colors disabled:opacity-50"
                >
                  메일을 다시 보내기
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
