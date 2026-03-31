import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-text-secondary">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-xl border border-border
              bg-surface text-text-primary text-base
              placeholder:text-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400
              transition-all duration-200
              disabled:bg-surface-tertiary disabled:opacity-60
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-danger-400 focus:ring-danger-300' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger-500">{error}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
