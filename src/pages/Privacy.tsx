import { useNavigate } from 'react-router-dom'

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'

export default function Privacy() {
  const navigate = useNavigate()
  return (
    <main className="min-h-dvh bg-white px-5 py-12 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)}
        className="text-[13px] text-black/40 mb-6 flex items-center gap-1">
        ← 뒤로
      </button>

      <h1 className="text-[1.7rem] font-black text-black mb-2">개인정보처리방침</h1>
      <p className="text-[13px] text-black/40 mb-8">최종 수정: 2025년 5월 5일</p>

      <div className="space-y-8 text-[15px] text-black/70 leading-relaxed">
        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">1. 수집하는 개인정보 항목</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] border-collapse border border-black/10 rounded-xl overflow-hidden">
              <thead className="bg-[#f5f5f5]">
                <tr>
                  <th className="py-2 px-3 text-left font-bold text-black/60 border-b border-black/10">구분</th>
                  <th className="py-2 px-3 text-left font-bold text-black/60 border-b border-black/10">수집 항목</th>
                  <th className="py-2 px-3 text-left font-bold text-black/60 border-b border-black/10">목적</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black/5">
                  <td className="py-2 px-3">주최자</td>
                  <td className="py-2 px-3">주최자 이름, 받는 분 이름, PIN 해시값</td>
                  <td className="py-2 px-3">방 생성 및 인증</td>
                </tr>
                <tr className="border-b border-black/5">
                  <td className="py-2 px-3">참여자</td>
                  <td className="py-2 px-3">작성자 이름, 메시지 내용</td>
                  <td className="py-2 px-3">롤링페이퍼 작성</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">자동 수집</td>
                  <td className="py-2 px-3">IP 주소 (Supabase 로그), 접속 시각</td>
                  <td className="py-2 px-3">보안 및 서비스 운영</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">2. 개인정보 보관 기간</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li>모든 데이터는 <strong>생성일로부터 90일 후 자동 삭제</strong>됩니다.</li>
            <li>PIN 비밀번호는 <strong>bcrypt 해시값으로만 저장</strong>되며, 원문은 저장되지 않습니다.</li>
            <li>삭제 요청 시 즉시 삭제 처리합니다 (아래 문의처 이용).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">3. 개인정보 제3자 제공</h2>
          <p>수집된 개인정보는 서비스 운영 목적 외에 제3자에게 제공하지 않습니다. 단, 법령에 의거한 수사기관 요청 시 예외로 합니다.</p>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">4. 개인정보처리 위탁</h2>
          <ul className="list-disc list-inside space-y-1.5">
            <li><strong>Supabase Inc.</strong> — 데이터베이스 호스팅 (미국)</li>
            <li><strong>Vercel Inc.</strong> — 웹 호스팅 (미국)</li>
          </ul>
          <p className="mt-2 text-[13px] text-black/50">두 서비스 모두 GDPR 및 개인정보보호법을 준수합니다.</p>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">5. 이용자의 권리</h2>
          <p>이용자는 언제든지 아래 이메일로 개인정보 열람·수정·삭제를 요청할 수 있습니다. 요청 후 5영업일 이내 처리합니다.</p>
        </section>

        <section>
          <h2 className="text-[17px] font-bold text-black mb-3">6. 문의</h2>
          <p>개인정보 관련 문의:<br/>
            <a href={`mailto:${CONTACT}`} className="text-[#c25a7e] underline">{CONTACT}</a>
          </p>
        </section>
      </div>
    </main>
  )
}
