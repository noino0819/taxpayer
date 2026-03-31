import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthStore } from '@/stores/authStore'
import { HiOutlineEnvelope, HiOutlineLockClosed } from 'react-icons/hi2'
import toast from 'react-hot-toast'

export function LoginPage() {
  const [loginType, setLoginType] = useState<'teacher' | 'student'>('teacher')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studentName, setStudentName] = useState('')
  const [pin, setPin] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser, setCurrentClassroom } = useAuthStore()

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Demo mode - Supabase 연결 전 데모 데이터 사용
      const demoUser = {
        id: 'teacher-demo-1',
        email,
        name: '김선생',
        role: 'teacher' as const,
        pin: null,
        avatar_preset_id: null,
        created_at: new Date().toISOString(),
      }
      const demoClassroom = {
        id: 'class-demo-1',
        name: '행복반',
        school: '서울초등학교',
        grade: 5,
        class_num: 3,
        semester: 1,
        teacher_id: demoUser.id,
        currency_name: '미소',
        currency_unit: '미소',
        currency_ratio: 10000,
        initial_balance: 50,
        invite_code: 'ABC123',
        economy_mode: 'semi' as const,
        status: 'active' as const,
        semester_start: '2026-03-02',
        semester_end: '2026-07-17',
        created_at: new Date().toISOString(),
      }

      setUser(demoUser)
      setCurrentClassroom(demoClassroom)
      toast.success(`${demoUser.name} 선생님, 환영합니다!`)
      navigate('/teacher')
    } catch {
      toast.error('로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const demoStudent = {
        id: 'student-demo-1',
        email: null,
        name: studentName || '홍길동',
        role: 'student' as const,
        pin,
        avatar_preset_id: '😊',
        created_at: new Date().toISOString(),
      }
      const demoClassroom = {
        id: 'class-demo-1',
        name: '행복반',
        school: '서울초등학교',
        grade: 5,
        class_num: 3,
        semester: 1,
        teacher_id: 'teacher-demo-1',
        currency_name: '미소',
        currency_unit: '미소',
        currency_ratio: 10000,
        initial_balance: 50,
        invite_code: inviteCode || 'ABC123',
        economy_mode: 'semi' as const,
        status: 'active' as const,
        semester_start: '2026-03-02',
        semester_end: '2026-07-17',
        created_at: new Date().toISOString(),
      }

      setUser(demoStudent)
      setCurrentClassroom(demoClassroom)
      toast.success(`${demoStudent.name}님, 환영합니다!`)
      navigate('/student')
    } catch {
      toast.error('로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-accent-50 p-4 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="text-6xl mb-3"
          >
            🏫
          </motion.div>
          <h1 className="text-3xl font-bold text-text-primary">TaxPayer</h1>
          <p className="text-text-secondary mt-1">학급 화폐 경제 교육 플랫폼</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="flex border-b border-border">
            <button
              onClick={() => setLoginType('teacher')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                loginType === 'teacher'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                  : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              👨‍🏫 교사 로그인
            </button>
            <button
              onClick={() => setLoginType('student')}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
                loginType === 'student'
                  ? 'bg-primary-50 text-primary-600 border-b-2 border-primary-500'
                  : 'text-text-secondary hover:bg-surface-tertiary'
              }`}
            >
              🧒 학생 로그인
            </button>
          </div>

          <div className="p-6">
            {loginType === 'teacher' ? (
              <form onSubmit={handleTeacherLogin} className="space-y-4">
                <Input
                  label="이메일"
                  type="email"
                  placeholder="teacher@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<HiOutlineEnvelope className="w-5 h-5" />}
                  required
                />
                <Input
                  label="비밀번호"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<HiOutlineLockClosed className="w-5 h-5" />}
                  required
                />
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  로그인
                </Button>
                <div className="text-center">
                  <Link to="/register/teacher" className="text-sm text-primary-500 hover:underline">
                    교사 회원가입
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <Input
                  label="이름"
                  placeholder="이름을 입력하세요"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                />
                <Input
                  label="학급 초대 코드"
                  placeholder="6자리 코드를 입력하세요"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  required
                />
                <Input
                  label="PIN 번호"
                  type="password"
                  placeholder="4~6자리 숫자"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  maxLength={6}
                  inputMode="numeric"
                  required
                />
                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  로그인
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-text-tertiary mt-6">
          문제가 있나요? 선생님에게 도움을 요청하세요.
        </p>
      </motion.div>
    </div>
  )
}
