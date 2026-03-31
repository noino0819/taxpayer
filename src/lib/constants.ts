export const DEFAULT_CURRENCY_NAME = '미소'
export const DEFAULT_CURRENCY_UNIT = '미소'
export const DEFAULT_CURRENCY_RATIO = 10000
export const DEFAULT_INITIAL_BALANCE = 50
export const DEFAULT_CREDIT_SCORE = 800
export const DEFAULT_CREDIT_GRADE = 2 as const

export const CREDIT_GRADES = [
  { grade: 1, label: '최우수', min: 900, max: 1000, color: '#FFD700' },
  { grade: 2, label: '우수', min: 800, max: 899, color: '#3B82F6' },
  { grade: 3, label: '보통', min: 700, max: 799, color: '#22C55E' },
  { grade: 4, label: '주의', min: 600, max: 699, color: '#F59E0B' },
  { grade: 5, label: '위험', min: 0, max: 599, color: '#EF4444' },
] as const

export const MODULE_LABELS: Record<string, { name: string; description: string; defaultEnabled: boolean }> = {
  job: { name: '직업 시스템', description: '학급 직업 관리 및 월급 지급', defaultEnabled: false },
  mart: { name: '마트(상점)', description: '마트 운영 및 상품 구매', defaultEnabled: false },
  real_estate: { name: '부동산(자리)', description: '좌석 매매 및 임대', defaultEnabled: false },
  investment: { name: '투자(주식)', description: '모의 주식 투자 활동', defaultEnabled: false },
  insurance: { name: '보험', description: '보험 가입 및 청구', defaultEnabled: false },
  bank: { name: '은행(저축/대출)', description: '저축 상품 및 대출', defaultEnabled: false },
  credit: { name: '신용 등급', description: '신용 점수 및 등급 관리', defaultEnabled: false },
  tax: { name: '세금 시스템', description: '소득세, 임대료, 전기요금 등', defaultEnabled: true },
  fine: { name: '벌금 시스템', description: '규칙 위반 시 벌금 부과', defaultEnabled: true },
  notification: { name: '알림 시스템', description: '학급 내 각종 알림 발송', defaultEnabled: true },
  achievement: { name: '성취 배지', description: '경제 활동 성취 배지', defaultEnabled: false },
  quiz: { name: '경제 퀴즈', description: '주간 경제 용어 퀴즈', defaultEnabled: false },
}

export const DEFAULT_JOBS = [
  { name: '은행원', description: '월급 지급 처리, 저축 상품 관리, 이자 계산 및 지급', maxCount: 3, salary: 30 },
  { name: '통계청 직원', description: '과제/숙제 등 제출물 기록 관리', maxCount: 2, salary: 25 },
  { name: '국세청 직원', description: '세금 수입/지출 기록, 소득세/임대료/벌금 등 관리', maxCount: 2, salary: 25 },
  { name: '신용평가위원', description: '통계청 자료 기반 신용 포인트 관리', maxCount: 2, salary: 25 },
  { name: '증권사 직원', description: '주식 그래프 관리, 투자 상품 운영', maxCount: 2, salary: 25 },
  { name: '경찰', description: '규칙 위반 신고 접수, 벌금 납부 확인', maxCount: 3, salary: 20 },
  { name: '교실 청소부', description: '교실 청소 담당, 청소 상태 점검 및 보고', maxCount: 4, salary: 15 },
  { name: '인테리어 디자이너', description: '교실 환경 꾸미기, 게시판 관리', maxCount: 2, salary: 15 },
  { name: '기자', description: '학급 신문 작성, 학급 소식 전달', maxCount: 2, salary: 15 },
  { name: '공인중개사', description: '부동산(자리) 거래 중개, 임대료 관리 보조', maxCount: 2, salary: 15 },
  { name: '보드게임 관리인', description: '학급 보드게임 대여 및 관리', maxCount: 2, salary: 10 },
]

export const AVATAR_PRESETS: { category: string; emojis: string[] }[] = [
  { category: 'animal', emojis: ['🐶', '🐱', '🐰', '🐻', '🐼', '🦊', '🐯', '🦁', '🐸', '🐵', '🐨', '🐷'] },
  { category: 'character', emojis: ['😊', '😎', '🤓', '🥳', '😇', '🤗', '🧑‍🎓', '👦', '👧', '🧒', '👶', '🦸'] },
  { category: 'job', emojis: ['👨‍🏫', '👩‍🔬', '👨‍🍳', '👩‍🚀', '👨‍🎨', '👩‍⚕️', '👨‍🚒', '👩‍✈️', '👨‍💻', '👩‍🌾', '🧑‍🔧', '🧑‍🏭'] },
  { category: 'color', emojis: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '💜', '💙', '💚'] },
]
