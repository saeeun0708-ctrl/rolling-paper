// === 꽃 SVG 일러스트 7종 ===
// Claude Design에서 디자인된 수채화 손그림 느낌의 꽃들
// 각 꽃은 viewBox 0 0 100 100, props: { size, style? }

interface FlowerProps {
  size?: number
  style?: React.CSSProperties
}

export const FlowerCarnation = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cn-petal" cx="50%" cy="55%" r="55%">
        <stop offset="0%" stopColor="#ffe0ea"/>
        <stop offset="50%" stopColor="#f8a8c4"/>
        <stop offset="100%" stopColor="#c8557e"/>
      </radialGradient>
    </defs>
    <path d="M50 70 Q49 86 50 96" stroke="#6ea866" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85"/>
    <path d="M50 86 Q42 84 38 90 Q44 90 50 90 Z" fill="#82bc78" opacity="0.85"/>
    {/* 바깥 겹 */}
    <g>
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path key={`o${deg}`}
          d="M50 50 Q34 36 38 22 Q44 16 50 22 Q56 16 62 22 Q66 36 50 50 Z"
          fill="url(#cn-petal)" opacity="0.85"
          transform={`rotate(${deg} 50 50)`}/>
      ))}
    </g>
    {/* 중간 겹 */}
    <g transform="rotate(30 50 50)">
      {[0, 72, 144, 216, 288].map((deg) => (
        <path key={`m${deg}`}
          d="M50 50 Q38 38 40 28 Q46 22 50 28 Q54 22 60 28 Q62 38 50 50 Z"
          fill="url(#cn-petal)" opacity="0.95"
          transform={`rotate(${deg} 50 50)`}/>
      ))}
    </g>
    {/* 안쪽 겹 */}
    <g>
      {[0, 90, 180, 270].map((deg) => (
        <path key={`i${deg}`}
          d="M50 50 Q42 44 44 36 Q48 32 50 36 Q52 32 56 36 Q58 44 50 50 Z"
          fill="#c8557e" opacity="0.8"
          transform={`rotate(${deg} 50 50)`}/>
      ))}
    </g>
    <circle cx="50" cy="50" r="3" fill="#fff5b8"/>
  </svg>
)

export const FlowerDaisy = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="dz-petal" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="80%" stopColor="#fdf6d8"/>
        <stop offset="100%" stopColor="#e8d896"/>
      </radialGradient>
      <radialGradient id="dz-center" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stopColor="#ffd76b"/>
        <stop offset="70%" stopColor="#e89c2a"/>
        <stop offset="100%" stopColor="#a86818"/>
      </radialGradient>
    </defs>
    <path d="M50 70 Q49 84 50 96" stroke="#6ea866" strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M50 82 Q58 80 62 86 Q56 84 50 86" fill="#82bc78"/>
    <g>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2
        const cx = 50 + Math.cos(a) * 22
        const cy = 45 + Math.sin(a) * 22
        const rot = (a * 180) / Math.PI + 90
        return (
          <ellipse key={i} cx={cx} cy={cy} rx="6.5" ry="13" fill="url(#dz-petal)"
            stroke="#d4c47a" strokeWidth="0.4"
            transform={`rotate(${rot} ${cx} ${cy})`}/>
        )
      })}
    </g>
    <circle cx="50" cy="45" r="9" fill="url(#dz-center)"/>
    <circle cx="47" cy="42" r="2" fill="#ffe89a" opacity="0.6"/>
  </svg>
)

export const FlowerTulip = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tl-petal" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffc6d8"/>
        <stop offset="60%" stopColor="#f490b0"/>
        <stop offset="100%" stopColor="#c95c82"/>
      </linearGradient>
      <linearGradient id="tl-leaf" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#9ed18e"/>
        <stop offset="100%" stopColor="#5a9858"/>
      </linearGradient>
    </defs>
    <path d="M50 70 Q30 60 26 88 Q42 82 50 75 Z" fill="url(#tl-leaf)" opacity="0.9"/>
    <path d="M50 70 Q70 62 76 86 Q60 82 50 75 Z" fill="url(#tl-leaf)" opacity="0.85"/>
    <path d="M50 50 Q49 78 50 96" stroke="#5a9858" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
    <path d="M34 50 Q32 28 50 22 Q68 28 66 50 Q60 56 50 56 Q40 56 34 50 Z" fill="url(#tl-petal)"/>
    <path d="M40 48 Q38 30 50 26 Q50 42 50 56 Q44 54 40 48 Z" fill="#ffd0e0" opacity="0.6"/>
    <path d="M60 48 Q62 30 50 26 Q50 42 50 56 Q56 54 60 48 Z" fill="#b34870" opacity="0.4"/>
    <path d="M50 28 Q50 42 50 54" stroke="#a04a6c" strokeWidth="0.6" fill="none" opacity="0.5"/>
  </svg>
)

