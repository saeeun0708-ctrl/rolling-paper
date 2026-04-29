import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import { supabase } from '../../lib/supabase'
import { generateSlug, generateOpenKey } from './utils'

interface FormValues {
  recipientName: string
  hostName: string
  pin: string
}

interface FormErrors {
  recipientName?: string
  hostName?: string
  pin?: string
  submit?: string
}

export function useCreateRoom() {
  const navigate = useNavigate()

  const [values, setValues] = useState<FormValues>({
    recipientName: '',
    hostName: '',
    pin: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  /** 필드 단위 값 변경 */
  function handleChange(field: keyof FormValues, value: string) {
    setValues(prev => ({ ...prev, [field]: value }))
    // 입력 시 해당 필드 에러 초기화
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  /** PIN 입력: 숫자만, 최대 6자리 */
  function handlePinChange(raw: string) {
    handleChange('pin', raw.replace(/\D/g, '').slice(0, 6))
  }

  /** 폼 유효성 검사 */
  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!values.recipientName.trim()) errs.recipientName = '받는 분 이름을 입력해주세요.'
    if (!values.hostName.trim())      errs.hostName      = '주최자 이름을 입력해주세요.'
    if (!/^\d{4,6}$/.test(values.pin)) errs.pin           = '숫자 4~6자리를 입력해주세요.'
    return errs
  }

  /** 제출 핸들러 — PIN 해시 → Supabase INSERT → 공유 페이지로 이동 */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      // PIN bcrypt 해시 (rounds=10)
      const hostPinHash = await bcrypt.hash(values.pin, 10)

      // 추측 불가능한 slug / open_key 생성
      const slug    = generateSlug(10)
      const openKey = generateOpenKey(16)

      // Supabase rooms 테이블에 INSERT
      const { error } = await supabase.from('rooms').insert({
        slug,
        open_key:       openKey,
        recipient_name: values.recipientName.trim(),
        host_name:      values.hostName.trim(),
        host_pin_hash:  hostPinHash,
      })

      if (error) throw error

      // 성공 → 공유 페이지로 이동 (recipient_name을 router state로 전달)
      navigate(`/r/${slug}/share`, {
        state: { recipientName: values.recipientName.trim() },
      })
    } catch (err) {
      console.error('방 생성 오류:', err)
      setErrors({ submit: '방을 만드는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' })
    } finally {
      setIsLoading(false)
    }
  }

  return { values, errors, isLoading, handleChange, handlePinChange, handleSubmit }
}
