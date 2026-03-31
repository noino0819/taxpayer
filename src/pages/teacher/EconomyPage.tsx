import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { Tooltip } from '@/components/common/Tooltip'
import { useAuthStore } from '@/stores/authStore'
import {
  useAccountStats,
  useStocks,
  useSetStockPrice,
  useUpdateStockSettings,
  useCloseMarketDay,
  useStudentStockSummaries,
  useStockTradeSummaries,
} from '@/hooks/useQueries'
import {
  HiOutlineInformationCircle,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
} from 'react-icons/hi2'
import toast from 'react-hot-toast'
import type { Stock } from '@/types/database'
import type { StudentStockSummary, StockTradeSummary } from '@/lib/api/investment'

type PageTab = 'overview' | 'analytics'

const IMPACT_PRESETS = [
  { label: '안정형', impact: 0.005, max: 0.08, desc: '대형 우량주처럼 느린 변동', detail: '주당 0.5% 영향, 최대 8% 변동. 삼성전자 같은 대형 우량주처럼 가격이 천천히 움직입니다.' },
  { label: '보통', impact: 0.015, max: 0.15, desc: '일반적인 주식 수준 (기본값)', detail: '주당 1.5% 영향, 최대 15% 변동. 일반적인 주식시장과 비슷한 속도로 변동합니다.' },
  { label: '변동형', impact: 0.03, max: 0.25, desc: '소형주처럼 빠른 변동', detail: '주당 3% 영향, 최대 25% 변동. 코스닥 소형주처럼 적은 거래에도 가격이 크게 움직입니다.' },
  { label: '고위험', impact: 0.05, max: 0.30, desc: '급등·급락 가능 (상한가 30%)', detail: '주당 5% 영향, 최대 30% 변동. 한국 증시 상한가/하한가(±30%)와 동일한 수준의 고위험 종목입니다.' },
]

