// 수신자 이름에 붙일 존칭 처리.
//
// 사용자가 "이동화님 🥳❤️" 처럼 끝에 이모지·공백을 함께 입력하는 경우가 있다.
// 단순히 name.endsWith('님')으로 검사하면 이모지가 끝에 있을 때 false가 되어
// "이동화님 🥳❤️" + "님께" → "이동화님 🥳❤️님께" 같은 "님" 중복이 발생한다.
//
// 끝의 이모지·공백을 제거한 뒤 검사해 중복을 방지한다.

// 끝부분의 이모지(픽토그램·이모지 컴포넌트·variation selector·ZWJ) + 공백 제거
const TRAILING_EMOJI_WS = /[\p{Extended_Pictographic}\p{Emoji_Component}‍️\s]+$/u

/** 끝의 이모지·공백을 제거한 정제된 이름 (검사 전용) */
function stripTrailing(name: string): string {
  return name.trim().replace(TRAILING_EMOJI_WS, '')
}

/** 이름 뒤에 붙일 존칭만 반환. "엄마" → "님께", "부모님" → "께", "이동화님 🥳" → "께" */
export function honorificSuffix(name: string): string {
  return stripTrailing(name).endsWith('님') ? '께' : '님께'
}
