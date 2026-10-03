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

// Only http(s) links are ever safe to render as an image src.
function isSafeUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}

export default function Portfolio() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [filter, setFilter] = useState('all')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setStatus('unconfigured')
      return
    }

    fetch(
      `${SUPABASE_URL}/rest/v1/portfolio_items?select=*&order=display_order.asc,created_at.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    )
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

  const filtered =
    filter === 'all'
      ? items
      : items.filter((i) => i.category === filter)

  // Close the viewer with Escape and prevent background scrolling.
  useEffect(() => {
    if (!selectedImage) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImage(null)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [selectedImage])

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <header>
        <h1 className="text-3xl font-extrabold text-ink">Our work</h1>

        <p className="mt-2 text-base text-muted">
          Recent jobs we've completed for customers.
        </p>
      </header>

      <div
        className="mt-6 flex gap-2 overflow-x-auto pb-2"
        role="group"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            aria-pressed={filter === c.key}
            className={[
              'min-h-[44px] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors',
              filter === c.key
                ? 'bg-ink text-white'
                : 'border border-line bg-white text-muted hover:text-ink',
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
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-line/50"
              />
            ))}
          </div>
        )}

        {status === 'unconfigured' && (
          <EmptyState
            icon="Image"
            title="Photos of our work are coming soon"
            desc="Want to see samples now? Message us on WhatsApp and we'll send some."
            href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(
              'Hi, can I see some samples of your work?'
            )}`}
            cta="Ask for samples"
          />
        )}

        {status === 'error' && (
          <EmptyState
            icon="AlertTriangle"
            title="We couldn't load our work"
            desc="Check your connection and refresh the page to try again."
          />
        )}

        {status === 'ready' && filtered.length === 0 && (
          <EmptyState
            icon="Image"
            title="Nothing in this category yet"
            desc="Try another category, or check back soon."
          />
        )}

        {status === 'ready' && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {filtered.map((item) => (
              <figure
                key={item.id}
                className="overflow-hidden rounded-lg border border-line bg-white"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelectedImage({
                      url: item.image_url,
                      title: item.title || '',
                    })
                  }
                  className="block w-full cursor-zoom-in text-left"
                  aria-label={`View ${
                    item.title || 'portfolio image'
                  } full screen`}
                >
                  <img
                    src={item.image_url}
                    alt={item.title || ''}
                    className="aspect-square w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                  />
                </button>

                {item.title && (
                  <figcaption className="p-3 text-sm font-semibold text-ink">
                    {item.title}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-xl bg-ink px-6 py-8 sm:flex-row sm:items-center sm:px-8">
        <h2 className="text-xl font-extrabold text-white">
          Like what you see?
        </h2>

        <Link
          to="/order"
          className="btn-primary bg-gold text-ink hover:bg-white"
        >
          Start an order
        </Link>
      </div>

      {/* Full-screen image viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Full-screen portfolio image"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            aria-label="Close full-screen image"
            className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <Icons.X size={28} />
          </button>

          {/* Image */}
          <div
            className="flex h-full w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.title || 'Portfolio image'}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {/* Optional title */}
          {selectedImage.title && (
            <div className="absolute bottom-4 left-1/2 max-w-[90%] -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-center text-sm font-semibold text-white backdrop-blur-sm">
              {selectedImage.title}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EmptyState({ icon, title, desc, href, cta }) {
  const Icon = Icons[icon]

  return (
    <div className="flex flex-col items-center rounded-xl border-[1.5px] border-dashed border-line-strong px-5 py-14 text-center">
      <Icon size={28} className="text-muted" />

      <p className="mt-3 font-display text-lg font-extrabold text-ink">
        {title}
      </p>

      <p className="mt-1 max-w-xs text-[15px] text-muted">
        {desc}
      </p>

      {href && (
        <a href={href} className="btn-primary mt-5">
          <WhatsAppIcon size={18} />
          {cta}
        </a>
      )}
    </div>
  )
            }
