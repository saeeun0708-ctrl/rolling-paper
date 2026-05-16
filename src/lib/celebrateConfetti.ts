import confetti from 'canvas-confetti'

/**
 * 포장 완료 시 중앙에서 빵빠레처럼 터지는 컨페티 효과
 * 세 번의 버스트로 생동감 있는 빵빠레 느낌을 연출한다.
 */
export function celebrateConfetti(): void {
  // 공통 옵션 — 화면 정중앙에서 터짐
  const origin = { x: 0.5, y: 0.55 }
  const colors = ['#5cb054', '#86c982', '#dceeb1', '#FEE500', '#ffffff', '#ffd6e0']

  // 1차 — 크고 화려한 첫 번째 폭발
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 55,
    origin,
    colors,
    ticks: 200,
    gravity: 0.9,
    scalar: 1.1,
  })

  // 2차 — 약간 늦게, 좌우로 퍼지는 샤워
  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      startVelocity: 45,
      origin: { x: 0.15, y: 0.6 },
      colors,
      ticks: 180,
      gravity: 0.95,
    })
    confetti({
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
    confetti({
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
