import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Badge } from '@/components/common/Badge'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'

interface Quiz {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  term: string
}

const weeklyQuizzes: Quiz[] = [
  {
    id: '1',
    question: '월급에서 자동으로 떼이는 세금을 무엇이라고 할까요?',
    options: ['벌금', '원천징수', '이자', '보험료'],
    correctIndex: 1,
    explanation: '원천징수란 월급을 지급하기 전에 세금을 미리 떼고 지급하는 것을 말해요. 우리 학급에서도 월급일에 소득세가 자동으로 빠져나가죠!',
    term: '원천징수',
  },
  {
    id: '2',
    question: '물가가 계속 오르는 현상을 무엇이라고 할까요?',
    options: ['디플레이션', '인플레이션', '슈링크플레이션', '스태그플레이션'],
    correctIndex: 1,
    explanation: '인플레이션은 물가가 전반적으로 오르는 현상이에요. 같은 돈으로 살 수 있는 물건의 양이 줄어드는 거죠.',
    term: '인플레이션',
  },
  {
    id: '3',
    question: '원금뿐 아니라 이자에도 이자가 붙는 방식을 무엇이라고 할까요?',
    options: ['단리', '복리', '고정금리', '변동금리'],
    correctIndex: 1,
    explanation: '복리는 "이자의 이자"가 붙는 방식이에요. 시간이 지날수록 눈덩이처럼 커지는 효과가 있어서, 장기 저축에 유리해요!',
    term: '복리',
  },
  {
    id: '4',
    question: '가격은 그대로인데 양이 줄어드는 현상을 무엇이라고 할까요?',
    options: ['인플레이션', '디플레이션', '슈링크플레이션', '리플레이션'],
    correctIndex: 2,
    explanation: '슈링크플레이션(Shrinkflation)은 "줄어든다(Shrink)"와 "인플레이션"의 합성어예요. 과자 봉지가 예전보다 작아진 것 같은 경험, 해본 적 있죠?',
    term: '슈링크플레이션',
  },
  {
    id: '5',
    question: '돈을 빌릴 때 내야 하는 대가를 무엇이라고 할까요?',
    options: ['세금', '벌금', '이자', '보험료'],
    correctIndex: 2,
    explanation: '이자는 돈을 빌린 대가로 추가로 내야 하는 돈이에요. 반대로 은행에 돈을 맡기면 은행이 우리에게 이자를 주기도 해요!',
    term: '이자',
  },
]

export function QuizPage() {
  const { currentClassroom } = useAuthStore()
  const currency = currentClassroom?.currency_name || '미소'
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)

  const quiz = weeklyQuizzes[currentQuiz]

  const handleAnswer = (idx: number) => {
    if (showResult) return
    setSelectedAnswer(idx)
    setShowResult(true)
    if (idx === quiz.correctIndex) {
      setScore((s) => s + 1)
    }
  }

  const handleNext = () => {
    if (currentQuiz < weeklyQuizzes.length - 1) {
      setCurrentQuiz((q) => q + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizFinished(true)
      if (score + (selectedAnswer === quiz.correctIndex ? 1 : 0) === weeklyQuizzes.length) {
        toast.success(`만점! 보너스 2${currency}가 지급되었습니다!`)
      }
    }
  }

  if (!quizStarted) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <h2 className="text-xl font-bold">📝 경제 퀴즈</h2>
        <Card className="text-center py-8">
          <span className="text-6xl">🧠</span>
          <h3 className="text-xl font-bold mt-4">이번 주 경제 퀴즈</h3>
          <p className="text-text-secondary mt-2">총 {weeklyQuizzes.length}문제</p>
          <p className="text-sm text-accent-600 mt-1">
            만점 달성 시 보너스 2{currency} 지급!
          </p>
          <Button className="mt-6" size="lg" onClick={() => setQuizStarted(true)}>
            퀴즈 시작하기
          </Button>
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">경제 용어 사전</h3>
          <div className="space-y-3">
            {weeklyQuizzes.map((q) => (
              <div key={q.id} className="p-3 rounded-xl bg-surface-tertiary">
                <h4 className="font-semibold text-sm text-primary-600">{q.term}</h4>
                <p className="text-xs text-text-secondary mt-1">{q.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    )
  }

  if (quizFinished) {
    const finalScore = score
    const isPerfect = finalScore === weeklyQuizzes.length
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
        <Card className="text-center py-8">
          <span className="text-6xl">{isPerfect ? '🎉' : '👏'}</span>
          <h3 className="text-2xl font-bold mt-4">
            {isPerfect ? '만점!' : '수고했어요!'}
          </h3>
          <p className="text-3xl font-bold text-primary-600 mt-3">
            {finalScore} / {weeklyQuizzes.length}
          </p>
          {isPerfect && (
            <Badge variant="accent" size="md">보너스 2{currency} 지급!</Badge>
          )}
          <Button
            className="mt-6"
            variant="secondary"
            onClick={() => {
              setQuizStarted(false)
              setQuizFinished(false)
              setCurrentQuiz(0)
              setScore(0)
              setSelectedAnswer(null)
              setShowResult(false)
            }}
          >
            다시 풀기
          </Button>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">📝 경제 퀴즈</h2>
        <Badge variant="primary">
          {currentQuiz + 1} / {weeklyQuizzes.length}
        </Badge>
      </div>

      <div className="h-1.5 bg-surface-tertiary rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuiz + 1) / weeklyQuizzes.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={quiz.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
        >
          <Card>
            <h3 className="text-lg font-bold mb-4">{quiz.question}</h3>
            <div className="space-y-2.5">
              {quiz.options.map((option, idx) => {
                let optionClass = 'border-border hover:bg-surface-tertiary'
                if (showResult) {
                  if (idx === quiz.correctIndex) {
                    optionClass = 'border-accent-400 bg-accent-50'
                  } else if (idx === selectedAnswer) {
                    optionClass = 'border-danger-400 bg-danger-50'
                  }
                } else if (idx === selectedAnswer) {
                  optionClass = 'border-primary-400 bg-primary-50'
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-3 rounded-xl border text-left text-sm font-medium transition-all ${optionClass}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-surface-tertiary flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      {option}
                      {showResult && idx === quiz.correctIndex && <span>✅</span>}
                      {showResult && idx === selectedAnswer && idx !== quiz.correctIndex && <span>❌</span>}
                    </span>
                  </button>
                )
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-3 rounded-xl bg-primary-50 border border-primary-200"
              >
                <p className="text-sm font-semibold text-primary-700 mb-1">
                  💡 {quiz.term}
                </p>
                <p className="text-xs text-primary-600">{quiz.explanation}</p>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {showResult && (
        <Button className="w-full" size="lg" onClick={handleNext}>
          {currentQuiz < weeklyQuizzes.length - 1 ? '다음 문제' : '결과 보기'}
        </Button>
      )}
    </motion.div>
  )
}
