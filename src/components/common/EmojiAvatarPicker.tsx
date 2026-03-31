import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EMOJI_CATEGORIES } from '@/lib/emoji-avatars'

interface EmojiAvatarPickerProps {
  value: string
  onChange: (emoji: string) => void
  size?: 'sm' | 'md'
}

export function EmojiAvatarPicker({ value, onChange, size = 'md' }: EmojiAvatarPickerProps) {
  const [activeCategory, setActiveCategory] = useState(EMOJI_CATEGORIES[0].id)
  const tabsRef = useRef<HTMLDivElement>(null)

  const category = EMOJI_CATEGORIES.find((c) => c.id === activeCategory) ?? EMOJI_CATEGORIES[0]

  const gridCols = size === 'sm' ? 'grid-cols-7' : 'grid-cols-8'
  const emojiSize = size === 'sm' ? 'text-xl p-1' : 'text-2xl p-1.5'
  const maxH = size === 'sm' ? 'max-h-48' : 'max-h-56'

  useEffect(() => {
    if (!tabsRef.current) return
    const activeEl = tabsRef.current.querySelector('[data-active="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeCategory])

  return (
    <div className="space-y-2">
      <div
        ref={tabsRef}
        className="flex gap-1 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
      >
        {EMOJI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            data-active={cat.id === activeCategory}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              cat.id === activeCategory
                ? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
                : 'bg-surface-tertiary text-text-secondary hover:bg-border-light'
            }`}
          >
            <span className="text-base">{cat.icon}</span>
            <span className="whitespace-nowrap">{cat.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={`${maxH} overflow-y-auto no-scrollbar rounded-xl bg-surface-tertiary/50 p-3 border border-border/30`}
        >
          <div className={`grid ${gridCols} gap-0.5 place-items-center`}>
            {category.emojis.map((emoji, idx) => (
              <button
                key={`${emoji}-${idx}`}
                type="button"
                onClick={() => onChange(emoji)}
                className={`${emojiSize} rounded-xl transition-all leading-none flex items-center justify-center aspect-square ${
                  value === emoji
                    ? 'bg-primary-100 ring-2 ring-primary-500 scale-110'
                    : 'hover:bg-surface-tertiary active:scale-95'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
