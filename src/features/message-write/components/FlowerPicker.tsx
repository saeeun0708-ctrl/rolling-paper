import { FlowerShape, FLOWER_LABELS, FLOWER_SHAPES } from '../utils'
import { FLOWER_SVG_COMPONENTS } from '../../viewer/FlowerSvg'

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
          const FlowerComp = FLOWER_SVG_COMPONENTS[shape] ?? FLOWER_SVG_COMPONENTS.daisy
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onChange(shape)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl
                          transition-all min-h-[44px]
                          ${selected
                            ? 'bg-[#f3ede0] ring-2 ring-[#c25a7e]'
                            : 'bg-[#f5f5f5] hover:bg-[#ebebeb]'}`}
            >
              <FlowerComp size={34}/>
              <span className={`text-[11px] font-medium ${selected ? 'text-[#c25a7e]' : 'text-black/60'}`}>
                {FLOWER_LABELS[shape]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
