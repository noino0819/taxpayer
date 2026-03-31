interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
}

const variantClasses = {
  primary: 'bg-primary-100 text-primary-700',
  accent: 'bg-accent-100 text-accent-700',
  warning: 'bg-warning-100 text-warning-500',
  danger: 'bg-danger-100 text-danger-600',
  neutral: 'bg-surface-tertiary text-text-secondary',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export function Badge({ children, variant = 'primary', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  )
}
