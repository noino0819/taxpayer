import { motion } from 'framer-motion'

interface CardProps {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const paddingClasses = {
  sm: 'p-3.5',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ hover = false, padding = 'md', children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -3, boxShadow: '0 12px 36px rgba(82,179,56,0.1)' } : undefined}
      className={`bg-surface rounded-2xl border border-border/60 shadow-[0_2px_16px_rgba(0,0,0,0.04),0_1px_4px_rgba(82,179,56,0.06)] ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
