import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'
import { Button } from './Button'
import { HiOutlineDevicePhoneMobile, HiXMark } from 'react-icons/hi2'

const STORAGE_KEY = 'pwa-prompt-dismissed'
const IOS_STORAGE_KEY = 'ios-install-dismissed'
const AUTO_DISMISS_MS = 8_000

function isDismissedPermanently(key: string) {
  return localStorage.getItem(key) === 'permanent'
}

export function InstallPrompt() {
  const { canInstall, install } = usePWA()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!canInstall || isDismissedPermanently(STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 2_000)
    return () => clearTimeout(timer)
  }, [canInstall])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [visible])

  const handleDismiss = () => setVisible(false)

  const handleNeverShow = () => {
    setVisible(false)
    localStorage.setItem(STORAGE_KEY, 'permanent')
  }

  const handleInstall = async () => {
    const installed = await install()
    if (installed) handleNeverShow()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineDevicePhoneMobile className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">앱으로 설치하기</h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  홈 화면에 추가하면 앱처럼 빠르게 접속할 수 있어요!
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={handleInstall}>
                    설치하기
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleNeverShow}>
                    다시 안보기
                  </Button>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 -mt-1 -mr-1">
                <HiXMark className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function IOSInstallGuide() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true
    if (!isIOS || isStandalone || isDismissedPermanently(IOS_STORAGE_KEY)) return
    const timer = setTimeout(() => setVisible(true), 2_000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => setVisible(false), 12_000)
    return () => clearTimeout(timer)
  }, [visible])

  const handleDismiss = () => setVisible(false)

  const handleNeverShow = () => {
    setVisible(false)
    localStorage.setItem(IOS_STORAGE_KEY, 'permanent')
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-surface rounded-2xl shadow-xl border border-border p-4">
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">📱</div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm">앱처럼 사용하기</h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  Safari 하단의 <span className="inline-block mx-0.5">⬆️</span> 공유 버튼을 누르고<br />
                  <strong>"홈 화면에 추가"</strong>를 선택하세요!
                </p>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={handleDismiss}
                    className="text-xs text-primary-500 font-medium"
                  >
                    알겠어요
                  </button>
                  <button
                    onClick={handleNeverShow}
                    className="text-xs text-text-tertiary font-medium"
                  >
                    다시 안보기
                  </button>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 -mt-1 -mr-1">
                <HiXMark className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
