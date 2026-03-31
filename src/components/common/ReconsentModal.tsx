import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { PrivacyConsentModal } from '@/components/common/PrivacyConsentModal'
import { recordConsentForPolicy } from '@/lib/api/policies'
import type { PolicyDocument } from '@/types/database'
import toast from 'react-hot-toast'

interface ReconsentModalProps {
  isOpen: boolean
  policies: PolicyDocument[]
  userId: string
  onComplete: () => void
  onRefuse: () => void
}

export function ReconsentModal({ isOpen, policies, userId, onComplete, onRefuse }: ReconsentModalProps) {
  const [consents, setConsents] = useState<Record<string, boolean>>({})
  const [viewPolicy, setViewPolicy] = useState<PolicyDocument | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allAgreed = policies.every((p) => consents[p.id])

  const handleSubmit = async () => {
    if (!allAgreed) return
    setIsSubmitting(true)
    try {
      for (const policy of policies) {
        await recordConsentForPolicy(userId, policy)
      }
      toast.success('약관에 동의하였습니다.')
      onComplete()
    } catch {
      toast.error('동의 처리에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="relative bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-md"
            >
              <div className="px-6 pt-6 pb-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">📋</div>
                  <h2 className="text-xl font-bold">약관이 변경되었습니다</h2>
                  <p className="text-sm text-text-secondary mt-1">
                    서비스를 계속 이용하시려면 변경된 약관에 동의해주세요.
                  </p>
                </div>

                <div className="space-y-3 mb-6">
                  {policies.map((policy) => (
                    <div key={policy.id} className="bg-surface-tertiary rounded-2xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-sm">{policy.title}</p>
                          <p className="text-xs text-text-tertiary mt-0.5">
                            v{policy.version} · 시행일 {policy.effective_date}
                          </p>
                          {policy.summary && (
                            <p className="text-xs text-text-secondary mt-1">{policy.summary}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setViewPolicy(policy)}
                          className="text-xs text-primary-500 hover:underline font-medium shrink-0 mt-0.5"
                        >
                          전문 보기
                        </button>
                      </div>
                      <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={consents[policy.id] ?? false}
                          onChange={(e) => setConsents((prev) => ({ ...prev, [policy.id]: e.target.checked }))}
                          className="w-4.5 h-4.5 rounded border-border text-primary-500 focus:ring-primary-500 accent-primary-500"
                        />
                        <span className="text-sm text-text-secondary">
                          동의합니다 <span className="text-danger-500">(필수)</span>
                        </span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={onRefuse}>
                    거부 (로그아웃)
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!allAgreed}
                    isLoading={isSubmitting}
                    onClick={handleSubmit}
                  >
                    동의하기
                  </Button>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <p className="text-xs text-text-tertiary text-center">
                  동의를 거부하시면 서비스 이용이 제한되며 로그아웃됩니다.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PrivacyConsentModal
        isOpen={viewPolicy !== null}
        onClose={() => setViewPolicy(null)}
        policy={viewPolicy}
      />
    </>
  )
}
