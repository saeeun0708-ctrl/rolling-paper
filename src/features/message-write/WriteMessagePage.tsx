import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { getStoredAuthor, StoredAuthor, FlowerShape } from './utils'
import { useWriteMessage } from './useWriteMessage'
import HeartGauge   from './components/HeartGauge'
import FlowerPicker from './components/FlowerPicker'
import SuccessView  from './components/SuccessView'
import FindMyMessage from './components/FindMyMessage'

interface Room { id: string; recipient_name: string; status: string }
type PageView = 'loading' | 'error' | 'form' | 'success'

const MAX_CHARS = 500

export default function WriteMessagePage() {
  const { slug } = useParams<{ slug: string }>()

  const [room, setRoom]               = useState<Room | null>(null)
  const [view, setView]               = useState<PageView>('loading')
  const [deleteError, setDeleteError] = useState('')
  const [errorMsg, setErrorMsg]       = useState('')
  const [stored, setStored]           = useState<StoredAuthor | null>(null)
  const [successData, setSuccessData] = useState<{
    messageId: string; authorToken: string; shape: FlowerShape
  } | null>(null)

  const form = useWriteMessage(room?.id ?? '', slug ?? '')

  // ─── 방 정보 로드 + localStorage 확인 ──────────────────────────────────
  useEffect(() => {
    if (!slug) return
    supabase
      .from('rooms')
      .select('id, recipient_name, status')
      .eq('slug', slug)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setErrorMsg('존재하지 않는 롤링페이퍼예요.')
          setView('error')
          return
        }
        setRoom(data)
        const s = getStoredAuthor(slug)
        if (s) setStored(s)
        setView('form')
      })
  }, [slug])

  // ─── 제출 ───────────────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = await form.handleSubmit(stored?.token)
    if (result) {
      setStored(getStoredAuthor(slug!))
      setSuccessData(result)
      setView('success')
    }
  }

  // ─── 삭제 ───────────────────────────────────────────────────────────────
  async function onDelete() {
    if (!stored) return
    if (!window.confirm('작성한 메시지를 삭제할까요?')) return
    setDeleteError('')
    const ok = await form.handleDelete(stored.messageId, stored.token)
    if (ok) {
      setStored(null)
      form.resetForm()
    } else {
      setDeleteError('삭제 중 오류가 발생했어요. 다시 시도해주세요.')
    }
  }

  // ─── 수정 버튼 (success → form 으로 돌아오기) ─────────────────────────
  function onEdit() {
    if (stored) form.prefillForEdit(stored)
    setView('form')
  }

  // ─── 다른 기기에서 내 글 찾기 성공 콜백 ────────────────────────────────
  function onFound() {
    const s = getStoredAuthor(slug!)
    if (s) setStored(s)
  }

  // ─── 렌더링 ─────────────────────────────────────────────────────────────
  if (view === 'loading') {
    return (
      <main className="min-h-dvh bg-white flex items-center justify-center">
        <span className="text-3xl animate-pulse">🌿</span>
      </main>
    )
  }

  if (view === 'error') {
    return (
      <main className="min-h-dvh bg-white flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-4xl mb-4">🍃</p>
          <p className="text-[15px] text-black/60">{errorMsg}</p>
        </div>
      </main>
    )
  }

  if (view === 'success' && successData) {
    return (
      <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <SuccessView
            name={stored?.name ?? ''}
            body={stored?.body ?? ''}
            shape={successData.shape}
            messageId={successData.messageId}
            authorToken={successData.authorToken}
            onEdit={onEdit}
          />
        </div>
      </main>
    )
  }

  // ─── 폼 뷰 ──────────────────────────────────────────────────────────────
  const recipientName = room?.recipient_name ?? ''
  const honorific     = recipientName.endsWith('님') ? '께' : '님께'

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* 아이브로우 */}
        <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-black/30 mb-5">
          Rolling Paper
        </p>

        {/* 인트로 헤딩 */}
        <h1 className="text-[2rem] font-black text-black leading-[1.2] tracking-tight mb-2">
          <span className="text-[#5cb054]">{recipientName}</span>{honorific} 보내는<br />
          롤링페이퍼를 작성해주세요
        </h1>
        <p className="text-black/40 text-[14px] mb-8">
          한 마디 남겨주세요
        </p>

        {/* 이미 작성한 경우 — 배너 표시 */}
        {stored && (
          <div className="mb-6">
            <div className="rounded-2xl bg-[#dceeb1] px-5 py-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[13px] font-bold text-black">이미 작성하셨어요</p>
                <p className="text-[12px] text-black/50 mt-0.5 line-clamp-1">{stored.body}</p>
              </div>
              <button
                type="button"
                onClick={onDelete}
                className="shrink-0 text-[12px] text-black/40 hover:text-red-500 transition-colors"
              >
                삭제
              </button>
            </div>
            {deleteError && (
              <p className="mt-2 text-[12px] text-red-500 text-center">{deleteError}</p>
            )}
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={onSubmit} className="space-y-5">

          {/* 이름 */}
          <div>
            <label className="block text-[13px] font-medium text-black/50 mb-1.5">
              내 이름
            </label>
            <input
              type="text"
              value={form.values.name}
              onChange={e => form.handleChange('name', e.target.value)}
              placeholder="예: 큰딸, 홍길동"
              maxLength={12}
              className={`w-full px-4 py-3.5 rounded-xl text-[15px] text-black
                          bg-[#f5f5f5] placeholder:text-black/25
                          border-2 transition-colors
                          focus:outline-none focus:bg-white focus:border-black/10
                          ${form.errors.name ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
            />
            {form.errors.name && (
              <p className="mt-1.5 text-[12px] text-red-500">{form.errors.name}</p>
            )}
          </div>

          {/* 본문 */}
          <div>
            <label className="block text-[13px] font-medium text-black/50 mb-1.5">
              마음 담기
            </label>
            <textarea
              value={form.values.body}
              onChange={e => form.handleChange('body', e.target.value)}
              placeholder="한 줄이어도 괜찮아요. 지금 떠오르는 마음을 적어주세요"
              maxLength={MAX_CHARS}
              rows={5}
              className={`w-full px-4 py-3.5 rounded-xl text-[16px] text-black leading-relaxed
                          bg-[#f5f5f5] placeholder:text-black/25 resize-none
                          border-2 transition-colors
                          focus:outline-none focus:bg-white focus:border-black/10
                          ${form.errors.body ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
            />
            {/* 마음 게이지 */}
            <HeartGauge
              charCount={form.values.body.length}
              maxChars={MAX_CHARS}
              shape={form.values.shape}
            />
            {form.errors.body && (
              <p className="mt-1.5 text-[12px] text-red-500">{form.errors.body}</p>
            )}
          </div>

          {/* 꽃 선택 */}
          <FlowerPicker
            value={form.values.shape}
            onChange={s => form.handleChange('shape', s)}
          />

          {/* 서버 에러 */}
          {form.errors.submit && (
            <p className="text-[13px] text-red-500 text-center">{form.errors.submit}</p>
          )}

          {/* 제출 버튼 */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="w-full py-4 bg-black hover:bg-black/80 text-white
                         font-bold text-[15px] rounded-full transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {form.isSubmitting
                ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                    전송 중...
                  </span>
                )
                : stored ? '수정 완료' : '마음 보내기'}
            </button>
          </div>
        </form>

        {/* 다른 기기에서 내 글 찾기 */}
        {!stored && room && (
          <div className="mt-4">
            <FindMyMessage
              slug={slug!}
              roomId={room.id}
              onFound={onFound}
            />
          </div>
        )}
      </div>
    </main>
  )
}
