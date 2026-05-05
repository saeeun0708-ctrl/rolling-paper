import { FlowerShape, FLOWER_EMOJIS } from '../utils'

interface Props {
  charCount: number
  maxChars: number
  shape: FlowerShape | null
}

/**
 * 마음 게이지 — 글자 수에 따라 꽃이 점점 선명해짐
 * 0자: 미표시 / 1자 이상: 꽃 + 진행 바 표시
 */
export default function HeartGauge({ charCount, maxChars, shape }: Props) {
  if (charCount === 0) return null

  const progress = Math.min(charCount / maxChars, 1)
  // 0.25 → 1.0 사이로 선명도 조절
  const opacity  = 0.25 + progress * 0.75
  const emoji    = shape ? FLOWER_EMOJIS[shape] : '🌸'

  return (
    <div className="flex items-center gap-2.5 mt-2">
      {/* 꽃 미리보기 */}
      <span
        className="text-2xl transition-all duration-300 select-none"
        style={{ opacity }}
      >
        {emoji}
      </span>

      {/* 진행 바 */}
      <div className="flex-1 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width:           `${Math.max(progress * 100, 2)}%`,
            backgroundColor: `rgba(92, 176, 84, ${opacity})`,
          }}
        />
      </div>

      {/* 글자 수 */}
      <span className="text-[12px] text-black/30 tabular-nums shrink-0">
        {charCount}/{maxChars}
      </span>
    </div>
  )
}
