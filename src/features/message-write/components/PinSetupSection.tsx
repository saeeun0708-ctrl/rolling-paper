import { useState } from 'react'
import bcrypt from 'bcryptjs'
import { supabase } from '../../../lib/supabase'

interface Props {
  messageId: string
  authorToken: string
}

type Status = 'idle' | 'open' | 'submitting' | 'done' | 'error'

export default function PinSetupSection({ messageId, authorToken }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [pin, setPin]       = useState('')
  const [errMsg, setErrMsg] = useState('')

  async function handleSave() {
    if (!/^\d{6}$/.test(pin)) {
      setErrMsg('숫자 6자리를 입력해주세요.')
      return
    }
    setStatus('submitting')
    try {
      const hash = await bcrypt.hash(pin, 10)
      const { error } = await supabase
        .from('messages')
        .update({ author_pin_hash: hash })
        .eq('id', messageId)
        .eq('author_token', authorToken)

      if (error) throw error
      setStatus('done')
    } catch {
      setErrMsg('저장 중 오류가 발생했어요.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="mt-5 rounded-2xl bg-[#dceeb1] px-5 py-4 text-center">
        <p className="text-[14px] font-bold text-black">🔒 비밀번호가 설정됐어요!</p>
        <p className="text-[12px] text-black/50 mt-1">다른 기기에서 이름 + 비밀번호로 수정할 수 있어요.</p>
      </div>
    )
  }

  return (
    <div className="mt-5">
      {status === 'idle' && (
        <button
          type="button"
          onClick={() => setStatus('open')}
          className="w-full py-3 text-[13px] text-black/40 hover:text-black/70
                     transition-colors text-center"
        >
          다른 기기에서도 수정하고 싶으신가요?
        </button>
      )}

      {(status === 'open' || status === 'submitting' || status === 'error') && (
        <div className="rounded-2xl bg-[#f5f5f5] px-5 py-4 space-y-3">
          <p className="text-[13px] font-bold text-black">비밀번호 설정</p>
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={e => {
              setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
              setErrMsg('')
            }}
            placeholder="숫자 6자리"
            className="w-full px-4 py-3 rounded-xl bg-white text-[15px] tracking-widest
                       border-2 border-transparent focus:border-black/10 focus:outline-none"
          />
          <p className="text-[11px] text-black/30">잊어버리면 복구가 어려워요. 꼭 기억해두세요.</p>
          {errMsg && <p className="text-[12px] text-red-500">{errMsg}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={status === 'submitting'}
            className="w-full py-3 bg-black text-white text-[14px] font-bold
                       rounded-full transition-colors disabled:opacity-40"
          >
            {status === 'submitting' ? '저장 중...' : '비밀번호 저장'}
          </button>
        </div>
      )}
    </div>
  )
}
