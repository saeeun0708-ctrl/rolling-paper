import confetti from 'canvas-confetti'

/**
 * 포장 완료 시 중앙에서 빵빠레처럼 터지는 컨페티 효과
 * useWorker: true → Web Worker에서 실행, React 렌더 사이클과 완전 분리
 */

let _confetti: confetti.CreateTypes | null = null

function getConfetti(): confetti.CreateTypes {
  if (!_confetti) {
    const canvas = document.createElement('canvas')
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(canvas)
    _confetti = confetti.create(canvas, { resize: true, useWorker: true })
  }
  return _confetti
}

export function celebrateConfetti(): void {
  const fire = getConfetti()
  const origin = { x: 0.5, y: 0.55 }
  const colors = ['#5cb054', '#86c982', '#dceeb1', '#FEE500', '#ffffff', '#ffd6e0']

  // 1차 — 크고 화려한 첫 번째 폭발
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

  // 3차 — 마무리 잔여 파티클
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