export function EconomyPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [pageTab, setPageTab] = useState<PageTab>('overview')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">경제 현황</h1>
        <p className="text-text-secondary text-sm mt-1 font-bold">학급 경제 지표 및 투자 현황</p>
      </div>

      <div className="flex gap-2">
        {([
          { key: 'overview' as PageTab, label: '경제 지표 / 주식 관리' },
          { key: 'analytics' as PageTab, label: '투자 현황' },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setPageTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              pageTab === t.key
                ? 'bg-primary-100 text-primary-700 shadow-sm'
                : 'text-text-secondary hover:bg-surface-tertiary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {pageTab === 'overview' && <OverviewTab currency={currency} />}
      {pageTab === 'analytics' && <AnalyticsTab currency={currency} />}
    </motion.div>
  )
}

// ═══════════════════════════════════════════
// 경제 현황 탭 (기존)
// ═══════════════════════════════════════════

function OverviewTab({ currency }: { currency: string }) {
  const { data: stats } = useAccountStats()
  const { data: stocks } = useStocks()
  const setStockPriceMutation = useSetStockPrice()
  const updateSettingsMutation = useUpdateStockSettings()
  const closeMarketMutation = useCloseMarketDay()

  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [newPrice, setNewPrice] = useState('')
  const [impactRate, setImpactRate] = useState('')
  const [maxImpact, setMaxImpact] = useState('')
  const [activeTab, setActiveTab] = useState<'price' | 'settings'>('price')

  useEffect(() => {
    if (editingStock) {
      setNewPrice(String(editingStock.current_price))
      setImpactRate(String((editingStock.price_impact_rate * 100).toFixed(1)))
      setMaxImpact(String((editingStock.max_price_impact * 100).toFixed(0)))
      setActiveTab('price')
    }
  }, [editingStock])

  const avgStockPrice = stocks && stocks.length > 0
    ? Math.round(stocks.reduce((s, st) => s + st.current_price, 0) / stocks.length)
    : 0

  const prevAvg = stocks && stocks.length > 0
    ? Math.round(stocks.reduce((s, st) => s + st.previous_price, 0) / stocks.length)
    : 0
  const kospiChange = avgStockPrice - prevAvg
  const kospiPercent = prevAvg > 0 ? ((kospiChange / prevAvg) * 100).toFixed(1) : '0.0'

  const handleSetPrice = async () => {
    if (!editingStock || !newPrice) return
    const price = Number(newPrice)
    if (price < 1) { toast.error('가격은 1 이상이어야 합니다.'); return }
    try {
      await setStockPriceMutation.mutateAsync({ stockId: editingStock.id, newPrice: price })
      toast.success(`${editingStock.name} 가격을 ${price}${currency}(으)로 변경했습니다.`)
      closeModal()
    } catch { toast.error('가격 변경에 실패했습니다.') }
  }

  const handleSaveSettings = async () => {
    if (!editingStock) return
    const rate = Number(impactRate) / 100
    const max = Number(maxImpact) / 100
    if (rate < 0 || rate > 1 || max < 0 || max > 1) { toast.error('올바른 비율을 입력해주세요.'); return }
    try {
      await updateSettingsMutation.mutateAsync({
        stockId: editingStock.id,
        settings: { price_impact_rate: rate, max_price_impact: max },
      })
      toast.success(`${editingStock.name} 변동 설정이 저장되었습니다.`)
      closeModal()
    } catch { toast.error('설정 저장에 실패했습니다.') }
  }

  const applyPreset = (preset: (typeof IMPACT_PRESETS)[number]) => {
    setImpactRate(String((preset.impact * 100).toFixed(1)))
    setMaxImpact(String((preset.max * 100).toFixed(0)))
  }

  const handleCloseMarket = async () => {
    try {
      await closeMarketMutation.mutateAsync()
      toast.success('하루 마감 완료! 등락률이 초기화되었습니다.')
    } catch { toast.error('마감 처리에 실패했습니다.') }
  }

  const closeModal = () => {
    setEditingStock(null)
    setNewPrice('')
    setImpactRate('')
    setMaxImpact('')
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-text-secondary font-bold inline-flex items-center gap-1">
            평균 잔액
            <Tooltip content="전체 학생 통장 잔액의 평균입니다.">
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
            </Tooltip>
          </p>
          <p className="text-2xl font-bold mt-1">{stats?.avgBalance ?? 0}{currency}</p>
          <Badge variant="primary">{stats?.studentCount ?? 0}명</Badge>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary font-bold inline-flex items-center gap-1">
            총 통화량
            <Tooltip content="학급에 풀린 전체 화폐의 양입니다.">
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
            </Tooltip>
          </p>
          <p className="text-2xl font-bold mt-1">{(stats?.totalBalance ?? 0).toLocaleString()}{currency}</p>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary font-bold inline-flex items-center gap-1">
            학급 코스피
            <Tooltip content="학급 내 모든 주식 종목의 현재가 평균입니다.">
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
            </Tooltip>
          </p>
          <p className="text-2xl font-bold mt-1">{avgStockPrice}{currency}</p>
          <div className="flex items-center gap-2">
            <Badge variant="accent">{stocks?.length ?? 0}종목</Badge>
            {kospiChange !== 0 && (
              <span className={`text-xs font-medium ${kospiChange >= 0 ? 'text-accent-600' : 'text-danger-500'}`}>
                {kospiChange >= 0 ? '▲' : '▼'} {Math.abs(kospiChange)} ({kospiPercent}%)
              </span>
            )}
          </div>
        </Card>
        <Card>
          <p className="text-sm text-text-secondary font-bold inline-flex items-center gap-1">
            양극화 지수
            <Tooltip content="지니계수는 학급 내 자산 불평등 정도를 0~1 사이 숫자로 나타냅니다. 0.3 이하면 양호, 0.4 이상이면 주의가 필요합니다.">
              <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
            </Tooltip>
          </p>
          <p className="text-2xl font-bold mt-1">{stats?.giniIndex ?? 0}</p>
          <Badge variant={(stats?.giniIndex ?? 0) <= 0.3 ? 'accent' : 'warning'}>
            {(stats?.giniIndex ?? 0) <= 0.3 ? '양호' : '주의'}
          </Badge>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold inline-flex items-center gap-1.5">
            주식 종목 관리
            <Tooltip content="종목을 클릭하면 가격을 직접 조정하거나 변동률 설정을 바꿀 수 있습니다.">
              <HiOutlineInformationCircle className="w-4 h-4 text-text-tertiary cursor-help" />
            </Tooltip>
          </h3>
          <div className="flex items-center gap-2">
            <Tooltip content="실제 증시의 '장 마감'과 같습니다. 누르면 현재가가 기준가로 저장되고, 등락률(%)이 0%로 리셋됩니다." position="top">
              <span><HiOutlineInformationCircle className="w-4 h-4 text-text-tertiary cursor-help" /></span>
            </Tooltip>
            <Button
              variant="secondary"
              size="sm"
              icon={<HiOutlineArrowPath className="w-4 h-4" />}
              onClick={handleCloseMarket}
              isLoading={closeMarketMutation.isPending}
            >
              하루 마감
            </Button>
          </div>
        </div>
        <p className="text-xs text-text-tertiary mb-4">
          학생이 매수하면 가격이 오르고, 매도하면 내립니다. 종목을 클릭하면 가격 조정 및 변동률 설정을 할 수 있습니다.
        </p>
        {(!stocks || stocks.length === 0) ? (
          <p className="text-text-tertiary text-sm text-center py-4">주식 종목이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {stocks.map((stock) => {
              const change = stock.current_price - stock.previous_price
              const changePercent = stock.previous_price > 0
                ? ((change / stock.previous_price) * 100).toFixed(1)
                : '0.0'
              const presetMatch = IMPACT_PRESETS.find(
                (p) => Math.abs(p.impact - stock.price_impact_rate) < 0.001,
              )
              const settingsDesc = presetMatch
                ? presetMatch.detail
                : `주당 ${(stock.price_impact_rate * 100).toFixed(1)}% 영향, 최대 ${(stock.max_price_impact * 100).toFixed(0)}% 변동.`
              return (
                <div
                  key={stock.id}
                  onClick={() => setEditingStock(stock)}
                  className="flex items-center justify-between p-3 rounded-xl border border-border-light hover:bg-surface-tertiary cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      change > 0 ? 'bg-accent-100 text-accent-600'
                        : change < 0 ? 'bg-danger-100 text-danger-500'
                          : 'bg-surface-tertiary text-text-tertiary'
                    }`}>
                      {change > 0 ? '▲' : change < 0 ? '▼' : '-'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{stock.name}</p>
                        <Tooltip content={settingsDesc}>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-tertiary text-text-tertiary cursor-help">
                            {presetMatch?.label ?? '사용자 지정'}
                          </span>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-text-tertiary">{stock.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-sm">{stock.current_price}{currency}</p>
                      <p className={`text-xs font-medium ${
                        change > 0 ? 'text-accent-600' : change < 0 ? 'text-danger-500' : 'text-text-tertiary'
                      }`}>
                        {change > 0 ? '+' : ''}{change} ({changePercent}%)
                      </p>
                    </div>
                    <HiOutlineAdjustmentsHorizontal className="w-4 h-4 text-text-tertiary" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal isOpen={!!editingStock} onClose={closeModal} title={editingStock?.name ?? '종목 설정'} size="md">
        {editingStock && (
          <div className="space-y-4">
            <div className="bg-surface-tertiary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{editingStock.current_price}{currency}</p>
              <p className="text-xs text-text-tertiary mt-1">{editingStock.description}</p>
            </div>
            <div className="flex border-b border-border">
              <button onClick={() => setActiveTab('price')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'price' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary hover:text-text-secondary'}`}>
                가격 조정
              </button>
              <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${activeTab === 'settings' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-text-tertiary hover:text-text-secondary'}`}>
                변동률 설정
              </button>
            </div>
            {activeTab === 'price' ? (
              <div className="space-y-4">
                <Input label={`새 가격 (${currency})`} type="number" placeholder="가격을 입력하세요" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
                {newPrice && Number(newPrice) > 0 && Number(newPrice) !== editingStock.current_price && (
                  <p className="text-sm text-text-secondary text-center">
                    {editingStock.current_price} → {newPrice}{currency}{' '}
                    <span className={`font-medium ${Number(newPrice) > editingStock.current_price ? 'text-accent-600' : Number(newPrice) < editingStock.current_price ? 'text-danger-500' : 'text-text-tertiary'}`}>
                      ({Number(newPrice) >= editingStock.current_price ? '+' : ''}{(((Number(newPrice) - editingStock.current_price) / editingStock.current_price) * 100).toFixed(1)}%)
                    </span>
                  </p>
                )}
                <Button className="w-full" onClick={handleSetPrice} isLoading={setStockPriceMutation.isPending}>가격 변경</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-text-secondary mb-2">프리셋 선택</p>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPACT_PRESETS.map((preset) => {
                      const isActive = Math.abs(Number(impactRate) - preset.impact * 100) < 0.1 && Math.abs(Number(maxImpact) - preset.max * 100) < 1
                      return (
                        <button key={preset.label} onClick={() => applyPreset(preset)} className={`p-2.5 rounded-xl border text-left transition-all ${isActive ? 'border-primary-400 bg-primary-50 ring-1 ring-primary-200' : 'border-border hover:border-primary-200'}`}>
                          <p className="text-sm font-semibold">{preset.label}</p>
                          <p className="text-[11px] text-text-tertiary mt-0.5">{preset.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-sm font-semibold text-text-secondary">주당 영향률 (%)</label>
                      <Tooltip content="학생이 1주를 매수/매도할 때 가격이 변하는 비율입니다." position="top">
                        <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
                      </Tooltip>
                    </div>
                    <Input type="number" placeholder="1.5" value={impactRate} onChange={(e) => setImpactRate(e.target.value)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1.5">
                      <label className="text-sm font-semibold text-text-secondary">최대 변동 상한 (%)</label>
                      <Tooltip content="한 번의 거래로 가격이 최대 몇 %까지 변할 수 있는지의 제한입니다." position="top">
                        <HiOutlineInformationCircle className="w-3.5 h-3.5 text-text-tertiary cursor-help" />
                      </Tooltip>
                    </div>
                    <Input type="number" placeholder="15" value={maxImpact} onChange={(e) => setMaxImpact(e.target.value)} />
                  </div>
                </div>
                <div className="bg-surface-tertiary rounded-xl p-3">
                  <p className="text-xs font-medium text-text-secondary mb-1">시뮬레이션</p>
                  <p className="text-xs text-text-tertiary">
                    현재가 {editingStock.current_price}{currency} 기준,
                    1주 매수 시 → <span className="font-medium text-accent-600">{Math.round(editingStock.current_price * (1 + Math.min(Number(impactRate || 0) / 100, Number(maxImpact || 0) / 100)))}{currency}</span>
                    {' · '}
                    5주 매수 시 → <span className="font-medium text-accent-600">{Math.round(editingStock.current_price * (1 + Math.min(5 * Number(impactRate || 0) / 100, Number(maxImpact || 0) / 100)))}{currency}</span>
                  </p>
                </div>
                <Button className="w-full" onClick={handleSaveSettings} isLoading={updateSettingsMutation.isPending}>설정 저장</Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

// ═══════════════════════════════════════════
// 투자 현황 탭 (신규)
// ═══════════════════════════════════════════

function AnalyticsTab({ currency }: { currency: string }) {
  const [view, setView] = useState<'students' | 'stocks'>('students')
  const { data: studentSummaries, isLoading: loadingStudents } = useStudentStockSummaries()
  const { data: stockSummaries, isLoading: loadingStocks } = useStockTradeSummaries()
  const [expandedStock, setExpandedStock] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setView('students')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'students' ? 'bg-primary-50 text-primary-700' : 'text-text-tertiary hover:bg-surface-tertiary'
          }`}
        >
          학생별 현황
        </button>
        <button
          onClick={() => setView('stocks')}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
            view === 'stocks' ? 'bg-primary-50 text-primary-700' : 'text-text-tertiary hover:bg-surface-tertiary'
          }`}
        >
          종목별 현황
        </button>
      </div>

      {view === 'students' && (
        <Card>
          <h3 className="font-bold mb-1">학생별 투자 현황</h3>
          <p className="text-xs text-text-tertiary mb-4">각 학생의 매수/매도 내역과 수익을 한눈에 확인할 수 있습니다.</p>

          {loadingStudents ? (
            <p className="text-center text-text-tertiary text-sm py-6">로딩 중...</p>
          ) : !studentSummaries || studentSummaries.length === 0 ? (
            <p className="text-center text-text-tertiary text-sm py-6">아직 주식 거래를 한 학생이 없습니다.</p>
          ) : (
            <>
              <div className="hidden md:grid grid-cols-7 gap-2 px-3 py-2 text-xs font-semibold text-text-tertiary border-b border-border/50">
                <span className="col-span-2">학생</span>
                <span className="text-right">매수</span>
                <span className="text-right">매도</span>
                <span className="text-right">보유 평가</span>
                <span className="text-right">실현 손익</span>
                <span className="text-right">총 투자액</span>
              </div>
              <div className="space-y-1">
                {studentSummaries.map((s) => (
                  <StudentRow key={s.userId} summary={s} currency={currency} />
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {view === 'stocks' && (
        <Card>
          <h3 className="font-bold mb-1">종목별 거래 현황</h3>
          <p className="text-xs text-text-tertiary mb-4">각 종목의 거래량과 어떤 학생이 투자하고 있는지 확인할 수 있습니다.</p>

          {loadingStocks ? (
            <p className="text-center text-text-tertiary text-sm py-6">로딩 중...</p>
          ) : !stockSummaries || stockSummaries.length === 0 ? (
            <p className="text-center text-text-tertiary text-sm py-6">아직 거래 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {stockSummaries.map((stock) => (
                <StockTradeCard
                  key={stock.stockId}
                  summary={stock}
                  currency={currency}
                  isExpanded={expandedStock === stock.stockId}
                  onToggle={() => setExpandedStock(expandedStock === stock.stockId ? null : stock.stockId)}
                />
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

function StudentRow({ summary: s, currency }: { summary: StudentStockSummary; currency: string }) {
  const totalPnl = s.realizedPnl + (s.holdingsValue - (s.holdingsCount > 0 ? Math.round(s.totalBuyCost * (s.holdingsCount / (s.totalBought || 1))) : 0))
  const hasActivity = s.totalBought > 0 || s.totalSold > 0

  if (!hasActivity) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-2 px-3 py-2.5 rounded-xl hover:bg-surface-tertiary transition-colors items-center">
      <div className="col-span-2 flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
          {s.userName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold">{s.userName}</p>
          <p className="text-xs text-text-tertiary md:hidden">
            보유 {s.holdingsCount}주 · {s.holdingsValue.toLocaleString()}{currency}
          </p>
        </div>
      </div>
      <p className="text-sm text-right font-medium hidden md:block">{s.totalBought}주</p>
      <p className="text-sm text-right font-medium hidden md:block">{s.totalSold}주</p>
      <p className="text-sm text-right font-medium hidden md:block">
        {s.holdingsCount > 0 ? `${s.holdingsValue.toLocaleString()}${currency}` : '-'}
      </p>
      <p className={`text-sm text-right font-bold hidden md:block ${totalPnl > 0 ? 'text-accent-600' : totalPnl < 0 ? 'text-danger-500' : 'text-text-tertiary'}`}>
        {totalPnl > 0 ? '+' : ''}{totalPnl.toLocaleString()}{currency}
      </p>
      <p className="text-sm text-right font-medium hidden md:block text-text-secondary">
        {s.totalBuyCost.toLocaleString()}{currency}
      </p>
      <div className="md:hidden text-right">
        <p className={`text-sm font-bold ${totalPnl > 0 ? 'text-accent-600' : totalPnl < 0 ? 'text-danger-500' : 'text-text-tertiary'}`}>
          {totalPnl > 0 ? '+' : ''}{totalPnl.toLocaleString()}{currency}
        </p>
      </div>
    </div>
  )
}

function StockTradeCard({ summary: stock, currency, isExpanded, onToggle }: {
  summary: StockTradeSummary
  currency: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const netVolume = stock.totalBuyVolume - stock.totalSellVolume
  const activeTraders = stock.traders.filter((t) => t.holdQty > 0)

  return (
    <div className="border border-border/50 rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between hover:bg-surface-tertiary transition-colors text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-600">
            {stock.stockName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-sm">{stock.stockName}</p>
            <p className="text-xs text-text-tertiary">
              현재가 {stock.currentPrice}{currency} · {activeTraders.length}명 보유 중
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-text-tertiary">매수 / 매도</p>
            <p className="text-sm font-bold">
              <span className="text-accent-600">{stock.totalBuyVolume}주</span>
              {' / '}
              <span className="text-danger-500">{stock.totalSellVolume}주</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-tertiary">순매수</p>
            <p className={`text-sm font-bold ${netVolume > 0 ? 'text-accent-600' : netVolume < 0 ? 'text-danger-500' : 'text-text-tertiary'}`}>
              {netVolume > 0 ? '+' : ''}{netVolume}주
            </p>
          </div>
          <svg className={`w-4 h-4 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && stock.traders.length > 0 && (
        <div className="border-t border-border/50 px-4 py-3 bg-surface-tertiary/50">
          <div className="grid grid-cols-6 gap-2 px-2 py-1.5 text-xs font-semibold text-text-tertiary">
            <span className="col-span-2">학생</span>
            <span className="text-right">매수</span>
            <span className="text-right">매도</span>
            <span className="text-right">보유</span>
            <span className="text-right">손익</span>
          </div>
          {stock.traders.map((trader) => (
            <div key={trader.userId} className="grid grid-cols-6 gap-2 px-2 py-2 rounded-lg hover:bg-surface text-sm items-center">
              <span className="col-span-2 font-medium">{trader.userName}</span>
              <span className="text-right text-accent-600">{trader.buyQty}주</span>
              <span className="text-right text-danger-500">{trader.sellQty}주</span>
              <span className="text-right font-medium">{trader.holdQty}주</span>
              <span className={`text-right font-bold ${trader.pnl > 0 ? 'text-accent-600' : trader.pnl < 0 ? 'text-danger-500' : 'text-text-tertiary'}`}>
                {trader.pnl > 0 ? '+' : ''}{trader.pnl.toLocaleString()}{currency}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
