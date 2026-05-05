import { Link } from 'react-router-dom'

const CONTACT = import.meta.env.VITE_CONTACT_EMAIL || 'contact@example.com'

interface Props {
  className?: string
  light?: boolean  // 밝은 배경에서 사용할 때 light=true
}

export default function Footer({ className = '', light = false }: Props) {
  const textColor = light ? 'text-black/30' : 'text-white/40'
  const hoverColor = light ? 'hover:text-black/60' : 'hover:text-white/70'

  return (
    <footer className={`flex items-center justify-center gap-4 py-4 text-[11px] ${textColor} ${className}`}>
      <Link to="/terms"   className={`transition-colors ${hoverColor}`}>이용약관</Link>
      <span className="opacity-40">|</span>
      <Link to="/privacy" className={`transition-colors ${hoverColor}`}>개인정보처리방침</Link>
      <span className="opacity-40">|</span>
      <a href={`mailto:${CONTACT}`} className={`transition-colors ${hoverColor}`}>문의</a>
    </footer>
  )
}
