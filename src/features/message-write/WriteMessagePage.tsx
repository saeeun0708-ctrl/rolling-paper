import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  getStoredAuthorsList, storeAuthorsList,
  StoredAuthor, FlowerShape,
} from './utils'
import { useWriteMessage } from './useWriteMessage'
import HeartGauge    from './components/HeartGauge'
import FlowerPicker  from './components/FlowerPicker'
import SuccessView   from './components/SuccessView'
import FindMyMessage from './components/FindMyMessage'

interface Room { id: string; recipient_name: string; status: string }
type PageView = 'loading' | 'error' | 'form' | 'success'

const MAX_MESSAGES = 5

const MAX_CHARS = 500

export default function WriteMessagePage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  if (!slug) {
    return (
      <main className="min-h-dvh bg-white flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-4xl mb-4">🍃</p>
          <p className="text-[15px] text-black/60">존재하지 않는 롤링페이퍼예요.</p>
        </div>
      </main>
    )
  }

  return <WriteMessagePageInner slug={slug} navigate={navigate} />
}

interface InnerProps {
  slug: string
  navigate: ReturnType<typeof useNavigate>
}

function WriteMessagePageInner({ slug, navigate }: InnerProps) {
  const location = useLocation()
  const editMessageId = (location.state as { editMessageId?: string } | null)?.editMessageId
  const [room, setRoom]               = useState<Room | null>(null)
  const [view, setView]               = useState<PageView>('loading')
  const [deleteError, setDeleteError] = useState('')
  const [errorMsg, setErrorMsg]       = useState('')

  // 다중 메시지 — 이 기기에서 작성한 메시지 목록 + 현재 선택된 인덱스
  const [storedList, setStoredList]   = useState<StoredAuthor[]>([])
  const [activeIdx, setActiveIdx]     = useState<number | null>(null)
  const activeStored = activeIdx !== null ? (storedList[activeIdx] ?? null) : null

  const [successData, setSuccessData] = useState<{
    messageId: string; authorToken: string; shape: FlowerShape
    name: string; body: string
  } | null>(null)

  const isHostSession = typeof window !== 'undefined'
    && sessionStorage.getItem(`rp_host_${slug}`) === 'ok'
  const meadowPath = isHostSession ? `/r/${slug}/host` : `/r/${slug}/preview`

  const form = useWriteMessage(room?.id ?? '', slug)

  // ─── 방 정보 로드 ───────────────────────────────────────────────────────
  const fetchRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, recipient_name, status')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      setErrorMsg('존재하지 않는 롤링페이퍼예요.')
      setView('error')
      return
    }
    setRoom(data)
    const list = getStoredAuthorsList(slug)
    setStoredList(list)
    // 수정하기로 진입한 경우 — 해당 메시지를 자동 선택
    if (editMessageId) {
      const idx = list.findIndex(s => s.messageId === editMessageId)
      setActiveIdx(idx >= 0 ? idx : (list.length > 0 ? 0 : null))
    } else if (list.length > 0 && list.length < MAX_MESSAGES) {
      // 최대 개수 미만일 때만 첫 번째 자동 선택 — 꽉 차면 폼 미노출
      setActiveIdx(0)
    }
    setView('form')
  }, [slug])

  useEffect(() => { fetchRoom() }, [fetchRoom])

  // 최초 로드 시 선택된 메시지로 폼 채우기 (한 번만)
  const didInitPrefill = useRef(false)
  useEffect(() => {
    if (!didInitPrefill.current && storedList.length > 0 && activeIdx !== null) {
      form.prefillForEdit(storedList[activeIdx])
      didInitPrefill.current = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedList, activeIdx])

  // ─── 배너 선택 ──────────────────────────────────────────────────────────
  function onSelectStored(idx: number) {
    setActiveIdx(idx)
    form.prefillForEdit(storedList[idx])
  }

  // ─── 새 메시지 작성 모드 ────────────────────────────────────────────────
  function onCreateNew() {
    setActiveIdx(null)
    form.resetForm()
  }

  // ─── 제출 ───────────────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!room) return
    if (isNewMode && storedList.length >= MAX_MESSAGES) return

    const result = await form.handleSubmit(activeStored?.token)
    if (!result) return

    const newEntry: StoredAuthor = {
      token:     result.authorToken,
      name:      form.values.name.trim(),
      messageId: result.messageId,
      body:      form.values.body.trim(),
      shape:     result.shape,
    }

    let newList: StoredAuthor[]
    let newActiveIdx: number

    if (activeIdx !== null) {
      // UPDATE — 기존 항목 교체
      newList = storedList.map((s, i) => i === activeIdx ? newEntry : s)
      newActiveIdx = activeIdx
    } else {
      // INSERT — 새 항목 추가
      newList = [...storedList, newEntry]
      newActiveIdx = newList.length - 1
    }

    storeAuthorsList(slug, newList)
    setStoredList(newList)
    setActiveIdx(newActiveIdx)
    setSuccessData({ ...result, name: newEntry.name, body: newEntry.body })
    setView('success')
  }

  // ─── 삭제 ───────────────────────────────────────────────────────────────
  async function onDeleteStored(idx: number) {
    const target = storedList[idx]
    if (!target) return
    if (!window.confirm('작성한 메시지를 삭제할까요?')) return
    setDeleteError('')
    const ok = await form.handleDelete(target.messageId, target.token)
    if (!ok) { setDeleteError('삭제 중 오류가 발생했어요.'); return }

    const newList = storedList.filter((_, i) => i !== idx)
    storeAuthorsList(slug, newList)
    setStoredList(newList)

    if (newList.length === 0) {
      setActiveIdx(null)
      form.resetForm()
    } else if (activeIdx === idx) {
      // 삭제된 항목이 선택된 항목이었으면 첫 번째로 이동
      setActiveIdx(0)
      form.prefillForEdit(newList[0])
    } else if (activeIdx !== null && activeIdx > idx) {
      setActiveIdx(activeIdx - 1)
    }
  }

  // ─── 수정 버튼 (success → form) ─────────────────────────────────────────
  function onEdit() {
    if (activeIdx !== null && storedList[activeIdx]) {
      form.prefillForEdit(storedList[activeIdx])
    }
    setView('form')
  }

  // ─── 다른 기기에서 내 글 찾기 성공 ────────────────────────────────────
  function onFound() {
    const list = getStoredAuthorsList(slug)
    setStoredList(list)
    if (list.length > 0) {
      setActiveIdx(0)
      form.prefillForEdit(list[0])
    }
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
            name={successData.name}
            body={successData.body}
            shape={successData.shape}
            messageId={successData.messageId}
            authorToken={successData.authorToken}
            onEdit={onEdit}
            onPreview={() => navigate(meadowPath)}
          />
        </div>
      </main>
    )
  }

  // ─── 폼 뷰 ──────────────────────────────────────────────────────────────
  const recipientName = room?.recipient_name ?? ''
  const honorific     = recipientName.endsWith('님') ? '께' : '님께'
  const isNewMode     = activeIdx === null

  return (
    <main className="min-h-dvh bg-white flex items-start justify-center px-5 py-12">
      <div className="w-full max-w-md">

        {/* 인트로 헤딩 */}
        <h1 className="text-[2rem] font-black text-black leading-[1.2] tracking-tight mb-8">
          <span className="text-[#5cb054]">{recipientName}</span>{honorific} 보내는<br />
          롤링페이퍼를 작성해주세요
        </h1>

        {/* 작성한 메시지 배너 목록 */}
        {storedList.length > 0 && (
          <div className="mb-6 space-y-2">
            {storedList.map((s, idx) => (
              <button
                key={s.messageId}
                type="button"
                onClick={() => onSelectStored(idx)}
                className={`w-full rounded-2xl px-5 py-4 flex items-center justify-between gap-3
                            text-left transition-all
                            ${activeIdx === idx
                              ? 'bg-[#dceeb1] ring-1 ring-[#5cb054]'
                              : 'bg-[#dceeb1] hover:bg-[#d2e8a8]'}`}
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-black">
                    {storedList.length > 1 ? `메시지 ${idx + 1}` : '이미 작성하셨어요'}
                  </p>
                  <p className="text-[12px] text-black/50 mt-0.5 truncate">{s.body}</p>
                </div>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); onDeleteStored(idx) }}
                  onKeyDown={e => e.key === 'Enter' && onDeleteStored(idx)}
                  className="shrink-0 text-[12px] text-black/40 hover:text-red-500 transition-colors"
                >
                  삭제
                </span>
              </button>
            ))}

            {deleteError && (
              <p className="text-[12px] text-red-500 text-center">{deleteError}</p>
            )}

            {/* 다른 메시지 작성하기 — 최대 5개 */}
            {storedList.length < MAX_MESSAGES ? (
              <button
                type="button"
                onClick={onCreateNew}
                className={`w-full py-3 text-[13px] font-semibold rounded-xl border transition-all
                            ${isNewMode
                              ? 'bg-[#f0f8e8] border-[#5cb054] text-[#5cb054]'
                              : 'bg-white border-[#d4d4d4] text-black/50 hover:border-[#5cb054] hover:text-[#5cb054]'}`}
              >
                + 다른 메시지 작성하기
              </button>
            ) : (
              <p className="text-center text-[12px] text-black/35">
                1인당 최대 {MAX_MESSAGES}개까지 작성할 수 있어요
              </p>
            )}
          </div>
        )}

        {/* 폼 — 최대 개수이고 아무 배너도 선택 안 됐을 때만 미노출 */}
        <form onSubmit={onSubmit} className="space-y-5"
          style={{ display: isNewMode && storedList.length >= MAX_MESSAGES ? 'none' : undefined }}
        >

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
              disabled={form.isSubmitting || !room}
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
                : isNewMode ? '마음 보내기' : '수정 완료'}
            </button>

            {/* 작성 이력이 있을 때 — 풀숲 보기 버튼 */}
            {storedList.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(meadowPath)}
                className="w-full py-3.5 mt-2 bg-white border border-[#d4d4d4]
                           hover:border-black text-black/70 hover:text-black
                           font-semibold text-[14px] rounded-full transition-colors
                           flex items-center justify-center gap-2"
              >
                🌿 롤링페이퍼 보기
              </button>
            )}
          </div>
        </form>

        {/* 다른 기기에서 내 글 찾기 — 저장된 메시지 없을 때만 */}
        {storedList.length === 0 && room && (
          <div className="mt-4">
            <FindMyMessage
              slug={slug}
              roomId={room.id}
              onFound={onFound}
            />
          </div>
        )}

        {/* 만든이 진입 */}
        <div className="mt-10 pt-6 border-t border-black/5 text-center">
          <Link
            to={`/r/${slug}/host`}
            className="text-[12px] text-black/30 hover:text-black/60 transition-colors"
          >
            이 롤링페이퍼의 만든이세요? <span className="underline underline-offset-2">관리하기</span>
          </Link>
        </div>
      </div>
    </main>
  )
}
