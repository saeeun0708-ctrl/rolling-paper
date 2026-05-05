import { useNavigate } from 'react-router-dom'

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <main className="min-h-dvh bg-white px-5 py-12 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="text-[13px] text-black/40 mb-6 flex items-center gap-1">
        ← 뒤로
      </button>

      <h1 className="text-[1.7rem] font-black text-black mb-2">이용약관</h1>
      <p className="text-[13px] text-black/40 mb-8">최종 수정: 2025년 5월 5일</p>

      <div className="space-y-8 text-[15px] text-black/70 leading-relaxed">
        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">제1조 (목적)</h2>
          <p>이 약관은 롤링페이퍼 서비스(이하 "서비스")의 이용 조건 및 절차, 서비스 이용자와 운영자의 권리·의무·책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">제2조 (서비스 내용)</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>주최자는 롤링페이퍼 방을 생성하고 참여자를 초대할 수 있습니다.</li>
            <li>참여자는 이름과 메시지를 작성하여 받는 분께 마음을 전달할 수 있습니다.</li>
            <li>주최자는 롤링페이퍼를 포장하여 받는 분이 열람할 수 있는 링크를 발급할 수 있습니다.</li>
            <li>받는 분은 열람 링크를 통해 모든 메시지를 확인하고 이미지로 저장할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">제3조 (데이터 자동 삭제)</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>모든 롤링페이퍼 방과 메시지는 <strong>생성일로부터 90일 후 자동으로 삭제</strong>됩니다.</li>
            <li>삭제된 데이터는 <strong>복구할 수 없습니다</strong>. 영구 보관을 원하시면 열람 화면에서 이미지로 저장해주세요.</li>
            <li>만료 7일/14일 전 주최자에게 알림 배너가 표시됩니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">제4조 (익명 작성 및 책임)</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>메시지는 익명으로 작성될 수 있으며, 운영자는 작성자의 신원을 보증하지 않습니다.</li>
            <li>이용자는 타인을 비방하거나 불쾌감을 줄 수 있는 내용을 작성해서는 안 됩니다.</li>
            <li>부적절한 내용으로 인한 분쟁은 작성자 본인에게 책임이 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">제5조 (서비스 변경 및 중단)</h2>
          <p>운영자는 서비스의 내용을 변경하거나 중단할 수 있으며, 중단 시 7일 전 사전 공지합니다. 단, 불가피한 사정이 있는 경우 사전 공지 없이 중단할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">제6조 (문의)</h2>
          <p>서비스 관련 문의는 아래 이메일로 연락해주세요.<br/>
            <a href={`mailto:${CONTACT}`} className="text-[#c25a7e] underline">{CONTACT}</a>
          </p>
        </section>
      </div>
    </main>
  )
}
