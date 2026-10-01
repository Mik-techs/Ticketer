import { Facebook, Instagram } from 'lucide-react'
import { WhatsAppIcon, XIcon } from './BrandIcons.jsx'
import { SHOP_WHATSAPP, INSTAGRAM_URL, X_URL, FACEBOOK_URL } from '../lib/config.js'

// Round brand-coloured buttons. 44px tap targets, each with a text label for
// screen readers (the icon alone isn't announced).
const LINKS = [
  { label: 'WhatsApp', href: `https://wa.me/${SHOP_WHATSAPP}`, bg: '#25D366', Icon: WhatsAppIcon },
  { label: 'Facebook', href: FACEBOOK_URL, bg: '#1877F2', Icon: (p) => <Facebook {...p} fill="currentColor" strokeWidth={0} /> },
  { label: 'Instagram', href: INSTAGRAM_URL, bg: 'linear-gradient(45deg,#f9a03f,#dd2a7b 55%,#8134af)', Icon: Instagram },
  { label: 'X (Twitter)', href: X_URL, bg: '#000000', Icon: XIcon },
]

export default function SocialLinks({ className = '' }) {
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {LINKS.map(({ label, href, bg, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            title={label}
            style={{ background: bg }}
            className="social-btn flex h-11 w-11 items-center justify-center rounded-full text-white shadow-card transition-transform hover:-translate-y-0.5"
          >
            <Icon size={20} />
          </a>
        </li>
      ))}
    </ul>
  )
}
