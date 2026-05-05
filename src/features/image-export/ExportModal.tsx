import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { captureAndDownload, downloadAsTxt, makeFilename } from '../../lib/imageExport'

interface Message { id: string; author_name: string; shape: string; body: string; created_at: string }

interface Props {
  recipientName:  string
  messages:       Message[]
  meadowRef:      React.RefObject<HTMLDivElement | null>
  listRef:        React.RefObject<HTMLDivElement | null>
  onClose:        () => void
}

type ExportType = 'meadow' | 'list' | 'all'

const OPTIONS: { type: ExportType; label: string; icon: string; desc: string }[] = [
  { type: 'meadow', icon: '🌿', label: '풍경만',   desc: '풀숲 전체 뷰' },
  { type: 'list',   icon: '📋', label: '메시지만', desc: '전체 메시지 세로 이미지' },
  { type: 'all',    icon: '🖼️', label: '전체',     desc: '풍경 + 메시지 모두' },
]

export default function ExportModal({ recipientName, messages, meadowRef, listRef, onClose }: Props) {
  const [selected, setSelected]   = useState<ExportType>('all')
  const [progress, setProgress]   = useState(0)
  const [isCapturing, setCapturing] = useState(false)
  const [error, setError]         = useState('')
  const allRef = useRef<HTMLDivElement>(null)

  async function handleExport() {
    setCapturing(true)
    setProgress(5)
    setError('')

    const filename = makeFilename(recipientName)

    try {
      let target: HTMLElement | null = null

      if (selected === 'meadow' && meadowRef.current) {
        target = meadowRef.current
      } else if (selected === 'list' && listRef.current) {
        target = listRef.current
      } else if (selected === 'all' && allRef.current) {
        target = allRef.current
      }

      if (!target) throw new Error('IMAGE_EXPORT_FAILED')

      await captureAndDownload({
        element:    target,
        filename,
        width:      1080,
        onProgress: setProgress,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg === 'IMAGE_EXPORT_FAILED') {
        // 텍스트 폴백
        downloadAsTxt(recipientName, messages)
        setError('이미지 저장에 실패해서 텍스트 파일로 저장했어요.')
      } else {
        setError('저장 중 오류가 발생했어요. 다시 시도해주세요.')
      }
    } finally {
      setCapturing(false)
      setProgress(0)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-t-3xl px-5 pb-8 pt-5"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      >
        {/* 드래그 핸들 */}
        <div className="w-10 h-1 bg-black/10 rounded-full mx-auto mb-5"/>

        <h2 className="text-[18px] font-black text-black mb-1">이미지로 저장</h2>
        <p className="text-[13px] text-black/40 mb-5">
          롤링페이퍼가 사라지기 전에 이미지로 보관하세요.
        </p>

        {/* 옵션 선택 */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {OPTIONS.map(opt => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setSelected(opt.type)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all
                ${selected === opt.type
                  ? 'bg-[#f3ede0] ring-2 ring-[#c25a7e]'
                  : 'bg-[#f5f5f5] hover:bg-[#ebebeb]'}`}
            >
              <span className="text-2xl leading-none">{opt.icon}</span>
              <span className={`text-[12px] font-bold ${selected === opt.type ? 'text-[#c25a7e]' : 'text-black/70'}`}>
                {opt.label}
              </span>
              <span className="text-[10px] text-black/40 leading-tight text-center px-1">
                {opt.desc}
              </span>
            </button>
          ))}
        </div>

        {/* 진행 바 */}
        {isCapturing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] text-black/50">저장 중...</span>
              <span className="text-[12px] text-black/50">{progress}%</span>
            </div>
            <div className="h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#c25a7e] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <p className="text-[12px] text-[#c25a7e] text-center mb-3">{error}</p>
        )}

        {/* 저장 버튼 */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isCapturing}
          className="w-full py-4 bg-black text-white font-bold text-[15px] rounded-full
                     disabled:opacity-40 transition-colors"
        >
          {isCapturing
            ? <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"/>
                저장 중...
              </span>
            : '📥 이미지 저장하기'}
        </button>

        <p className="text-[11px] text-black/30 text-center mt-3">
          가로 1080px PNG · 갤러리에 저장됩니다
        </p>
      </motion.div>
    </motion.div>
  )
}
