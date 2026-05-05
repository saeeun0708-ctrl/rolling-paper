import type { ComponentType } from 'react'
import Carnation from './Carnation'
import Daisy     from './Daisy'
import Tulip     from './Tulip'
import Clover    from './Clover'
import Star      from './Star'
import type { FlowerShape } from '../../features/message-write/utils'
import type { FlowerProps } from './types'

// ─── 개별 컴포넌트 export ────────────────────────────────────────────────────
export { default as Carnation } from './Carnation'
export { default as Daisy }     from './Daisy'
export { default as Tulip }     from './Tulip'
export { default as Clover }    from './Clover'
export { default as Star }      from './Star'
export type { FlowerProps }     from './types'

// ─── Shape → 컴포넌트 매핑 ───────────────────────────────────────────────────
// 디자인 교체 시 각 컴포넌트 파일의 SVG만 수정하면 전체 앱에 반영됩니다.
export const FLOWER_COMPONENTS: Record<FlowerShape, ComponentType<FlowerProps>> = {
  carnation: Carnation,
  daisy:     Daisy,
  tulip:     Tulip,
  clover:    Clover,
  star:      Star,
}

// ─── Shape → 기본 색상 매핑 ─────────────────────────────────────────────────
export const FLOWER_COLORS: Record<FlowerShape, string> = {
  carnation: '#f43f67',  // 핑크레드
  daisy:     '#fbbf24',  // 노랑
  tulip:     '#c026d3',  // 보라
  clover:    '#22d3ee',  // 청록
  star:      '#f59e0b',  // 황금
}
