import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { Link } from 'react-router-dom'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SHOP_WHATSAPP } from '../lib/config.js'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'standardPrint', label: 'Print & Copy' },
  { key: 'card', label: 'Cards' },
  { key: 'banner', label: 'Banners' },
  { key: 'stickers', label: 'Stickers' },
  { key: 'apparel', label: 'T-Shirts' },
  { key: 'other', label: 'Other' },
]

// Only http(s) links are ever safe to render as an image src — a row in
// this table can be inserted with arbitrary content, so a non-http(s)
// value must never reach the DOM as-is.
function isSafeUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}

export default function Portfolio() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error | unconfigured
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setStatus('unconfigured')
      return
    }
    fetch(`${SUPABASE_URL}/rest/v1/portfolio_items?select=*&order=display_order.asc,created_at.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('load failed')
        return res.json()
      })
      .then((data) => {
        setItems(data.filter((i) => isSafeUrl(i.image_url)))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filtered = filter === 'all' ? items : items.filter((i) => i.category === filter)

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header>
        <h1 className="text-3xl font-extrabold text-ink">Our work</h1>
        <p className="mt-2 text-base text-muted">Recent jobs we've completed for customers.</p>
      </header>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            aria-pressed={filter === c.key}
            className={[
              'min-h-[44px] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors',
              filter === c.key ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:text-ink',
            ].join(' ')}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {status === 'loading' && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-line/50" />
            ))}
          </div>
        )}

        {status === 'unconfigured' && (
          <EmptyState
            icon="Image"
            title="Photos of our work are coming soon"
            desc="Want to see samples now? Message us on WhatsApp and we'll send some."
            href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent('Hi, can I see some samples of your work?')}`}
            cta="Ask for samples"
          />
        )}

        {status === 'error' && (
          <EmptyState icon="AlertTriangle" title="We couldn't load our work" desc="Check your connection and refresh the page to try again." />
        )}

        {status === 'ready' && filtered.length === 0 && (
          <EmptyState icon="Image" title="Nothing in this category yet" desc="Try another category, or check back soon." />
        )}

        {status === 'ready' && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filtered.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
                <img src={item.image_url} alt={item.title || ''} className="aspect-square w-full object-cover" loading="lazy" decoding="async" />
                {item.title && (
                  <figcaption className="p-3 text-sm font-semibold text-ink">{item.title}</figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl bg-ink px-6 py-8 sm:flex-row sm:items-center sm:px-8">
        <h2 className="text-xl font-extrabold text-white">Like what you see?</h2>
        <Link to="/order" className="btn-primary bg-gold text-ink hover:bg-white">
          Start an order
        </Link>
      </div>
    </div>
  )
}

function EmptyState({ icon, title, desc, href, cta }) {
  const Icon = Icons[icon]
  return (
    <div className="flex flex-col items-center rounded-xl border-[1.5px] border-dashed border-line-strong px-5 py-14 text-center">
      <Icon size={28} className="text-muted" />
      <p className="mt-3 font-display text-lg font-extrabold text-ink">{title}</p>
      <p className="mt-1 max-w-xs text-[15px] text-muted">{desc}</p>
      {href && <a href={href} className="btn-primary mt-5"><WhatsAppIcon size={18} /> {cta}</a>}
    </div>
  )
}
