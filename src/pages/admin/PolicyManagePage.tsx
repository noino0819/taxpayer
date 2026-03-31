import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Badge } from '@/components/common/Badge'
import { Modal } from '@/components/common/Modal'
import { PrivacyConsentModal } from '@/components/common/PrivacyConsentModal'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentPolicies, getPolicyVersionHistory, createPolicyVersion } from '@/lib/api/policies'
import type { PolicyDocument, PolicyType } from '@/types/database'
import toast from 'react-hot-toast'

export function PolicyManagePage() {
  const { user } = useAuthStore()
  const [policies, setPolicies] = useState<PolicyDocument[]>([])
  const [history, setHistory] = useState<PolicyDocument[]>([])
  const [selectedType, setSelectedType] = useState<PolicyType | null>(null)
  const [viewPolicy, setViewPolicy] = useState<PolicyDocument | null>(null)
  const [showNewVersion, setShowNewVersion] = useState(false)
  const [newForm, setNewForm] = useState({
    type: 'privacy_policy' as PolicyType,
    version: '',
    title: '',
    content: '',
    summary: '',
    effectiveDate: '',
  })
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
    if (!user || !newForm.version || !newForm.title || !newForm.content || !newForm.effectiveDate) {
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
        user.id,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">약관 관리</h1>
        <p className="text-text-secondary text-sm mt-1">
          개인정보 처리방침 및 서비스 이용약관을 버전별로 관리합니다.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">현행 약관</h3>
          <Button size="sm" onClick={() => setShowNewVersion(true)}>
            새 버전 발행
          </Button>
        </div>
        <p className="text-xs text-text-tertiary mb-4">
          새 버전을 발행하면 모든 사용자에게 재동의를 요청합니다.
        </p>

        <div className="space-y-3">
          {policies.map((policy) => (
            <div key={policy.id} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 hover:bg-surface-tertiary transition-colors">
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
          {policies.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-8">등록된 약관이 없습니다.</p>
          )}
        </div>
      </Card>

      {selectedType && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">
              {selectedType === 'privacy_policy' ? '개인정보 처리방침' : '서비스 이용약관'} 버전 히스토리
            </h3>
            <button onClick={() => setSelectedType(null)} className="text-xs text-text-tertiary hover:text-text-secondary">
              닫기
            </button>
          </div>
          <div className="space-y-2">
            {history.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl bg-surface-tertiary border border-border/30"
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
        </Card>
      )}

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
    </div>
  )
}
