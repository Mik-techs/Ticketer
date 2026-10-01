import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Our work' },
]

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors',
    isActive ? 'bg-ink/5 text-ink' : 'text-muted hover:text-ink',
  ].join(' ')

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-2.5">
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <img src="./logo-mark.png" alt="" width="48" height="32" className="logo-mark h-8 w-auto" />
          <span className="font-display text-base font-extrabold text-ink">G1 Creative Agency</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/order" className="btn-primary ml-2 min-h-[42px] px-5">
            Order now
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link to="/order" className="btn-primary min-h-[42px] px-4 text-sm">
            Order now
          </Link>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-md border border-line"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Main" className="anim-drop flex flex-col gap-1 border-t border-line px-5 py-3 sm:hidden">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  )
}
