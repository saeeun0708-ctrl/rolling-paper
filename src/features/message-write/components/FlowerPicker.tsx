import { FlowerShape, FLOWER_EMOJIS, FLOWER_LABELS, FLOWER_SHAPES } from '../utils'

interface Props {
  value: FlowerShape | null
  onChange: (shape: FlowerShape) => void
}

export default function FlowerPicker({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-[13px] font-medium text-black/50 mb-3">
        꽃 모양 고르기{' '}
        <span className="text-black/30 font-normal">(안 고르면 랜덤)</span>
      </p>

      <div className="flex gap-2">
        {FLOWER_SHAPES.map(shape => {
          const selected = value === shape
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onChange(shape)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl
                          transition-colors min-h-[44px]
                          ${selected
                            ? 'bg-black text-white'
                            : 'bg-[#f5f5f5] hover:bg-[#ebebeb] text-black'}`}
            >
              <span className="text-xl leading-none">{FLOWER_EMOJIS[shape]}</span>
              <span className="text-[11px] font-medium">{FLOWER_LABELS[shape]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
