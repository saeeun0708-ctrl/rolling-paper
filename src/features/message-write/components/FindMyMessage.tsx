import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { supabase } from '../../../lib/supabase'
import { storeAuthor, FlowerShape } from '../utils'

interface Props {
  slug: string
  roomId: string
  onFound: () => void
}

type Status = 'idle' | 'searching' | 'not_found' | 'error'

export default function FindMyMessage({ slug, roomId, onFound }: Props) {
  const [open, setOpen]     = useState(false)
  const [name, setName]     = useState('')
  const [pin, setPin]       = useState('')
  const [status, setStatus] = useState<Status>('idle')

  async function handleFind() {
    if (!name.trim() || !/^\d{6}$/.test(pin)) return
    setStatus('searching')

    try {
      // author_pin_hash가 있는 메시지를 이름으로 조회
      const { data, error } = await supabase
        .from('messages')
        .select('id, author_name, author_token, author_pin_hash, body, shape')
        .eq('room_id', roomId)
        .eq('author_name', name.trim())
        .eq('status', 'visible')
        .not('author_pin_hash', 'is', null)

      if (error) throw error
      if (!data || data.length === 0) {
        setStatus('not_found')
        return
      }

      // 각 결과에 대해 PIN 비교
      for (const row of data) {
        const match = await bcrypt.compare(pin, row.author_pin_hash!)
        if (match) {
          // localStorage에 저장 후 페이지 갱신
          storeAuthor(slug, {
            token:     row.author_token,
            name:      row.author_name,
            messageId: row.id,
            body:      row.body,
            shape:     row.shape as FlowerShape,
          })
          onFound()
          return
        }
      }

      setStatus('not_found')
    } catch {
      setStatus('error')
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-3 text-[13px] text-black/40 hover:text-black/70
                   transition-colors text-center"
      >
        다른 기기에서 작성했나요? 내 글 찾기
      </button>
    )
  }

  return (
    <div className="rounded-2xl bg-[#f5f5f5] px-5 py-4 space-y-3">
      <p className="text-[13px] font-bold text-black">내 글 찾기</p>
      <p className="text-[12px] text-black/40">
        작성 시 설정한 이름과 PIN을 입력하세요.
      </p>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="작성 시 쓴 이름"
        maxLength={12}
        className="w-full px-4 py-3 rounded-xl bg-white text-[15px]
                   border-2 border-transparent focus:border-black/10 focus:outline-none"
      />
      <input
        type="password"
        inputMode="numeric"
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="PIN 6자리"
        className="w-full px-4 py-3 rounded-xl bg-white text-[15px] tracking-widest
                   border-2 border-transparent focus:border-black/10 focus:outline-none"
      />

      {status === 'not_found' && (
        <p className="text-[12px] text-red-500">
          일치하는 글을 찾지 못했어요. 이름이나 PIN을 확인해주세요.
        </p>
      )}
      {status === 'error' && (
        <p className="text-[12px] text-red-500">오류가 발생했어요. 다시 시도해주세요.</p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-3 border border-[#e6e6e6] rounded-full text-[14px] text-black/50"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleFind}
          disabled={status === 'searching'}
          className="flex-1 py-3 bg-black text-white text-[14px] font-bold
                     rounded-full disabled:opacity-40"
        >
          {status === 'searching' ? '찾는 중...' : '확인'}
        </button>
      </div>
    </div>
  )
}
