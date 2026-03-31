import { useState, useRef, useCallback } from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom'
}

export function Tooltip({ children, content, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)

  const show = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    timeout.current = setTimeout(() => setVisible(false), 100)
  }, [])

  const positionClass = position === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2'

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onTouchStart={show}
      onTouchEnd={hide}
    >
      {children}
      {visible && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${positionClass} z-50 w-64 px-3 py-2 rounded-lg bg-text-primary text-surface text-xs leading-relaxed shadow-lg pointer-events-none animate-in fade-in`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
