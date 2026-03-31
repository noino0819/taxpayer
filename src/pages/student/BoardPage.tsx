import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'

type BoardTab = 'notice' | 'credit' | 'job' | 'mart' | 'news'

const tabs: { value: BoardTab; label: string; emoji: string }[] = [
  { value: 'notice', label: '공지', emoji: '📢' },
  { value: 'credit', label: '신용', emoji: '📊' },
  { value: 'job', label: '직업', emoji: '💼' },
  { value: 'mart', label: '마트', emoji: '🛒' },
  { value: 'news', label: '경제뉴스', emoji: '📰' },
]

const boardPosts: Record<BoardTab, { id: string; title: string; content: string; author: string; date: string; badge?: string }[]> = {
  notice: [
    { id: '1', title: '3월 월급일 안내', content: '이번 달 월급일은 3월 28일(금)입니다. 은행원이 처리하오니 잠시 기다려주세요.', author: '김선생 선생님', date: '2026-03-25', badge: '중요' },
    { id: '2', title: '학급 규칙 변경 안내', content: '교실 내 뛰기 벌금이 3미소에서 5미소로 변경됩니다. 4월 1일부터 적용됩니다.', author: '김선생 선생님', date: '2026-03-22' },
    { id: '3', title: '마트 오픈 시간 변경', content: '마트 운영 시간이 점심시간 + 방과 후로 변경됩니다.', author: '김선생 선생님', date: '2026-03-18' },
  ],
  credit: [
    { id: '1', title: '3월 4주차 신용등급 변동', content: '김영희 1등급 유지 / 이철수 2등급 유지 / 정우성 4등급 → 3등급 (축하!) / 강다니엘 3등급 유지', author: '한예슬 (신용평가위원)', date: '2026-03-28' },
    { id: '2', title: '3월 3주차 신용등급 변동', content: '정우성 3등급 → 4등급 (과제 미제출 감점) / 기타 학생 변동 없음', author: '한예슬 (신용평가위원)', date: '2026-03-21' },
  ],
  job: [
    { id: '1', title: '기자 모집 공고', content: '학급 기자 1명을 모집합니다. 글쓰기에 관심 있는 학생 지원 바랍니다. 월급: 15미소', author: '김선생 선생님', date: '2026-03-27', badge: '모집중' },
    { id: '2', title: '보드게임 관리인 추가 모집', content: '보드게임 관리인 1명을 추가 모집합니다. 월급: 10미소', author: '김선생 선생님', date: '2026-03-20', badge: '모집중' },
  ],
  mart: [
    { id: '1', title: '신상품 입고!', content: '색연필 세트(5미소), 스티커 세트(2미소)가 입고되었습니다.', author: '학급 마트', date: '2026-03-29', badge: '신상' },
    { id: '2', title: '일기 면제권 재입고', content: '품절되었던 일기 면제권(3미소)이 5장 재입고되었습니다. 선착순!', author: '학급 마트', date: '2026-03-25' },
  ],
  news: [
    { id: '1', title: '학급 물가 2% 상승', content: '이번 주 한국 소비자물가지수가 상승하여 학급 마트 상품 가격이 2% 인상되었습니다. 실제로 한국의 물가도 올랐기 때문이에요!', author: '경제 시뮬레이션', date: '2026-03-30', badge: '자동' },
    { id: '2', title: '기준금리 동결', content: '한국은행이 기준금리를 3.5%로 동결했습니다. 학급 은행의 예금 이자율은 변동 없습니다.', author: '경제 시뮬레이션', date: '2026-03-25', badge: '자동' },
    { id: '3', title: '주식 시장 전망', content: '이번 주 선생님 몸무게 주식이 상승세를 보이고 있습니다. 학급 성적 종목은 시험 기간 접근으로 변동폭이 커질 수 있습니다.', author: '증권사 직원', date: '2026-03-28' },
  ],
}

export function BoardPage() {
  const [activeTab, setActiveTab] = useState<BoardTab>('notice')
  const posts = boardPosts[activeTab]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <h2 className="text-xl font-bold">📋 학급 게시판</h2>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.value
                ? 'bg-primary-500 text-white'
                : 'bg-surface border border-border text-text-secondary'
            }`}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Card key={post.id} padding="sm">
            <div className="flex items-start gap-2 mb-2">
              {post.badge && (
                <Badge variant={post.badge === '중요' ? 'danger' : post.badge === '모집중' ? 'primary' : 'accent'}>
                  {post.badge}
                </Badge>
              )}
              <h4 className="font-semibold text-sm flex-1">{post.title}</h4>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{post.content}</p>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border-light">
              <span className="text-xs text-text-tertiary">{post.author}</span>
              <span className="text-xs text-text-tertiary">{post.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  )
}
