import { useRef, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { containsProfanity } from '../../lib/profanity'
import {
  FlowerShape,
  StoredAuthor,
  generateToken,
  randomFlower,
  storeAuthor,
  removeStoredAuthor,
} from './utils'

interface FormValues {
  name: string
  body: string
  shape: FlowerShape | null
}

interface FormErrors {
  name?:   string
  body?:   string
  submit?: string
}

interface SubmitResult {
  messageId:   string
  authorToken: string
  shape:       FlowerShape
}

export function useWriteMessage(roomId: string, slug: string) {
  const [values, setValues]         = useState<FormValues>({ name: '', body: '', shape: null })
  const [errors, setErrors]         = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)

  // H8: 모바일 더블탭 race 방지 — 동기 가드(ref)와 idempotency 키 동시 적용.
  // setState의 isSubmitting은 비동기라 짧은 시간 내 연속 호출을 막지 못한다.
  const submittingRef = useRef(false)
  // 한 번의 폼 제출에 대해 같은 author_token을 재사용해 중복 INSERT를 방지.
  const pendingTokenRef = useRef<string | null>(null)

  function handleChange<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  /** 수정 모드 진입: 기존 데이터로 폼 미리채우기 */
  function prefillForEdit(stored: StoredAuthor) {
    setValues({ name: stored.name, body: stored.body, shape: stored.shape })
    setEditingId(stored.messageId)
    setErrors({})
  }

  /** 폼 리셋 */
  function resetForm() {
    setValues({ name: '', body: '', shape: null })
    setErrors({})
    setEditingId(null)
    // 다음 제출을 위해 idempotency 토큰도 초기화
    pendingTokenRef.current = null
  }

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!values.name.trim())       errs.name = '이름을 입력해주세요.'
    else if (values.name.length > 12) errs.name = '12자 이내로 입력해주세요.'

    if (!values.body.trim())        errs.body = '마음을 담은 메시지를 입력해주세요.'
    else if (values.body.length > 500) errs.body = '500자 이내로 입력해주세요.'
    else if (containsProfanity(values.body)) errs.body = '부적절한 내용이 포함되어 있어요. 다시 작성해주세요.'
    return errs
  }

  /** 제출 (신규 INSERT 또는 수정 UPDATE) */
  async function handleSubmit(existingToken?: string): Promise<SubmitResult | null> {
    // C3: roomId/slug가 비어 있으면 즉시 중단(빈 room_id INSERT 방지)
    if (!roomId || !slug) {
      setErrors({ submit: '잠시 후 다시 시도해주세요. (방 정보 로딩 중)' })
      return null
    }

    // H8: 동기 race 가드 — 같은 tick에 두 번 호출돼도 두 번째 호출은 즉시 차단
    if (submittingRef.current) return null
    submittingRef.current = true

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      submittingRef.current = false
      return null
    }

    setIsSubmitting(true)
    try {
      const finalShape = values.shape ?? randomFlower()
      const trimmedName = values.name.trim()
      const trimmedBody = values.body.trim()

      // ─── 수정 모드 ───────────────────────────────────────────────────────
      if (editingId && existingToken) {
        const { error } = await supabase
          .from('messages')
          .update({ author_name: trimmedName, body: trimmedBody, shape: finalShape })
          .eq('id', editingId)
          .eq('author_token', existingToken)

        if (error) throw error

        // localStorage 캐시 갱신
        storeAuthor(slug, {
          token:     existingToken,
          name:      trimmedName,
          messageId: editingId,
          body:      trimmedBody,
          shape:     finalShape,
        })

        return { messageId: editingId, authorToken: existingToken, shape: finalShape }
      }

      // ─── 신규 INSERT ─────────────────────────────────────────────────────
      // H8: 같은 폼 제출에 대해 author_token을 재사용 → 더블탭 시 두 번째는
      // RLS/unique 제약이 없더라도 같은 토큰이라 클라이언트에서 중복 처리 가능.
      const token = pendingTokenRef.current ?? generateToken()
      pendingTokenRef.current = token

      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id:     roomId,
          author_name: trimmedName,
          author_token: token,
          body:        trimmedBody,
          shape:       finalShape,
        })
        .select('id')
        .single()

      if (error) throw error

      storeAuthor(slug, {
        token,
        name:      trimmedName,
        messageId: data.id,
        body:      trimmedBody,
        shape:     finalShape,
      })

      // 성공했으니 다음 제출을 위해 토큰 비움
      pendingTokenRef.current = null
      return { messageId: data.id, authorToken: token, shape: finalShape }
    } catch (err: unknown) {
      console.error('메시지 저장 오류:', err)
      const msg = err instanceof Error ? err.message
        : (err as { message?: string })?.message ?? ''
      setErrors({ submit: `저장 중 오류가 발생했어요. (${msg || '알 수 없는 오류'})` })
      return null
    } finally {
      setIsSubmitting(false)
      submittingRef.current = false
    }
  }

  /** 삭제 (DB에서 실제 삭제) */
  async function handleDelete(messageId: string, token: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('author_token', token)

      if (error) throw error
      removeStoredAuthor(slug)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message
        : (err as { message?: string })?.message ?? '알 수 없는 오류'
      console.error('삭제 오류:', msg, err)
      return false
    }
  }

  return {
    values,
    errors,
    isSubmitting,
    editingId,
    handleChange,
    prefillForEdit,
    resetForm,
    handleSubmit,
    handleDelete,
  }
}
