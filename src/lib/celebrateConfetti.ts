import confetti from 'canvas-confetti'

/**
 * 포장 완료 시 중앙에서 빵빠레처럼 터지는 컨페티 효과
 * - 컴포넌트 마운트 시 initConfetti()로 미리 준비해두면 지연 없이 즉시 실행
 */

let _canvas: HTMLCanvasElement | null = null
let _fire: confetti.CreateTypes | null = null

/** HostPage 마운트 시 미리 호출 — 첫 실행 지연 방지 */
export function initConfetti(): void {
  if (_fire) return
  _canvas = document.createElement('canvas')
  _canvas.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
  document.body.appendChild(_canvas)
  _fire = confetti.create(_canvas, { resize: true })
}

export function celebrateConfetti(): void {
  if (!_fire) initConfetti()
  const fire = _fire!
  const origin = { x: 0.5, y: 0.55 }
  const colors = ['#5cb054', '#86c982', '#dceeb1', '#FEE500', '#ffffff', '#ffd6e0']

  // 1차 — 중앙 폭발
  fire({
    particleCount: 120,
    spread: 80,
    startVelocity: 55,
    origin,
    colors,
    ticks: 200,
    gravity: 0.9,
    scalar: 1.1,
  })

  // 2차 — 좌우 샤워
  setTimeout(() => {
    fire({
      particleCount: 60,
      angle: 60,
      spread: 55,
      startVelocity: 45,
      origin: { x: 0.15, y: 0.6 },
      colors,
      ticks: 180,
      gravity: 0.95,
    })
    fire({
      particleCount: 60,
      angle: 120,
      spread: 55,
      startVelocity: 45,
      origin: { x: 0.85, y: 0.6 },
      colors,
      ticks: 180,
      gravity: 0.95,
    })
  }, 150)

  // 3차 — 마무리
  setTimeout(() => {
    fire({
      particleCount: 40,
      spread: 100,
      startVelocity: 30,
      origin,
      colors,
      ticks: 150,
      gravity: 1.1,
      scalar: 0.8,
    })
  }, 350)
}
