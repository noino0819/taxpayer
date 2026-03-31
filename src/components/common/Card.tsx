import { motion } from 'framer-motion'

interface CardProps {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const paddingClasses = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

export function Card({ hover = false, padding = 'md', children, className = '', onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.08)' } : undefined}
      className={`bg-surface rounded-2xl border border-border shadow-sm ${paddingClasses[padding]} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
