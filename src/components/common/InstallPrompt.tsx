import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePWA } from '@/hooks/usePWA'
import { Button } from './Button'
import { HiOutlineDevicePhoneMobile, HiXMark } from 'react-icons/hi2'

export function InstallPrompt() {
  const { canInstall, install } = usePWA()
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem('pwa-prompt-dismissed') === 'true'
  })

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('pwa-prompt-dismissed', 'true')
  }

  const handleInstall = async () => {
    const installed = await install()
    if (installed) handleDismiss()
  }

  if (!canInstall || dismissed) return null

  return (
    <AnimatePresence>
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
                <Button size="sm" variant="ghost" onClick={handleDismiss}>
                  나중에
                </Button>
              </div>
            </div>
            <button onClick={handleDismiss} className="p-1 -mt-1 -mr-1">
              <HiXMark className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export function IOSInstallGuide() {
  const [show, setShow] = useState(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true
    const wasDismissed = localStorage.getItem('ios-install-dismissed') === 'true'
    return isIOS && !isStandalone && !wasDismissed
  })

  if (!show) return null

  return (
    <AnimatePresence>
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
              <button
                onClick={() => {
                  setShow(false)
                  localStorage.setItem('ios-install-dismissed', 'true')
                }}
                className="text-xs text-primary-500 font-medium mt-2"
              >
                알겠어요
              </button>
            </div>
            <button
              onClick={() => {
                setShow(false)
                localStorage.setItem('ios-install-dismissed', 'true')
              }}
              className="p-1 -mt-1 -mr-1"
            >
              <HiXMark className="w-4 h-4 text-text-tertiary" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
