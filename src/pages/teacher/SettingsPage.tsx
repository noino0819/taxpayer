import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { useModuleConfigs, useToggleModule, useUpdateClassroom } from '@/hooks/useQueries'
import { MODULE_LABELS } from '@/lib/constants'
import type { ModuleName } from '@/types/database'
import toast from 'react-hot-toast'

const presets = [
  {
    name: '1단계: 기초',
    description: '화폐/통장, 세금, 벌금',
    modules: ['tax', 'fine', 'notification'] as ModuleName[],
  },
  {
    name: '2단계: 근로',
    description: '+ 직업 시스템',
    modules: ['tax', 'fine', 'notification', 'job'] as ModuleName[],
  },
  {
    name: '3단계: 소비',
    description: '+ 마트, 성취 배지',
    modules: ['tax', 'fine', 'notification', 'job', 'mart', 'achievement'] as ModuleName[],
  },
  {
    name: '4단계: 금융',
    description: '+ 은행, 신용등급',
    modules: ['tax', 'fine', 'notification', 'job', 'mart', 'achievement', 'bank', 'credit'] as ModuleName[],
  },
  {
    name: '전체 활성화',
    description: '모든 모듈 ON',
    modules: Object.keys(MODULE_LABELS) as ModuleName[],
  },
]

export function SettingsPage() {
  const { currentClassroom, setCurrentClassroom } = useAuthStore()
  const { modules, setModule, syncFromConfigs } = useModuleStore()
  const [currencyName, setCurrencyName] = useState(currentClassroom?.currency_name || '미소')
  const [initialBalance, setInitialBalance] = useState(String(currentClassroom?.initial_balance || 50))
  const [showQR, setShowQR] = useState(false)
  const inviteUrl = `${window.location.origin}/register/student?code=${currentClassroom?.invite_code || ''}`

  const { data: moduleConfigs } = useModuleConfigs()
  const toggleModuleMutation = useToggleModule()
  const updateClassroomMutation = useUpdateClassroom()

  useEffect(() => {
    if (moduleConfigs) syncFromConfigs(moduleConfigs)
  }, [moduleConfigs, syncFromConfigs])

  const handleToggle = async (key: ModuleName) => {
    const newVal = !modules[key]
    setModule(key, newVal)
    try {
      await toggleModuleMutation.mutateAsync({ moduleName: key, enabled: newVal })
    } catch {
      setModule(key, !newVal)
      toast.error('모듈 변경에 실패했습니다.')
    }
  }

  const applyPreset = async (presetModules: ModuleName[]) => {
    const allKeys = Object.keys(MODULE_LABELS) as ModuleName[]
    for (const key of allKeys) {
      const enabled = presetModules.includes(key)
      if (modules[key] !== enabled) {
        setModule(key, enabled)
        toggleModuleMutation.mutate({ moduleName: key, enabled })
      }
    }
    toast.success('프리셋이 적용되었습니다.')
  }

  const handleSaveBasicSettings = async () => {
    try {
      const updated = await updateClassroomMutation.mutateAsync({
        currency_name: currencyName,
        currency_unit: currencyName,
        initial_balance: Number(initialBalance),
      })
      setCurrentClassroom(updated)
      toast.success('설정이 저장되었습니다.')
    } catch {
      toast.error('설정 저장에 실패했습니다.')
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">학급 설정</h1>
        <p className="text-text-secondary text-sm mt-1">학급 화폐 및 모듈 설정</p>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">기본 설정</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="화폐 이름"
            value={currencyName}
            onChange={(e) => setCurrencyName(e.target.value)}
            placeholder="미소"
          />
          <Input
            label="초기 지급액"
            type="number"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="50"
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={handleSaveBasicSettings} isLoading={updateClassroomMutation.isPending}>
            설정 저장
          </Button>
        </div>
        <div className="mt-4 bg-primary-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">학급 초대 코드</p>
              {!showQR && (
                <p className="text-2xl font-bold text-primary-600 tracking-widest mt-1">
                  {currentClassroom?.invite_code}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowQR(!showQR)}
              >
                {showQR ? '코드 보기' : 'QR 보기'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(currentClassroom?.invite_code || '')
                  toast.success('초대 코드가 복사되었습니다.')
                }}
              >
                복사
              </Button>
            </div>
          </div>
          {showQR && (
            <div className="flex flex-col items-center gap-2 mt-3">
              <QRCodeSVG value={inviteUrl} size={160} level="M" />
              <p className="text-xs text-text-tertiary">학생이 스캔하면 로그인 화면으로 이동합니다</p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">모듈 ON/OFF</h3>
        <p className="text-sm text-text-secondary mb-4">
          학급 분위기와 학생 수준에 맞게 기능을 하나씩 활성화하세요.
          비활성화된 모듈은 학생 화면에서 완전히 숨겨집니다.
        </p>

        <div className="flex gap-2 flex-wrap mb-6">
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="secondary"
              size="sm"
              onClick={() => applyPreset(preset.modules)}
            >
              {preset.name}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {(Object.entries(MODULE_LABELS) as [ModuleName, typeof MODULE_LABELS[string]][]).map(
            ([key, config]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-surface-tertiary transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold">{config.name}</h4>
                    {config.defaultEnabled && <Badge variant="neutral">기본 ON</Badge>}
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">{config.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                    modules[key] ? 'bg-accent-500' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      modules[key] ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ),
          )}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">운영 모드</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { mode: 'auto', label: '완전 자동', desc: '실제 경제 지표에 연동, 교사 부담 최소', emoji: '🤖' },
            { mode: 'semi', label: '반자동 (추천)', desc: '자동 + 교사 미세 조정 가능', emoji: '⚙️' },
            { mode: 'manual', label: '완전 수동', desc: '교사가 모든 매개변수 직접 관리', emoji: '✋' },
          ].map((option) => (
            <button
              key={option.mode}
              onClick={async () => {
                try {
                  const updated = await updateClassroomMutation.mutateAsync({
                    economy_mode: option.mode as any,
                  })
                  setCurrentClassroom(updated)
                  toast.success(`${option.label} 모드로 변경되었습니다.`)
                } catch {
                  toast.error('모드 변경에 실패했습니다.')
                }
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                currentClassroom?.economy_mode === option.mode
                  ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-200'
                  : 'border-border hover:border-primary-200'
              }`}
            >
              <span className="text-2xl">{option.emoji}</span>
              <h4 className="font-semibold mt-2">{option.label}</h4>
              <p className="text-xs text-text-tertiary mt-1">{option.desc}</p>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
