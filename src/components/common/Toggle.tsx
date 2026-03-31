import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function Toggle({ checked, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
        checked
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-[0_2px_8px_rgba(82,179,56,0.3)]'
          : 'bg-border'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
        style={{ left: checked ? 24 : 4 }}
      />
    </button>
  )
}
