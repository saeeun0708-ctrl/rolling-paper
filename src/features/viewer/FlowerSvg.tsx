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
      {/* 꽃잎 — 흰색 중심에서 연한 핑크로 (벚꽃 특유의 투명하고 부드러운 톤) */}
      <radialGradient id="cn-petal" cx="42%" cy="32%" r="68%">
        <stop offset="0%"   stopColor="#ffffff"/>
        <stop offset="45%"  stopColor="#fde8f4"/>
        <stop offset="100%" stopColor="#ecaac8"/>
      </radialGradient>
      {/* 수술 중심 */}
      <radialGradient id="cn-center" cx="50%" cy="40%" r="55%">
        <stop offset="0%"  stopColor="#fff090"/>
        <stop offset="100%" stopColor="#e89830"/>
      </radialGradient>
      {/* 잎 */}
      <linearGradient id="cn-leaf" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#a8d090"/>
        <stop offset="100%" stopColor="#5a9050"/>
      </linearGradient>
    </defs>

    {/* 줄기 — 벚나무 특유의 갈색빛 */}
    <path d="M50 62 Q50 80 50 96" stroke="#b08890" strokeWidth="2.4" strokeLinecap="round" fill="none"/>

    {/* 잎 2장 */}
    <path d="M50 78 Q63 72 68 84 Q60 84 50 80 Z" fill="url(#cn-leaf)" opacity="0.9"/>
    <path d="M50 86 Q39 80 34 90 Q42 90 50 88 Z" fill="url(#cn-leaf)" opacity="0.85"/>

    {/* 꽃잎 5장 — 끝에 V자 홈(노치)이 있는 벚꽃 모양 */}
    {[0, 72, 144, 216, 288].map((deg, i) => (
      <path key={i}
        d="M 50 42
           Q 36 37 37 22
           Q 39 8 46 6
           Q 50 13 54 6
           Q 61 8 63 22
           Q 64 37 50 42
           Z"
        fill="url(#cn-petal)"
        stroke="#e898c0" strokeWidth="0.6" strokeLinejoin="round"
        opacity="0.94"
        transform={`rotate(${deg} 50 42)`}
      />
    ))}

    {/* 수술 — 10개 가는 선 + 끝에 둥근 점 */}
    {Array.from({ length: 10 }).map((_, i) => {
      const a = (i / 10) * Math.PI * 2
      const x2 = 50 + Math.cos(a) * 9
      const y2 = 42 + Math.sin(a) * 9
      return (
        <g key={i}>
          <line x1="50" y1="42" x2={x2} y2={y2} stroke="#f4c038" strokeWidth="0.7" opacity="0.85"/>
          <circle cx={x2} cy={y2} r="1.3" fill="#ffd858"/>
        </g>
      )
    })}

    {/* 중심 */}
    <circle cx="50" cy="42" r="3.5" fill="url(#cn-center)" stroke="#d09028" strokeWidth="0.5"/>
    <circle cx="48.5" cy="40.8" r="1" fill="#fff" opacity="0.45"/>
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
      {/* 바깥쪽 꽃잎 — 진한 핑크 톤 */}
      <linearGradient id="tl-outer" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#ffd6e4"/>
        <stop offset="50%"  stopColor="#f8a6c2"/>
        <stop offset="100%" stopColor="#d06a92"/>
      </linearGradient>
      {/* 안쪽 꽃잎 — 살짝 밝은 톤 */}
      <linearGradient id="tl-inner" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#ffe8f0"/>
        <stop offset="60%"  stopColor="#fbb8d0"/>
        <stop offset="100%" stopColor="#e088a8"/>
      </linearGradient>
      {/* 줄기 */}
      <linearGradient id="tl-stem" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#9bd084"/>
        <stop offset="100%" stopColor="#4a8a48"/>
      </linearGradient>
      {/* 잎 */}
      <linearGradient id="tl-leaf" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%"   stopColor="#a8d896"/>
        <stop offset="100%" stopColor="#3e7a3a"/>
      </linearGradient>
    </defs>

    {/* 잎 — 왼쪽으로 길게 뻗은 한 장 */}
    <path d="M50 64 Q24 56 18 90 Q34 80 46 70 Z"
      fill="url(#tl-leaf)" stroke="#3a6a3a" strokeWidth="0.6" opacity="0.9"/>

    {/* 줄기 */}
    <path d="M50 50 Q49 78 50 96" stroke="url(#tl-stem)" strokeWidth="3" strokeLinecap="round" fill="none"/>

    {/* 바깥쪽 꽃잎(컵 형태) */}
    <path d="M40 52 C 36 38, 38 22, 50 16 C 62 22, 64 38, 60 52 C 56 56, 44 56, 40 52 Z"
      fill="url(#tl-outer)" stroke="#b85580" strokeWidth="0.6"/>

    {/* 왼쪽 안쪽 꽃잎 */}
    <path d="M40 52 C 32 42, 30 24, 44 14 C 48 12, 50 14, 50 18 C 50 32, 46 46, 44 52 C 43 54, 41 54, 40 52 Z"
      fill="url(#tl-inner)" stroke="#c66a90" strokeWidth="0.6"/>

    {/* 오른쪽 안쪽 꽃잎 */}
    <path d="M60 52 C 68 42, 70 24, 56 14 C 52 12, 50 14, 50 18 C 50 32, 54 46, 56 52 C 57 54, 59 54, 60 52 Z"
      fill="url(#tl-inner)" stroke="#c66a90" strokeWidth="0.6" opacity="0.95"/>

    {/* 중심선 */}
    <path d="M50 18 Q50 36 50 50" stroke="#b85580" strokeWidth="0.5" opacity="0.4" fill="none"/>

    {/* 수채 하이라이트 */}
    <path d="M44 22 Q42 32 44 42" stroke="#fff" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round"/>
    <ellipse cx="56" cy="28" rx="2" ry="5" fill="#fff" opacity="0.4"/>
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
      {/* 꽃잎 — 노랑이 메인, 안쪽 끝에서만 주황으로 살짝 빠지는 톤 */}
      <linearGradient id="sf-petal" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%"  stopColor="#fff084"/>
        <stop offset="40%" stopColor="#ffd84a"/>
        <stop offset="90%" stopColor="#f0a820"/>
        <stop offset="100%" stopColor="#d68a18"/>
      </linearGradient>
      {/* 씨앗 원반 — 갈색이지만 너무 어둡지 않게 */}
      <radialGradient id="sf-disk" cx="50%" cy="45%" r="55%">
        <stop offset="0%"  stopColor="#9a5818"/>
        <stop offset="60%" stopColor="#6a3818"/>
        <stop offset="100%" stopColor="#3e2010"/>
      </radialGradient>
      {/* 잎 */}
      <linearGradient id="sf-leaf" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%"   stopColor="#9bd08a"/>
        <stop offset="100%" stopColor="#467a3e"/>
      </linearGradient>
    </defs>

    {/* 줄기 — 굵고 곧게 */}
    <path d="M50 58 Q50 80 50 96" stroke="#467a3e" strokeWidth="3.2" strokeLinecap="round" fill="none"/>

    {/* 잎 2장 — 양쪽 비대칭 */}
    <path d="M50 76 Q34 70 26 86 Q38 90 48 82 Z"
          fill="url(#sf-leaf)" stroke="#3a6630" strokeWidth="0.6"/>
    <path d="M50 82 Q66 76 74 92 Q62 94 52 86 Z"
          fill="url(#sf-leaf)" stroke="#3a6630" strokeWidth="0.6" opacity="0.93"/>

    {/* 뒷줄 꽃잎 — 20장, 살짝 회전해서 깊이감 */}
    <g transform="rotate(9 50 42)">
      {Array.from({ length: 20 }).map((_, i) => {
        const deg = (i * 360) / 20
        return (
          <path key={`b${i}`}
            d="M50 42 Q46 30 47 14 Q50 10 50 10 Q50 10 53 14 Q54 30 50 42 Z"
            fill="#d68a18" opacity="0.75"
            transform={`rotate(${deg} 50 42)`}/>
        )
      })}
    </g>

    {/* 앞줄 꽃잎 — 20장, 길쭉한 뾰족 모양 */}
    <g>
      {Array.from({ length: 20 }).map((_, i) => {
        const deg = (i * 360) / 20
        return (
          <path key={`f${i}`}
            d="M50 42 Q45 28 46 12 Q50 8 50 8 Q50 8 54 12 Q55 28 50 42 Z"
            fill="url(#sf-petal)" stroke="#c8770e" strokeWidth="0.3"
            strokeLinejoin="round" opacity="0.97"
            transform={`rotate(${deg} 50 42)`}/>
        )
      })}
    </g>

    {/* 씨앗 원반 — 큼직하게 (r=17) */}
    <circle cx="50" cy="42" r="17" fill="url(#sf-disk)" stroke="#3a2010" strokeWidth="0.5"/>

    {/* 씨앗 패턴 — 황금비 분포, 톤 부드럽게 */}
    <g fill="#2a1608">
      {Array.from({ length: 90 }).map((_, i) => {
        const golden = Math.PI * (3 - Math.sqrt(5))
        const r = Math.sqrt(i / 90) * 15
        const a = i * golden
        const x = 50 + Math.cos(a) * r
        const y = 42 + Math.sin(a) * r
        return <circle key={i} cx={x} cy={y} r="0.85" opacity="0.55"/>
      })}
    </g>

    {/* 중심부 살짝 밝게 — 햇빛 받는 느낌 */}
    <circle cx="47" cy="39" r="3.5" fill="#b87028" opacity="0.35"/>
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
