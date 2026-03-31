interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'accent' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
}

const variantClasses = {
  primary: 'bg-primary-100 text-primary-700 ring-1 ring-primary-200/60',
  accent: 'bg-accent-100 text-accent-700 ring-1 ring-accent-200/60',
  warning: 'bg-warning-100 text-warning-500 ring-1 ring-warning-200/60',
  danger: 'bg-danger-100 text-danger-600 ring-1 ring-danger-200/60',
  neutral: 'bg-surface-tertiary text-text-secondary ring-1 ring-border/40',
}

const sizeClasses = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3.5 py-1 text-sm',
}

export function Badge({ children, variant = 'primary', size = 'sm' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  )
}
