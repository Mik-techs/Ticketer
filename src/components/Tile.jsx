import * as Icons from 'lucide-react'

export default function Tile({ icon, letter, label, sublabel, selected, onClick }) {
  // Fall back to a plain icon if a name isn't in the installed lucide version
  const LucideIcon = icon ? Icons[icon] || Icons.FileText : null
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={[
        selected ? 'anim-stamp' : '',
        'flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 p-3.5 text-center transition-colors',
        selected
          ? 'border-gold-dark bg-gold/15 text-ink'
          : 'border-line bg-white text-ink hover:border-line-strong',
      ].join(' ')}
    >
      {letter ? (
        <span className="font-display text-lg font-extrabold text-gold-dark">{letter}</span>
      ) : LucideIcon ? (
        <LucideIcon size={24} className={selected ? 'text-gold-dark' : 'text-muted'} strokeWidth={1.7} />
      ) : null}
      <span className="text-sm font-semibold leading-tight">{label}</span>
      {sublabel && <span className="text-[13px] text-muted">{sublabel}</span>}
    </button>
  )
}