export const FlowerClover = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="cl-leaf" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#b9e3a4"/>
        <stop offset="60%" stopColor="#6db85a"/>
        <stop offset="100%" stopColor="#3e7c34"/>
      </radialGradient>
    </defs>
    <path d="M50 60 Q49 80 50 96" stroke="#5a9858" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {[0, 90, 180, 270].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 50 50)`}>
        <path d="M50 50 Q34 42 36 24 Q44 18 50 24 Q56 18 64 24 Q66 42 50 50 Z"
          fill="url(#cl-leaf)" stroke="#3e7c34" strokeWidth="0.5" opacity="0.95"/>
        <path d="M50 50 Q44 38 46 28" stroke="#2e6024" strokeWidth="0.6" fill="none" opacity="0.5"/>
      </g>
    ))}
    <circle cx="50" cy="50" r="3" fill="#3e7c34"/>
  </svg>
)

export const FlowerStar = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="st-fill" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#fff8d0"/>
        <stop offset="55%" stopColor="#ffdc70"/>
        <stop offset="100%" stopColor="#e8a838"/>
      </radialGradient>
      <radialGradient id="st-glow" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stopColor="#fff5a8" stopOpacity="0.7"/>
        <stop offset="100%" stopColor="#fff5a8" stopOpacity="0"/>
      </radialGradient>
    </defs>
    <path d="M50 70 Q49 84 50 96" stroke="#6ea866" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    <circle cx="50" cy="48" r="36" fill="url(#st-glow)"/>
    <path d="M50 14 Q53 32 56 36 Q60 38 78 38 Q62 50 60 54 Q60 58 68 78 Q56 68 50 68 Q44 68 32 78 Q40 58 40 54 Q38 50 22 38 Q40 38 44 36 Q47 32 50 14 Z"
      fill="url(#st-fill)" stroke="#c98818" strokeWidth="1" strokeLinejoin="round"/>
    <ellipse cx="44" cy="36" rx="6" ry="4" fill="#fff" opacity="0.6"/>
    <circle cx="78" cy="22" r="1.6" fill="#fff5a8"/>
    <circle cx="22" cy="68" r="1.2" fill="#fff5a8"/>
    <circle cx="80" cy="62" r="1" fill="#fff5a8"/>
  </svg>
)

export const FlowerSunflower = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sf-petal" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#ffd84a"/>
        <stop offset="60%" stopColor="#f5a820"/>
        <stop offset="100%" stopColor="#c8770e"/>
      </linearGradient>
      <radialGradient id="sf-disk" cx="48%" cy="42%" r="55%">
        <stop offset="0%" stopColor="#7a4818"/>
        <stop offset="55%" stopColor="#4a2a0c"/>
        <stop offset="100%" stopColor="#28160a"/>
      </radialGradient>
      <linearGradient id="sf-leaf" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#9bd08a"/>
        <stop offset="100%" stopColor="#467a3e"/>
      </linearGradient>
    </defs>
    <path d="M50 70 Q49 84 50 96" stroke="#467a3e" strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M50 80 Q30 70 22 88 Q34 92 46 86 Z" fill="url(#sf-leaf)" stroke="#3a6630" strokeWidth="0.7"/>
    <path d="M50 86 Q70 78 78 94 Q66 96 52 90 Z" fill="url(#sf-leaf)" stroke="#3a6630" strokeWidth="0.7" opacity="0.95"/>
    {/* 뒷줄 꽃잎 */}
    <g transform="rotate(12.85 50 45)">
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2
        const cx = 50 + Math.cos(a) * 28
        const cy = 45 + Math.sin(a) * 28
        const rot = (a * 180) / Math.PI + 90
        return (
          <path key={`b${i}`}
            d={`M${cx} ${cy} q -4 -6 -3 -14 q 0 -4 3 -4 q 3 0 3 4 q 1 8 -3 14 Z`}
            fill="#c8770e" opacity="0.9"
            transform={`rotate(${rot} ${cx} ${cy})`}/>
        )
      })}
    </g>
    {/* 앞줄 꽃잎 */}
    <g>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = (i / 14) * Math.PI * 2
        const cx = 50 + Math.cos(a) * 26
        const cy = 45 + Math.sin(a) * 26
        const rot = (a * 180) / Math.PI + 90
        return (
          <path key={`f${i}`}
            d={`M${cx} ${cy} q -5 -8 -3 -18 q 0 -5 3 -5 q 3 0 3 5 q 2 10 -3 18 Z`}
            fill="url(#sf-petal)" stroke="#a0640e" strokeWidth="0.5" strokeLinejoin="round"
            transform={`rotate(${rot} ${cx} ${cy})`}/>
        )
      })}
    </g>
    {/* 씨앗 원반 */}
    <circle cx="50" cy="45" r="14" fill="url(#sf-disk)" stroke="#1c0e04" strokeWidth="0.8"/>
    <g fill="#1c0e04">
      {Array.from({ length: 60 }).map((_, i) => {
        const golden = Math.PI * (3 - Math.sqrt(5))
        const r = Math.sqrt(i / 60) * 12
        const a = i * golden
        const x = 50 + Math.cos(a) * r
        const y = 45 + Math.sin(a) * r
        return <circle key={i} cx={x} cy={y} r="0.7" opacity="0.85"/>
      })}
    </g>
    <circle cx="50" cy="45" r="2" fill="#1c0e04"/>
  </svg>
)

export const FlowerCherry = ({ size = 60, style }: FlowerProps) => (
  <svg viewBox="0 0 100 100" width={size} height={size} style={style} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="ch-petal" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stopColor="#ffffff"/>
        <stop offset="50%" stopColor="#ffe0ec"/>
        <stop offset="100%" stopColor="#f4a0c4"/>
      </radialGradient>
      <radialGradient id="ch-center" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffe884"/>
        <stop offset="100%" stopColor="#e8a23a"/>
      </radialGradient>
    </defs>
    {[0, 72, 144, 216, 288].map((deg) => (
      <g key={deg} transform={`rotate(${deg} 50 50)`}>
        <path d="M50 50 Q38 46 36 30 Q40 22 46 24 Q48 16 50 22 Q52 16 54 24 Q60 22 64 30 Q62 46 50 50 Z"
          fill="url(#ch-petal)" stroke="#e487ad" strokeWidth="0.6" strokeLinejoin="round"/>
        <path d="M50 22 L50 28" stroke="#e487ad" strokeWidth="0.5" opacity="0.6"/>
        <path d="M50 50 Q49 38 50 28 M50 50 Q44 40 44 30 M50 50 Q56 40 56 30"
          stroke="#dd7fa8" strokeWidth="0.4" fill="none" opacity="0.4"/>
      </g>
    ))}
    <g>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const x2 = 50 + Math.cos(a) * 7.5
        const y2 = 50 + Math.sin(a) * 7.5
        return (
          <g key={i}>
            <line x1="50" y1="50" x2={x2} y2={y2} stroke="#e8a23a" strokeWidth="0.7"/>
            <circle cx={x2} cy={y2} r="1" fill="#ffd86b"/>
          </g>
        )
      })}
    </g>
    <circle cx="50" cy="50" r="3.5" fill="url(#ch-center)"/>
    <circle cx="48.5" cy="48.5" r="1" fill="#fff" opacity="0.6"/>
  </svg>
)

// 꽃 컴포넌트 맵
export const FLOWER_SVG_COMPONENTS = {
  carnation: FlowerCarnation,
  daisy:     FlowerDaisy,
  tulip:     FlowerTulip,
  clover:    FlowerClover,
  star:      FlowerStar,
  sunflower: FlowerSunflower,
  cherry:    FlowerCherry,
} as const

export type FlowerSvgShape = keyof typeof FLOWER_SVG_COMPONENTS
