// 이미지 내보내기 유틸리티
// html2canvas 우선 사용, 실패 시 dom-to-image 폴백

import html2canvas from 'html2canvas'
import domtoimage  from 'dom-to-image'
import { honorificSuffix } from './honorific'

export interface ExportOptions {
  element:       HTMLElement
  filename:      string
  width?:        number // 기본 1080
  onProgress?:  (pct: number) => void
}

/** 캡처 대상의 가용 폭을 안전하게 얻는다.
 *  H4: motion.div/position:fixed 등에서 offsetWidth가 0이 될 수 있어
 *      viewport 폭을 폴백으로 사용한다. */
function safeOffsetWidth(element: HTMLElement): number {
  return element.offsetWidth || window.innerWidth || 360
}

/** HTML 요소를 PNG로 캡처하여 다운로드 */
export async function captureAndDownload({ element, filename, width = 1080, onProgress }: ExportOptions): Promise<void> {
  onProgress?.(10)

  // H5: 한글 폰트가 fallback으로 캡처되는 것을 방지 — 캡처 전 폰트 로딩 대기.
  // document.fonts API는 모던 모바일 브라우저에서 모두 지원.
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    try { await document.fonts.ready } catch { /* 폰트 로딩 실패해도 캡처는 시도 */ }
  }

  try {
    // ── html2canvas 시도 ──────────────────────────────────────────
    const baseWidth = safeOffsetWidth(element)
    const scale = width / baseWidth
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (_doc, cloned) => {
        // 캡처 영역에서 숨길 요소 처리
        cloned.querySelectorAll('[data-export-hide]').forEach(el => {
          (el as HTMLElement).style.display = 'none'
        })
      },
    })
    onProgress?.(80)
    await downloadCanvas(canvas, filename)
    onProgress?.(100)
  } catch (html2canvasError) {
    console.warn('html2canvas 실패, dom-to-image로 폴백:', html2canvasError)

    try {
      // ── dom-to-image 폴백 ─────────────────────────────────────
      const baseWidth = safeOffsetWidth(element)
      const baseHeight = element.offsetHeight || window.innerHeight || 640
      const scale = width / baseWidth
      const dataUrl = await domtoimage.toPng(element, {
        width:  baseWidth  * scale,
        height: baseHeight * scale,
        style: { transform: `scale(${scale})`, transformOrigin: 'top left' },
      })
      onProgress?.(80)
      downloadDataUrl(dataUrl, filename)
      onProgress?.(100)
    } catch (domError) {
      console.error('dom-to-image도 실패, 텍스트 폴백:', domError)
      throw new Error('IMAGE_EXPORT_FAILED')
    }
  }
}

function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) { resolve(); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}

/** 이미지 캡처 완전 실패 시 텍스트 파일로 폴백 */
export function downloadAsTxt(recipientName: string, messages: Array<{ author_name: string; body: string }>) {
  const lines = [
    `${recipientName}${honorificSuffix(recipientName)} 보내는 마음들`,
    `저장일: ${new Date().toLocaleDateString('ko-KR')}`,
    '',
    ...messages.map((m, i) => [`[${i + 1}] ${m.author_name}`, m.body, ''].join('\n')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${recipientName}${honorificSuffix(recipientName)}_롤링페이퍼.txt`
  a.click()
  URL.revokeObjectURL(url)
}

/** 파일명 생성 */
export function makeFilename(recipientName: string) {
  const date = new Date().toISOString().slice(0, 10)
  return `${recipientName}${honorificSuffix(recipientName)}_롤링페이퍼_${date}.png`
}
