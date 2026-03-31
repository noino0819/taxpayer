import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiCheck, HiXMark } from 'react-icons/hi2'

interface PasswordStrengthProps {
  password: string
  confirmPassword?: string
  showConfirmMatch?: boolean
}

interface Criterion {
  label: string
  met: boolean
}

const STRENGTH_CONFIG = [
  { label: '매우 약함', color: 'bg-danger-500', textColor: 'text-danger-500' },
  { label: '약함', color: 'bg-orange-500', textColor: 'text-orange-500' },
  { label: '보통', color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  { label: '강함', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  { label: '매우 강함', color: 'bg-primary-500', textColor: 'text-primary-500' },
] as const

function evaluatePassword(password: string) {
  const criteria: Criterion[] = [
    { label: '6자 이상', met: password.length >= 6 },
    { label: '영문 포함', met: /[a-zA-Z]/.test(password) },
    { label: '숫자 포함', met: /\d/.test(password) },
    { label: '특수문자 포함', met: /[^a-zA-Z0-9]/.test(password) },
    { label: '8자 이상', met: password.length >= 8 },
  ]

  const score = criteria.filter((c) => c.met).length

  return { criteria, score }
}

export function PasswordStrength({ password, confirmPassword, showConfirmMatch }: PasswordStrengthProps) {
  const { criteria, score } = useMemo(() => evaluatePassword(password), [password])
  const config = STRENGTH_CONFIG[Math.max(0, score - 1)] ?? STRENGTH_CONFIG[0]
  const strengthPercent = (score / criteria.length) * 100

  if (!password) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2.5 -mt-1"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary">비밀번호 강도</span>
          <span className={`text-xs font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${config.color}`}
            initial={{ width: 0 }}
            animate={{ width: `${strengthPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {criteria.map((c) => (
          <span
            key={c.label}
            className={`inline-flex items-center gap-0.5 text-xs transition-colors duration-200 ${
              c.met ? 'text-emerald-600' : 'text-text-tertiary'
            }`}
          >
            {c.met ? (
              <HiCheck className="w-3 h-3 shrink-0" />
            ) : (
              <HiXMark className="w-3 h-3 shrink-0 opacity-40" />
            )}
            {c.label}
          </span>
        ))}
      </div>

      <AnimatePresence>
        {showConfirmMatch && confirmPassword !== undefined && confirmPassword.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`flex items-center gap-1 text-xs ${
              password === confirmPassword ? 'text-emerald-600' : 'text-danger-500'
            }`}
          >
            {password === confirmPassword ? (
              <>
                <HiCheck className="w-3.5 h-3.5" />
                비밀번호가 일치합니다
              </>
            ) : (
              <>
                <HiXMark className="w-3.5 h-3.5" />
                비밀번호가 일치하지 않습니다
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
