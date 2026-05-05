import { useMemo } from 'react'
import { pickRandomPrompts } from '../utils'

interface Props {
  recipientName: string
  onSelect: (text: string) => void
}

export default function PromptCards({ recipientName, onSelect }: Props) {
  // 마운트 시 1회만 랜덤 선택 (리렌더에 흔들리지 않도록 useMemo 사용)
  const count   = useMemo(() => (Math.random() < 0.5 ? 3 : 4), [])
  const prompts = useMemo(
    () => pickRandomPrompts(count, recipientName),
    // recipientName은 페이지 로드 후 바뀌지 않으므로 의존성 포함
    [count, recipientName],
  )

  return (
    <div>
      <p className="text-[13px] font-medium text-black/40 mb-2.5">
        💡 아이디어가 필요하다면 탭해보세요
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(prompt)}
            className="text-left text-[13px] text-black/60 bg-[#f5f5f5]
                       hover:bg-[#dceeb1] hover:text-black
                       px-3 py-2 rounded-lg transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
