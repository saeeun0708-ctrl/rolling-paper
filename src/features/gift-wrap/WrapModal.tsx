import { honorificSuffix } from '../../lib/honorific'

interface Props {
  recipientName: string
  onConfirm: () => Promise<void>
  onCancel:  () => void
  isLoading: boolean
}

export default function WrapModal({ recipientName, onConfirm, onCancel, isLoading }: Props) {
  const honorific = honorificSuffix(recipientName)

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-5 z-50">
      <div className="bg-white rounded-3xl p-7 w-full max-w-sm">

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎁</div>
          <h2 className="text-[1.3rem] font-black text-black mb-2">
            롤링페이퍼를 포장할까요?
          </h2>
          <p className="text-[13px] text-black/50 leading-relaxed">
            <strong className="text-black">{recipientName}</strong>{honorific} 보낼<br />
            열람 링크가 만들어져요
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3.5 border border-[#e6e6e6] hover:border-black/30
                       rounded-full text-[14px] text-black/60 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3.5 bg-black text-white rounded-full
                       text-[14px] font-bold disabled:opacity-40"
          >
            {isLoading ? '포장 중...' : '포장하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
