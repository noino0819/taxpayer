import { useState, useRef, useCallback, useEffect } from 'react'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom'
}

export function Tooltip({ children, content, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const showHover = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setVisible(true)
  }, [])

  const hideHover = useCallback(() => {
    timeout.current = setTimeout(() => setVisible(false), 100)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setVisible((v) => !v)
  }, [])

  useEffect(() => {
    if (!visible) return
    const onOutside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false)
      }
    }
    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [visible])

  const positionClass = position === 'top'
    ? 'bottom-full mb-2'
    : 'top-full mt-2'

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center"
      onMouseEnter={showHover}
      onMouseLeave={hideHover}
      onClick={handleClick}
    >
      {children}
      {visible && (
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${positionClass} z-50 w-64 px-3 py-2 rounded-lg bg-text-primary text-surface text-xs leading-relaxed shadow-lg pointer-events-none`}
        >
          {content}
        </span>
      )}
    </span>
  )
}
