import { motion, AnimatePresence } from 'framer-motion'
import { HiXMark } from 'react-icons/hi2'

interface PrivacyConsentModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'privacy' | 'terms'
}

export function PrivacyConsentModal({ isOpen, onClose, type }: PrivacyConsentModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/50">
              <h2 className="text-lg font-bold">
                {type === 'privacy' ? '개인정보 수집·이용 동의서' : '서비스 이용약관'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-surface-tertiary transition-colors text-text-secondary"
              >
                <HiXMark className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 text-sm leading-relaxed text-text-secondary space-y-4">
              {type === 'privacy' ? <PrivacyPolicyContent /> : <TermsOfServiceContent />}
            </div>
            <div className="px-6 pb-6 pt-3 border-t border-border/50">
              <button
                onClick={onClose}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function PrivacyPolicyContent() {
  return (
    <>
      <p className="text-xs text-text-tertiary">시행일: 2026년 3월 31일 | 버전 1.0</p>

      <section>
        <h3 className="font-bold text-text-primary mb-1">1. 개인정보의 수집·이용 목적</h3>
        <p>세금 내는 아이들(이하 "서비스")은 학급 화폐 경제 교육 플랫폼 운영을 위해 아래의 목적으로 개인정보를 수집·이용합니다.</p>
        <ul className="list-disc pl-5 mt-1 space-y-0.5">
          <li>회원 가입 및 본인 확인</li>
          <li>학급 경제 교육 서비스 제공</li>
          <li>서비스 이용 기록 관리</li>
          <li>서비스 개선 및 통계 분석</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">2. 수집하는 개인정보 항목</h3>
        <div className="bg-surface-tertiary rounded-xl p-3 space-y-2">
          <div>
            <p className="font-semibold text-text-primary text-xs">교사</p>
            <p className="text-xs">[필수] 이름, 이메일 주소, 비밀번호, 학교명, 학년, 반</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary text-xs">학생</p>
            <p className="text-xs">[필수] 이름, 비밀번호, 초대 코드, 아바타 정보</p>
          </div>
          <div>
            <p className="font-semibold text-text-primary text-xs">자동 수집</p>
            <p className="text-xs">서비스 이용 기록, 접속 일시, 기기 정보</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">3. 개인정보의 보유 및 이용 기간</h3>
        <p>회원 탈퇴 시 또는 개인정보 수집·이용 목적 달성 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관계 법령에 의해 보존할 의무가 있는 경우 해당 기간 동안 보존합니다.</p>
        <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
          <li>전자상거래 등의 소비자보호에 관한 법률: 계약·청약 철회 기록 5년</li>
          <li>통신비밀보호법: 접속 로그 기록 3개월</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">4. 개인정보의 제3자 제공</h3>
        <p>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 법령에 의해 요구되는 경우는 예외로 합니다.</p>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">5. 개인정보의 파기 절차 및 방법</h3>
        <p>목적 달성 후 즉시 파기하며, 전자 파일은 복구 불가능한 방법으로 영구 삭제합니다.</p>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">6. 이용자의 권리</h3>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>개인정보 열람, 정정, 삭제, 처리 정지를 요청할 권리</li>
          <li>언제든지 동의 철회(회원 탈퇴)를 할 권리</li>
          <li>만 14세 미만 아동의 경우 법정대리인의 동의가 필요</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">7. 동의 거부권 및 불이익</h3>
        <p>개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목에 대한 동의를 거부하실 경우 서비스 이용이 제한됩니다.</p>
      </section>
    </>
  )
}

function TermsOfServiceContent() {
  return (
    <>
      <p className="text-xs text-text-tertiary">시행일: 2026년 3월 31일 | 버전 1.0</p>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제1조 (목적)</h3>
        <p>이 약관은 세금 내는 아이들(이하 "서비스")이 제공하는 학급 화폐 경제 교육 플랫폼의 이용과 관련하여 서비스와 이용자 간의 권리·의무 및 책임 사항 등을 규정함을 목적으로 합니다.</p>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제2조 (서비스의 내용)</h3>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>학급 화폐 시스템 운영 (화폐 발행, 통장 관리)</li>
          <li>직업 및 급여 시스템</li>
          <li>경제 교육 시뮬레이션 (투자, 보험, 은행, 부동산 등)</li>
          <li>학급 내 경제 활동 기록 및 관리</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제3조 (이용자의 의무)</h3>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>타인의 정보를 도용하거나 허위 정보를 등록하지 않아야 합니다.</li>
          <li>서비스의 정상적인 운영을 방해하는 행위를 하지 않아야 합니다.</li>
          <li>학급 내 건전한 교육 환경을 유지해야 합니다.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제4조 (서비스 이용의 제한)</h3>
        <p>서비스는 이용자가 본 약관을 위반하거나 서비스의 정상적인 운영을 방해하는 경우 서비스 이용을 제한할 수 있습니다.</p>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제5조 (회원 탈퇴 및 자격 상실)</h3>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>이용자는 언제든지 서비스에 탈퇴를 요청할 수 있습니다.</li>
          <li>탈퇴 시 해당 이용자의 모든 데이터는 즉시 삭제됩니다.</li>
          <li>삭제된 데이터는 복구할 수 없습니다.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제6조 (면책 조항)</h3>
        <p>서비스는 교육 목적으로 제공되며, 서비스 내의 가상 화폐 및 경제 활동은 실제 금전적 가치를 가지지 않습니다.</p>
      </section>

      <section>
        <h3 className="font-bold text-text-primary mb-1">제7조 (분쟁 해결)</h3>
        <p>서비스 이용과 관련하여 분쟁이 발생한 경우, 서비스와 이용자는 원만하게 해결하기 위해 성실히 협의합니다.</p>
      </section>
    </>
  )
}
