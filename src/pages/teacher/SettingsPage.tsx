import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Tooltip } from '@/components/common/Tooltip'
import { Modal } from '@/components/common/Modal'
import { PrivacyConsentModal } from '@/components/common/PrivacyConsentModal'
import { useAuthStore } from '@/stores/authStore'
import { useModuleStore } from '@/stores/moduleStore'
import { useModuleConfigs, useToggleModule, useUpdateClassroom } from '@/hooks/useQueries'
import { updateModuleSettings } from '@/lib/api/modules'
import { deleteTeacherAccount } from '@/lib/api/auth'
import { getCurrentPolicies, getPolicyVersionHistory, createPolicyVersion } from '@/lib/api/policies'
import { MODULE_LABELS } from '@/lib/constants'
import type { ModuleName, PolicyDocument, PolicyType } from '@/types/database'
import { HiOutlineInformationCircle } from 'react-icons/hi2'
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
  const navigate = useNavigate()
  const { user, currentClassroom, setCurrentClassroom, logout } = useAuthStore()
  const { modules, setModule, syncFromConfigs } = useModuleStore()
  const [currencyName, setCurrencyName] = useState(currentClassroom?.currency_name || '미소')
  const [initialBalance, setInitialBalance] = useState(String(currentClassroom?.initial_balance || 50))
  const [showQR, setShowQR] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
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
        <h1 className="text-2xl font-extrabold">학급 설정</h1>
        <p className="text-text-secondary text-sm mt-1">학급 화폐 및 모듈 설정</p>
      </div>

      <Card>
        <h3 className="font-bold mb-4">기본 설정</h3>
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
        <div className="mt-4 bg-gradient-to-br from-primary-50 to-surface rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">학급 초대 코드</p>
              {!showQR && (
                <p className="text-2xl font-extrabold text-primary-600 tracking-[0.2em] mt-1">
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
        <h3 className="font-bold mb-4">모듈 ON/OFF</h3>
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
                className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-surface-tertiary transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold">{config.name}</h4>
                    {config.defaultEnabled && <Badge variant="neutral">기본 ON</Badge>}
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">{config.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(key)}
                  className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                    modules[key] ? 'bg-gradient-to-r from-accent-500 to-accent-400 shadow-[0_2px_6px_rgba(59,130,246,0.3)]' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
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
        <h3 className="font-bold mb-4">운영 모드</h3>
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
              className={`p-5 rounded-2xl border-2 text-left transition-all ${
                currentClassroom?.economy_mode === option.mode
                  ? 'border-primary-400 bg-gradient-to-br from-primary-50 to-surface ring-2 ring-primary-200/50 shadow-[0_2px_8px_rgba(82,179,56,0.08)]'
                  : 'border-border/50 hover:border-primary-200 hover:bg-surface-tertiary'
              }`}
            >
              <span className="text-3xl">{option.emoji}</span>
              <h4 className="font-bold mt-2">{option.label}</h4>
              <p className="text-xs text-text-tertiary mt-1">{option.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <AutoCloseMarketSettings moduleConfigs={moduleConfigs ?? []} classroomId={currentClassroom?.id} />

      <PolicyManagement userId={user?.id} />

      <Card>
        <h3 className="font-bold mb-1 text-danger-600">계정 삭제</h3>
        <p className="text-sm text-text-tertiary mb-4">
          계정을 삭제하면 학급 데이터, 학생 정보 등 모든 데이터가 영구적으로 삭제됩니다.
        </p>
        <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
          회원 탈퇴
        </Button>
      </Card>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="회원 탈퇴">
        <div className="space-y-4">
          <div className="bg-danger-50 rounded-2xl p-4 text-sm text-danger-700 space-y-1">
            <p className="font-bold">정말 탈퇴하시겠습니까?</p>
            <p>탈퇴하면 다음 데이터가 <strong>모두 삭제</strong>되며 <strong>복구할 수 없습니다</strong>.</p>
            <ul className="list-disc pl-5 text-xs space-y-0.5 mt-2">
              <li>학급 데이터 및 설정</li>
              <li>소속 학생 계정 및 모든 경제 활동 기록</li>
              <li>개인정보 동의 기록</li>
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              확인을 위해 <strong className="text-danger-500">"탈퇴합니다"</strong>를 입력해주세요
            </label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="탈퇴합니다"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText('') }}>
              취소
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={deleteConfirmText !== '탈퇴합니다'}
              isLoading={isDeleting}
              onClick={async () => {
                if (!user) return
                setIsDeleting(true)
                try {
                  await deleteTeacherAccount(user.id)
                  logout()
                  toast.success('계정이 삭제되었습니다.')
                  navigate('/login')
                } catch {
                  toast.error('계정 삭제에 실패했습니다.')
                } finally {
                  setIsDeleting(false)
                  setShowDeleteModal(false)
                }
              }}
            >
              탈퇴하기
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

function PolicyManagement({ userId }: { userId?: string }) {
  const [policies, setPolicies] = useState<PolicyDocument[]>([])
  const [history, setHistory] = useState<PolicyDocument[]>([])
  const [selectedType, setSelectedType] = useState<PolicyType | null>(null)
  const [viewPolicy, setViewPolicy] = useState<PolicyDocument | null>(null)
  const [showNewVersion, setShowNewVersion] = useState(false)
  const [newForm, setNewForm] = useState({ type: 'privacy_policy' as PolicyType, version: '', title: '', content: '', summary: '', effectiveDate: '' })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    getCurrentPolicies().then(setPolicies).catch(() => {})
  }, [])

  const loadHistory = async (type: PolicyType) => {
    setSelectedType(type)
    try {
      const data = await getPolicyVersionHistory(type)
      setHistory(data)
    } catch {
      toast.error('버전 히스토리를 불러오는데 실패했습니다.')
    }
  }

  const handleCreateVersion = async () => {
    if (!userId || !newForm.version || !newForm.title || !newForm.content || !newForm.effectiveDate) {
      toast.error('모든 항목을 입력해주세요.')
      return
    }
    setIsCreating(true)
    try {
      await createPolicyVersion(
        newForm.type,
        newForm.version,
        newForm.title,
        newForm.content,
        newForm.summary,
        newForm.effectiveDate,
        userId,
      )
      toast.success('새 약관 버전이 등록되었습니다. 기존 사용자에게 재동의를 요청합니다.')
      setShowNewVersion(false)
      setNewForm({ type: 'privacy_policy', version: '', title: '', content: '', summary: '', effectiveDate: '' })
      getCurrentPolicies().then(setPolicies).catch(() => {})
      if (selectedType) loadHistory(selectedType)
    } catch {
      toast.error('약관 등록에 실패했습니다.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Card>
      <h3 className="font-bold mb-1">약관 관리</h3>
      <p className="text-xs text-text-tertiary mb-4">
        개인정보 처리방침 및 서비스 이용약관을 버전별로 관리합니다. 새 버전을 발행하면 모든 사용자에게 재동의를 요청합니다.
      </p>

      <div className="space-y-3 mb-4">
        {policies.map((policy) => (
          <div key={policy.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold">{policy.title}</h4>
                <Badge variant="primary" size="sm">v{policy.version}</Badge>
                <Badge variant="neutral" size="sm">현행</Badge>
              </div>
              <p className="text-xs text-text-tertiary mt-0.5">시행일: {policy.effective_date}</p>
            </div>
            <div className="flex gap-1.5">
              <Button variant="ghost" size="sm" onClick={() => setViewPolicy(policy)}>
                보기
              </Button>
              <Button variant="secondary" size="sm" onClick={() => loadHistory(policy.type)}>
                히스토리
              </Button>
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="bg-surface-tertiary rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold">
              {selectedType === 'privacy_policy' ? '개인정보 처리방침' : '서비스 이용약관'} 버전 히스토리
            </h4>
            <button onClick={() => setSelectedType(null)} className="text-xs text-text-tertiary hover:text-text-secondary">
              닫기
            </button>
          </div>
          <div className="space-y-2">
            {history.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">v{doc.version}</span>
                  {doc.is_current && <Badge variant="primary" size="sm">현행</Badge>}
                  <span className="text-xs text-text-tertiary">{doc.effective_date}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setViewPolicy(doc)}>
                  보기
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button variant="secondary" size="sm" onClick={() => setShowNewVersion(true)}>
        새 버전 발행
      </Button>

      <Modal isOpen={showNewVersion} onClose={() => setShowNewVersion(false)} title="새 약관 버전 발행" size="lg">
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
            새 버전을 발행하면 기존 사용자가 다음 로그인 시 재동의 화면을 보게 됩니다.
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">유형</label>
              <select
                value={newForm.type}
                onChange={(e) => setNewForm((p) => ({ ...p, type: e.target.value as PolicyType }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="privacy_policy">개인정보 처리방침</option>
                <option value="terms_of_service">서비스 이용약관</option>
              </select>
            </div>
            <Input
              label="버전"
              placeholder="2.0"
              value={newForm.version}
              onChange={(e) => setNewForm((p) => ({ ...p, version: e.target.value }))}
            />
          </div>
          <Input
            label="제목"
            placeholder="개인정보 수집·이용 동의서"
            value={newForm.title}
            onChange={(e) => setNewForm((p) => ({ ...p, title: e.target.value }))}
          />
          <Input
            label="변경 요약"
            placeholder="수집 항목에 'OO'을 추가"
            value={newForm.summary}
            onChange={(e) => setNewForm((p) => ({ ...p, summary: e.target.value }))}
          />
          <Input
            label="시행일"
            type="date"
            value={newForm.effectiveDate}
            onChange={(e) => setNewForm((p) => ({ ...p, effectiveDate: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">약관 내용 (Markdown)</label>
            <textarea
              value={newForm.content}
              onChange={(e) => setNewForm((p) => ({ ...p, content: e.target.value }))}
              rows={10}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-y"
              placeholder="## 1. 개인정보의 수집·이용 목적&#10;&#10;..."
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowNewVersion(false)}>
              취소
            </Button>
            <Button className="flex-1" isLoading={isCreating} onClick={handleCreateVersion}>
              발행하기
            </Button>
          </div>
        </div>
      </Modal>

      <PrivacyConsentModal
        isOpen={viewPolicy !== null}
        onClose={() => setViewPolicy(null)}
        policy={viewPolicy}
      />
    </Card>
  )
}

function AutoCloseMarketSettings({ moduleConfigs, classroomId }: { moduleConfigs: any[]; classroomId?: string }) {
  const investmentConfig = moduleConfigs.find((c: any) => c.module_name === 'investment')
  const settings = (investmentConfig?.settings_json ?? {}) as Record<string, unknown>
  const [enabled, setEnabled] = useState(settings.autoCloseEnabled === true)
  const [hour, setHour] = useState(String(typeof settings.autoCloseHour === 'number' ? settings.autoCloseHour : 16))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setEnabled(settings.autoCloseEnabled === true)
    setHour(String(typeof settings.autoCloseHour === 'number' ? settings.autoCloseHour : 16))
  }, [investmentConfig]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!classroomId) return
    const h = Number(hour)
    if (h < 0 || h > 23) { toast.error('0~23 사이의 시간을 입력해주세요.'); return }
    setSaving(true)
    try {
      await updateModuleSettings(classroomId, 'investment', {
        autoCloseEnabled: enabled,
        autoCloseHour: h,
      })
      toast.success('자동 마감 설정이 저장되었습니다.')
    } catch {
      toast.error('설정 저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <h3 className="font-bold mb-1 inline-flex items-center gap-1.5">
        주식 시장 자동 마감
        <Tooltip content="설정된 시간이 되면 자동으로 하루 마감을 실행합니다. 현재가가 전일 종가로 저장되고 등락률이 리셋됩니다. 교사 페이지가 열려있을 때만 동작합니다.">
          <HiOutlineInformationCircle className="w-4 h-4 text-text-tertiary cursor-help" />
        </Tooltip>
      </h3>
      <p className="text-xs text-text-tertiary mb-4">매일 지정된 시간에 주식 시장을 자동으로 마감합니다.</p>

      <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 mb-4">
        <div>
          <h4 className="text-sm font-bold">자동 마감 활성화</h4>
          <p className="text-xs text-text-tertiary mt-0.5">
            {enabled ? `매일 ${hour}시에 자동 마감됩니다` : '수동으로만 마감합니다'}
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
            enabled ? 'bg-gradient-to-r from-accent-500 to-accent-400 shadow-[0_2px_6px_rgba(59,130,246,0.3)]' : 'bg-border'
          }`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            enabled ? 'left-6' : 'left-1'
          }`} />
        </button>
      </div>

      {enabled && (
        <div className="flex items-end gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-text-secondary mb-1.5">마감 시간 (0~23시)</label>
            <Input
              type="number"
              value={hour}
              onChange={(e) => setHour(e.target.value)}
              placeholder="16"
            />
          </div>
          <div className="pb-0.5">
            <p className="text-sm text-text-tertiary">시 (24시간제)</p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={saving}>
          설정 저장
        </Button>
      </div>
    </Card>
  )
}
