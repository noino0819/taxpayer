import { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom'
}

const PADDING = 12

export function Tooltip({ children, content, position = 'bottom' }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timeout = useRef<ReturnType<typeof setTimeout>>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const showHover = useCallback(() => {
    if (timeout.current) clearTimeout(timeout.current)
    setVisible(true)
  }, [])

  const hideHover = useCallback(() => {
    timeout.current = setTimeout(() => setVisible(false), 100)
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setVisible((v) => !v)
  }, [])

  useEffect(() => {
    if (!visible) return
    const onOutside = (e: PointerEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        popupRef.current && !popupRef.current.contains(e.target as Node)
      ) {
        setVisible(false)
      }
    }
    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [visible])

  useLayoutEffect(() => {
    if (!visible || !triggerRef.current || !popupRef.current) return

    const trigger = triggerRef.current.getBoundingClientRect()
    const popup = popupRef.current
    const popupRect = popup.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let top: number
    if (position === 'top') {
      top = trigger.top - popupRect.height - 8
      if (top < PADDING) top = trigger.bottom + 8
    } else {
      top = trigger.bottom + 8
      if (top + popupRect.height > vh - PADDING) top = trigger.top - popupRect.height - 8
    }

    let left = trigger.left + trigger.width / 2 - popupRect.width / 2
    if (left < PADDING) left = PADDING
    if (left + popupRect.width > vw - PADDING) left = vw - PADDING - popupRect.width

    setCoords({ top, left })
  }, [visible, position])

  useEffect(() => {
    if (!visible) return
    const onScroll = () => setVisible(false)
    window.addEventListener('scroll', onScroll, { capture: true })
    return () => window.removeEventListener('scroll', onScroll, { capture: true })
  }, [visible])

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center"
        onMouseEnter={showHover}
        onMouseLeave={hideHover}
        onClick={handleClick}
      >
        {children}
      </span>
      {visible && createPortal(
        <div
          ref={popupRef}
          onMouseEnter={showHover}
          onMouseLeave={hideHover}
          style={{ position: 'fixed', top: coords.top, left: coords.left }}
          className="z-[9999] max-w-[calc(100vw-24px)] w-64 px-3 py-2 rounded-lg bg-text-primary text-surface text-xs leading-relaxed shadow-lg pointer-events-auto whitespace-pre-line"
        >
          {content}
        </div>,
        document.body,
      )}
    </>
  )
}
