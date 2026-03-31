import { motion, AnimatePresence } from 'framer-motion'
import { HiXMark } from 'react-icons/hi2'
import type { PolicyDocument } from '@/types/database'

interface PrivacyConsentModalProps {
  isOpen: boolean
  onClose: () => void
  policy: PolicyDocument | null
}

export function PrivacyConsentModal({ isOpen, onClose, policy }: PrivacyConsentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && policy && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-lg font-bold">{policy.title}</h2>
                <p className="text-xs text-text-tertiary mt-0.5">
                  시행일: {policy.effective_date} | 버전 {policy.version}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-surface-tertiary transition-colors text-text-secondary"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 text-sm leading-relaxed text-text-secondary">
              <MarkdownContent content={policy.content} />
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-border/50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function MarkdownContent({ content }: { content: string }) {
  const sections = content.split(/\n## /).map((s, i) => (i === 0 ? s : `## ${s}`))

  return (
    <div className="space-y-4">
      {sections.map((section, i) => {
        const lines = section.split('\n').filter(Boolean)
        return (
          <section key={i}>
            {lines.map((line, j) => {
              if (line.startsWith('## ')) {
                return (
                  <h3 key={j} className="font-bold text-text-primary mb-1">
                    {line.replace('## ', '')}
                  </h3>
                )
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return (
                  <p key={j} className="font-semibold text-text-primary text-xs mt-2">
                    {line.replace(/\*\*/g, '')}
                  </p>
                )
              }
              if (line.startsWith('- ')) {
                return (
                  <li key={j} className="ml-5 list-disc text-sm">
                    {line.replace('- ', '')}
                  </li>
                )
              }
              if (line.startsWith('[필수]') || line.startsWith('서비스')) {
                return <p key={j} className="text-xs">{line}</p>
              }
              return <p key={j}>{line}</p>
            })}
          </section>
        )
      })}
    </div>
  )
}
