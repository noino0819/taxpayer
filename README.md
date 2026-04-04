# 🏫 세금 내는 아이들

> 초등학교 교실에서 학급 화폐를 활용한 경제 교육을 디지털로 구현한 웹 플랫폼

🔗 **https://taxpayer.vercel.app**

## 주요 기능

### 🔐 인증

- 교사 이메일 회원가입 / 로그인 / 비밀번호 재설정
- 학생 로그인 ID + 비밀번호 가입 (초대코드 기반)
- 교사의 학생 가입 승인/거절 워크플로우
- 이모지 아바타 선택, 이용약관·개인정보 처리방침 동의
- 정책 변경 시 재동의 요청 (ReconsentChecker)

### 👨‍🏫 교사

| 기능 | 설명 |
|------|------|
| **대시보드** | 총 통화량·평균 잔액·양극화 지수, 최근 거래, 직업·벌금 요약, 초대 QR/링크 공유 |
| **학생 관리** | 학생 목록·검색, 개별 입출금, 가입 승인/거절, 비밀번호 초기화 |
| **직업 관리** | 직업 CRUD, 급여 일정·수동 급여 지급, 모듈 설정 연동 |
| **통장 관리** | 학급 통장 일괄 입출금 |
| **세금/벌금** | 학생 신고 벌금 승인/거절 |
| **경제 현황** | 경제·주식 분석, 만족도 설문 관리, 주가 설정 |
| **학급 설정** | 화폐명·초기 잔액, 모듈 ON/OFF 프리셋·토글, 학급 정보 수정, 탈퇴 |

### 🧒 학생

| 기능 | 설명 |
|------|------|
| **홈** | 잔액 확인, 최근 거래, 월별 수입/지출 통계, 내 직업, 퀵 링크 |
| **통장** | 입출금 내역, 거래 필터, 월별 통계 |
| **직업** | 직업 목록 조회 및 지원 |
| **마트** | 상품 목록·카테고리 필터·구매 |
| **은행** | 저축 상품 가입 (단리/복리) |
| **투자** | 모의 주식 매수/매도, 보유 종목·손익, 경제 이벤트·설문 응답 |
| **부동산** | 교실 좌석 그리드, 자리 구매 |
| **보험** | 보험 상품 조회·가입, 내 보험 관리 |
| **신용등급** | 신용 점수/등급 시각화, 등급별 혜택 안내 |
| **성취 배지** | 경제 활동 기반 배지 수집 |
| **경제 퀴즈** | 주간 경제 용어 퀴즈 |
| **게시판** | 공지·신용변동·직업공고·마트소식·경제뉴스 (알림 기반 탭 필터) |
| **더보기** | 모듈별 메뉴, 아바타 변경, 비밀번호 변경, 로그아웃, 계정 삭제 |

### 🛡️ 슈퍼 관리자

- 이용약관·개인정보 처리방침 버전 관리 (`/admin/policies`)

### 📱 PWA

- 홈 화면 추가 (Android/iOS) 설치 안내
- 오프라인 캐시 (Service Worker)
- 통장·마트 바로가기 숏컷

### ⏰ 자동화 (Vercel Cron)

- **급여 자동 지급** — 직업 모듈 학급별 예정 급여일에 자동 실행 (평일 매일)
- **장 마감** — 투자 모듈 설정 시각에 맞춰 종목 가격 갱신 (평일 매일)

## 기술 스택

### 프론트엔드

- **React 19** + **TypeScript**
- **Vite 8** — 빌드 도구
- **Tailwind CSS v4** — 스타일링
- **React Router v7** — 라우팅
- **TanStack Query** — 서버 상태 관리
- **Zustand** — 클라이언트 상태 관리 (인증·모듈 설정)
- **Headless UI** — 접근성 기반 UI 컴포넌트
- **Framer Motion** — 애니메이션
- **Recharts** — 차트/그래프
- **react-hot-toast** — 알림 토스트
- **date-fns** — 날짜 처리
- **qrcode.react** — QR 코드 생성

### 백엔드

- **Supabase** — 인증, PostgreSQL DB, RLS(Row Level Security)
- **Vercel** — 호스팅, 서버리스 함수, Cron Job

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm

### 설치

```bash
npm install
```

### 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local`에 아래 값을 입력하세요:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
CRON_SECRET=your_cron_secret
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
├── api/
│   └── cron/                # Vercel 서버리스 크론 (급여·장마감)
├── public/                  # 정적 파일 (PWA manifest, Service Worker, OG 이미지)
├── supabase/
│   └── migrations/          # DB 마이그레이션 (12개)
└── src/
    ├── components/
    │   ├── common/          # 공통 UI (Button, Card, Input, Modal, Badge, Toggle 등)
    │   └── layout/          # 레이아웃 (Teacher, Student, Admin)
    ├── hooks/               # 커스텀 훅 (React Query, PWA, 자동 급여/장마감)
    ├── lib/
    │   └── api/             # Supabase API 호출 모듈별 분리
    ├── pages/
    │   ├── admin/           # 슈퍼관리자 (약관 관리)
    │   ├── auth/            # 인증 (로그인, 회원가입, 비밀번호)
    │   ├── teacher/         # 교사 (대시보드, 학생, 직업, 통장, 경제, 세금, 설정)
    │   └── student/         # 학생 (홈, 통장, 직업, 마트, 은행, 투자, 부동산, 보험 등)
    ├── stores/              # Zustand (인증, 모듈 설정)
    ├── types/               # TypeScript 타입 정의
    └── App.tsx              # 라우터 및 앱 진입점
```

## 데이터베이스

Supabase PostgreSQL 기반, 마이그레이션 파일은 `supabase/migrations/`에 있습니다.

주요 테이블: `users`, `classrooms`, `memberships`, `accounts`, `transactions`, `jobs`, `job_assignments`, `stocks`, `stock_transactions`, `stores`, `products`, `seats`, `savings_products`, `savings_accounts`, `insurances`, `insurance_contracts`, `fines`, `notifications`, `module_configs`, `economy_snapshots`, `economy_events`, `policy_documents`, `privacy_consents`, `satisfaction_surveys` 등
