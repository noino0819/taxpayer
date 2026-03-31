import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuthStore } from '@/stores/authStore'
import { signUpTeacher } from '@/lib/api/auth'
import { createClassroom } from '@/lib/api/classrooms'
import { seedClassroomData } from '@/lib/api/seed'
import toast from 'react-hot-toast'

export function TeacherRegisterPage() {
  const navigate = useNavigate()
  const { setUser, setCurrentClassroom } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    school: '',
    grade: '',
    classNum: '',
  })

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.passwordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (form.password.length < 6) {
      toast.error('비밀번호는 6자리 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    try {
      const user = await signUpTeacher(form.email, form.password, form.name)
      const classroom = await createClassroom(user.id, {
        school: form.school,
        grade: Number(form.grade),
        classNum: Number(form.classNum),
      })

      await seedClassroomData(classroom.id, classroom.currency_unit)

      setUser(user)
      setCurrentClassroom(classroom)
      toast.success('회원가입이 완료되었습니다! 기본 데이터가 세팅되었습니다.')
      navigate('/teacher')
    } catch (err) {
      const message = err instanceof Error ? err.message : '회원가입에 실패했습니다.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-accent-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">👨‍🏫 교사 회원가입</h1>
          <p className="text-text-secondary text-sm mt-1">학급 화폐 경제 교육을 시작하세요</p>
        </div>

        <div className="bg-surface rounded-2xl shadow-lg border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="이름"
              placeholder="선생님 이름"
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              required
            />
            <Input
              label="이메일"
              type="email"
              placeholder="teacher@school.com"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              required
            />
            <Input
              label="비밀번호"
              type="password"
              placeholder="6자리 이상"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              required
            />
            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={form.passwordConfirm}
              onChange={(e) => updateForm('passwordConfirm', e.target.value)}
              required
            />
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-text-secondary mb-3">학급 정보</p>
              <div className="space-y-4">
                <Input
                  label="학교명"
                  placeholder="OO초등학교"
                  value={form.school}
                  onChange={(e) => updateForm('school', e.target.value)}
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="학년"
                    type="number"
                    placeholder="5"
                    min={1}
                    max={6}
                    value={form.grade}
                    onChange={(e) => updateForm('grade', e.target.value)}
                    required
                  />
                  <Input
                    label="반"
                    type="number"
                    placeholder="3"
                    min={1}
                    max={20}
                    value={form.classNum}
                    onChange={(e) => updateForm('classNum', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              회원가입 완료
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-4">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-primary-500 hover:underline">
            로그인
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
