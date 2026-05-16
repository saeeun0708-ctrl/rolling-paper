import confetti from 'canvas-confetti'

export function initConfetti(): void {
  // 기본 canvas-confetti 방식으로 전환 — 사전 초기화 불필요
}

export function celebrateConfetti(): void {
  const origin = { x: 0.5, y: 0.55 }
  const colors = ['#5cb054', '#86c982', '#dceeb1', '#FEE500', '#ffffff', '#ffd6e0']

  confetti({ particleCount: 120, spread: 80, startVelocity: 55, origin, colors, ticks: 200, gravity: 0.9, scalar: 1.1 })

  setTimeout(() => {
    confetti({ particleCount: 60, angle: 60,  spread: 55, startVelocity: 45, origin: { x: 0.15, y: 0.6 }, colors, ticks: 180, gravity: 0.95 })
    confetti({ particleCount: 60, angle: 120, spread: 55, startVelocity: 45, origin: { x: 0.85, y: 0.6 }, colors, ticks: 180, gravity: 0.95 })
  }, 150)

  setTimeout(() => {
    confetti({ particleCount: 40, spread: 100, startVelocity: 30, origin, colors, ticks: 150, gravity: 1.1, scalar: 0.8 })
  }, 350)
}
