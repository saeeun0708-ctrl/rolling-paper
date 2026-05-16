import { useNavigate } from 'react-router-dom'
import { FlowerShape, FLOWER_EMOJIS } from '../utils'
import PinSetupSection from './PinSetupSection'

interface Props {
  name: string
  body: string
  shape: FlowerShape
  messageId: string
  authorToken: string
  onEdit: () => void
  onDelete: () => void
  /** '받는 분 화면으로 보기' 클릭 시 호출 — WriteMessagePage가 미리보기 페이지로 라우팅 */
  onPreview: () => void
}

export default function SuccessView({ name, body, shape, messageId, authorToken, onEdit, onDelete, onPreview }: Props) {
  const navigate = useNavigate()
  return (
    <div className="animate-[fadeIn_0.4s_ease]">
      {/* 성공 헤딩 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{FLOWER_EMOJIS[shape]}</div>
        <h2 className="text-2xl font-black text-black leading-snug">
          내 꽃이 풀숲에<br />피어났어요
        </h2>
        <p className="mt-2 text-[14px] text-black/40">
          롤링페이퍼가 포장되면 받는 분께 전달될 거예요
        </p>
      </div>

      {/* 작성한 메시지 미리보기 + 수정·삭제 */}
      <div className="rounded-2xl bg-[#f5f5f5] px-5 py-4 mb-4">
        <p className="text-[12px] font-mono uppercase tracking-[0.1em] text-black/30 mb-2">
          {name}의 메시지
        </p>
        <p className="text-[15px] text-black leading-relaxed whitespace-pre-wrap line-clamp-4">
          {body}
        </p>
        <div className="flex gap-4 mt-3 pt-3 border-t border-black/5">
          <button
            type="button"
            onClick={onEdit}
            className="text-[12px] text-black/40 hover:text-black transition-colors"
          >
            수정
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-[12px] text-black/40 hover:text-red-500 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 받는 분 화면 미리보기 — 다른 사람들이 작성한 메시지까지 풀숲 뷰로 확인 */}
      <button
        type="button"
        onClick={onPreview}
        className="w-full py-3.5 mt-1
                   bg-white border border-[#d4d4d4]
                   text-black/70 hover:border-black hover:text-black
                   font-semibold text-[14px]
                   rounded-full transition-colors"
      >
        롤링페이퍼 보기
      </button>

      {/* PIN 설정 섹션 */}
      <PinSetupSection messageId={messageId} authorToken={authorToken} />

      {/* 푸터 워드마크 — 클릭 시 홈으로 */}
      <button
        type="button"
        onClick={() => navigate('/create')}
        aria-label="홈으로"
        className="w-full mt-10 mb-2 flex justify-center"
      >
        <p className="text-[10px] font-light tracking-[0.2em] text-black/20 select-none">
          Rolling paper&nbsp;&nbsp;|&nbsp;&nbsp;Pium
        </p>
      </button>
    </div>
  )
}
