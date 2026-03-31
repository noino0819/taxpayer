import { supabase } from '@/lib/supabase'
import { DEFAULT_JOBS, MODULE_LABELS } from '@/lib/constants'
import type { ModuleName } from '@/types/database'

/**
 * 학급 생성 직후 기본 데이터를 Supabase에 시딩합니다.
 * - 기본 직업
 * - 기본 모듈 설정
 * - 기본 상점(학교 마트)
 * - 기본 저축 상품
 * - 기본 보험 상품
 * - 기본 주식 종목
 * - 기본 자리 배치 (5x6)
 */
export async function seedClassroomData(classroomId: string, _currencyUnit?: string) {
  await Promise.all([
    seedJobs(classroomId),
    seedModules(classroomId),
    seedStore(classroomId),
    seedSavingsProducts(classroomId),
    seedInsuranceProducts(classroomId),
    seedStocks(classroomId),
    seedSeats(classroomId),
  ])
}

async function seedJobs(classroomId: string) {
  const jobs = DEFAULT_JOBS.map((j) => ({
    classroom_id: classroomId,
    name: j.name,
    type: 'custom' as const,
    description: j.description,
    salary: j.salary,
    max_count: j.maxCount,
    is_active: true,
  }))

  await supabase.from('jobs').insert(jobs)
}

async function seedModules(classroomId: string) {
  const configs = Object.entries(MODULE_LABELS).map(([name, cfg]) => ({
    classroom_id: classroomId,
    module_name: name as ModuleName,
    is_enabled: cfg.defaultEnabled,
    settings_json: {},
  }))

  await supabase.from('module_configs').insert(configs)
}

async function seedStore(classroomId: string) {
  const { data: store } = await supabase
    .from('stores')
    .insert({
      classroom_id: classroomId,
      name: '학교 마트',
      type: 'official',
      status: 'open',
    })
    .select()
    .single()

  if (!store) return

  const products = [
    { name: '연필', price: 2, stock: 20, category: '문구류' },
    { name: '지우개', price: 3, stock: 15, category: '문구류' },
    { name: '색연필 세트', price: 15, stock: 5, category: '문구류' },
    { name: '노트', price: 5, stock: 10, category: '문구류' },
    { name: '스티커', price: 3, stock: 30, category: '꾸미기' },
    { name: '책갈피', price: 4, stock: 10, category: '꾸미기' },
    { name: '쉬는시간 +5분 쿠폰', price: 30, stock: 3, category: '쿠폰' },
    { name: '숙제 면제 쿠폰', price: 50, stock: 2, category: '쿠폰' },
    { name: '자리 선택권', price: 40, stock: 3, category: '쿠폰' },
    { name: '간식 교환권', price: 20, stock: 5, category: '쿠폰' },
  ].map((p) => ({
    ...p,
    classroom_id: classroomId,
    store_id: store.id,
    image_url: null,
  }))

  await supabase.from('products').insert(products)
}

async function seedSavingsProducts(classroomId: string) {
  const products = [
    { name: '자유적금', interest_rate: 3.0, type: 'simple' as const, min_term_days: 7, conditions: '누구나 가입 가능' },
    { name: '알짜적금', interest_rate: 5.0, type: 'simple' as const, min_term_days: 14, conditions: '신용 3등급 이상' },
    { name: '미래설계', interest_rate: 7.0, type: 'compound' as const, min_term_days: 30, conditions: '신용 2등급 이상' },
    { name: '꿈나무적금', interest_rate: 10.0, type: 'compound' as const, min_term_days: 60, conditions: '신용 1등급만 가입 가능' },
  ].map((p) => ({
    ...p,
    classroom_id: classroomId,
    is_active: true,
  }))

  await supabase.from('savings_products').insert(products)
}

async function seedInsuranceProducts(classroomId: string) {
  const products = [
    { name: '도난보험', description: '소지품 분실 시 보상', premium: 5, payout: 30, condition: '교실 내 소지품 분실 시', payment_type: 'monthly' as const },
    { name: '건강보험', description: '보건실 방문 시 결석 보장', premium: 3, payout: 20, condition: '보건실 방문 시', payment_type: 'monthly' as const },
    { name: '성적보험', description: '시험 성적 하락 시 보상', premium: 8, payout: 50, condition: '이전 시험 대비 10점 이상 하락 시', payment_type: 'monthly' as const },
    { name: '천재지변보험', description: '갑작스러운 이벤트 보상', premium: 15, payout: 100, condition: '교사가 선언한 천재지변 이벤트 시', payment_type: 'lump' as const },
  ].map((p) => ({
    ...p,
    classroom_id: classroomId,
    is_active: true,
  }))

  await supabase.from('insurances').insert(products)
}

async function seedStocks(classroomId: string) {
  const stocks = [
    { name: '우리반 주식회사', current_price: 100, description: '학급 전체 분위기와 연동', factor_type: 'attendance' },
    { name: '급식 주식회사', current_price: 80, description: '급식 만족도와 연동', factor_type: 'satisfaction' },
    { name: '청소 주식회사', current_price: 60, description: '교실 청소 상태와 연동', factor_type: 'cleanliness' },
    { name: '독서 주식회사', current_price: 50, description: '학급 독서량과 연동', factor_type: 'reading' },
    { name: '체육 주식회사', current_price: 70, description: '체육 활동 성적과 연동', factor_type: 'sports' },
  ].map((s) => ({
    ...s,
    classroom_id: classroomId,
    previous_price: s.current_price,
    is_active: true,
  }))

  await supabase.from('stocks').insert(stocks)
}

async function seedSeats(classroomId: string) {
  const rows = 5
  const cols = 6
  const seats = []
  for (let r = 1; r <= rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const isWindow = c === 1 || c === cols
      const isFront = r === 1
      seats.push({
        classroom_id: classroomId,
        position_row: r,
        position_col: c,
        label: `${r}열 ${c}번`,
        price: isWindow ? 40 : isFront ? 30 : 20,
        rent_price: isWindow ? 8 : isFront ? 6 : 4,
        rent_type: 'wolse' as const,
      })
    }
  }

  await supabase.from('seats').insert(seats)
}
