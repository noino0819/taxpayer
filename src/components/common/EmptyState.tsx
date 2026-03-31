import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-surface-tertiary flex items-center justify-center mb-5">
        <span className="text-4xl">{icon}</span>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-sm text-text-secondary mb-6 max-w-sm leading-relaxed">{description}</p>}
      {action}
    </motion.div>
  )
}
