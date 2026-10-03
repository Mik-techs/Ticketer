
import { useEffect, useRef, useState } from 'react'
import * as Icons from 'lucide-react'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config.js'
import { safeName } from '../lib/orderLogic.js'

const SESSION_KEY = 'g1_dashboard_session'

const PROFILE_ICON = {
  apparel: 'Shirt', card: 'CreditCard', banner: 'Flag', stickers: 'Tag', standardPrint: null,
}

function isSafeUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}
function formatTime(iso) {
  try { return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) }
  catch { return iso }
}
function getStoredSession() {
  try { const raw = localStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null }
  catch { return null }
}

export default function Dashboard() {
  const [session, setSession] = useState(() => getStoredSession())
  const [sessionExpired, setSessionExpired] = useState(false)

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <Centered>
        <Icons.Settings className="mx-auto text-gold-dark" size={30} />
        <p className="mt-3 text-[15px] font-bold text-ink">Dashboard isn't connected</p>
        <p className="mt-2 text-[15px] text-muted">
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment to enable staff login.
        </p>
      </Centered>
    )
  }

  if (!session) {
    return (
      <LoginScreen
        sessionExpired={sessionExpired}
        onLoggedIn={(s) => { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); setSession(s); setSessionExpired(false) }}
      />
    )
  }

  return (
    <DashboardScreen
      session={session}
      onExpire={() => { localStorage.removeItem(SESSION_KEY); setSession(null); setSessionExpired(true) }}
      onLogout={() => { localStorage.removeItem(SESSION_KEY); setSession(null); setSessionExpired(false) }}
    />
  )
}

function Centered({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-5">
      <div className="anim-in w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-card">{children}</div>
    </div>
  )
}

function LoginScreen({ sessionExpired, onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(false)
    setBusy(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) throw new Error('login failed')
      const data = await res.json()
      onLoggedIn({ access_token: data.access_token, refresh_token: data.refresh_token })
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Centered>
      <img src="/logo-mark.png" alt="G1 Creative Agency" width="72" height="48" className="mx-auto h-12 w-auto" />
      <h1 className="mt-4 text-2xl font-extrabold text-ink">Staff login</h1>
      <p className="mt-1 text-sm text-muted">G1 Creative Agency dashboard</p>

      {sessionExpired && (
        <p role="status" className="mt-4 rounded-lg bg-gold/15 px-3 py-2.5 text-sm font-semibold text-gold-dark">
          Your session expired. Please log in again.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red/10 px-3 py-2.5 text-sm font-semibold text-red">
          That email or password isn't right. Please try again.
        </p>
      )}

      <form onSubmit={submit} className="mt-5 text-left">
        <label htmlFor="login-email" className="block text-sm font-bold text-ink">Email</label>
        <input
          id="login-email" type="email" required autoFocus autoComplete="username" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mb-4 mt-1.5"
        />
        <label htmlFor="login-password" className="block text-sm font-bold text-ink">Password</label>
        <div className="relative mb-5 mt-1.5">
          <input
            id="login-password" type={showPw ? 'text' : 'password'} required autoComplete="current-password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-pressed={showPw}
            className="absolute right-1 top-1/2 min-h-[44px] -translate-y-1/2 rounded-md px-3 text-sm font-bold text-gold-dark hover:text-ink"
          >
            {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        <button
          type="submit" disabled={busy}
          className="btn-primary w-full rounded-lg"
        >
          {busy ? <span className="print-loader" aria-hidden="true"><i /><i /><i /></span> : null}
          {busy ? 'Logging in' : 'Log in'}
        </button>
      </form>
    </Centered>
  )
}

function DashboardScreen({ session, onExpire, onLogout }) {
  const [tab, setTab] = useState('orders')
  const [filter, setFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [toast, setToast] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const pollRef = useRef(null)
  // Set when staff arrive from the link in a customer's WhatsApp message (/dashboard?order=CODE)
  const [openCode, setOpenCode] = useState(() => new URLSearchParams(window.location.search).get('order'))
  const [highlightCode, setHighlightCode] = useState(null)

  const showToast = (message, isError) => {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchOrders = async () => {
    let res
    try {
      res = await fetch(`${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
      })
    } catch {
      showToast("Can't refresh orders — check your connection.", true)
      return
    }
    if (res.status === 401) { onExpire(); return }
    if (!res.ok) { showToast("Couldn't refresh orders — please try again.", true); return }
    setOrders(await res.json())
    setUpdatedAt(new Date())
  }

  useEffect(() => {
    fetchOrders()
    pollRef.current = setInterval(fetchOrders, 15000)
    return () => clearInterval(pollRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Once the first load finishes, jump to the order named in the link.
  useEffect(() => {
    if (!openCode || !updatedAt) return
    if (orders.some((o) => o.order_code === openCode)) {
      setTab('orders')
      setFilter('all')
      setHighlightCode(openCode)
      setTimeout(() => {
        document.getElementById(`order-${openCode}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } else {
      showToast(`Order #${openCode} isn't here yet. It may still be arriving.`, true)
    }
    setOpenCode(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) showToast("Couldn't update that order — please try again.", true)
    } catch {
      showToast("Couldn't update that order — check your connection.", true)
    }
    fetchOrders()
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <div className="min-h-screen bg-paper">
      <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
        <div>
          <div className="text-[13px] font-semibold text-gold-dark">G1 Creative Agency</div>
          <h1 className="text-xl font-extrabold text-ink">{tab === 'orders' ? 'Orders' : 'Portfolio'}</h1>
        </div>
        <button onClick={onLogout} className="btn-ghost min-h-[44px] px-4 text-sm">
          Log out
        </button>
      </div>

      <div className="flex gap-1 border-b border-line bg-white px-5 pt-1">
        {[{ key: 'orders', label: 'Orders' }, { key: 'portfolio', label: 'Portfolio' }].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={[
              'min-h-[44px] rounded-t-lg px-4 text-[15px] font-bold',
              tab === t.key ? 'border-b-2 border-gold-dark text-ink' : 'text-muted hover:text-ink',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-3xl px-5 py-6">
        {tab === 'orders' ? (
          <OrdersTab filter={filter} setFilter={setFilter} orders={filtered} counts={orders.reduce((c, o) => ({ ...c, [o.status]: (c[o.status] || 0) + 1 }), { all: orders.length })} updatedAt={updatedAt} onUpdateStatus={updateStatus} session={session} highlightCode={highlightCode} onFileError={() => showToast("Couldn't open that file. Please try again.", true)} />
        ) : (
          <PortfolioTab session={session} showToast={showToast} />
        )}
      </div>

      {toast && (
        <div role="status" className={`anim-toast fixed bottom-6 left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lift ${toast.isError ? 'bg-red' : 'bg-ink'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done', label: 'Done' },
]

function OrdersTab({ filter, setFilter, orders, counts, updatedAt, onUpdateStatus, session, onFileError, highlightCode }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            aria-pressed={filter === f.key}
            className={[
              'min-h-[44px] rounded-full px-4 text-sm font-semibold',
              filter === f.key ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:text-ink',
            ].join(' ')}
          >
            {f.label} <span className={filter === f.key ? 'text-white/70' : 'text-muted'}>{counts[f.key] || 0}</span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-[13px] text-muted">
        {updatedAt ? `Updated ${updatedAt.toLocaleTimeString(undefined, { timeStyle: 'short' })}. ` : ''}New orders appear here automatically.
      </p>

      <div className="mt-4 space-y-3">
        {orders.length === 0 && (
          <div className="rounded-xl border-[1.5px] border-dashed border-line-strong py-12 text-center text-[15px] text-muted">
            {filter === 'all' ? 'No orders yet. New ones show up here as soon as they come in.' : `No ${filter.replace('_', ' ')} orders right now.`}
          </div>
        )}

        {orders.map((o) => (
          <OrderCard key={o.id} order={o} onUpdateStatus={onUpdateStatus} session={session} onFileError={onFileError} highlighted={o.order_code === highlightCode} />
        ))}
      </div>
    </div>
  )
}

// Files that customers upload are private. The order stores "sb:<path>"; this
// asks Supabase for a link that works for 5 minutes and opens it.
const isStored = (v) => typeof v === 'string' && v.startsWith('sb:')

function StoredFileLink({ stored, session, label, Icon, onError }) {
  const [busy, setBusy] = useState(false)

  const open = async () => {
    const tab = window.open('', '_blank') // opened first so phones don't block it
    setBusy(true)
    try {
      const path = stored.slice(3).split('/').map(encodeURIComponent).join('/')
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/order-files/${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ expiresIn: 300 }),
      })
      if (!res.ok) throw new Error()
      const { signedURL } = await res.json()
      const url = `${SUPABASE_URL}/storage/v1${signedURL}`
      if (tab) tab.location.href = url
      else window.location.href = url
    } catch {
      if (tab) tab.close()
      onError()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button type="button" onClick={open} disabled={busy} className="inline-flex min-h-[44px] items-center gap-1.5 underline disabled:opacity-60">
      <Icon size={16} /> {busy ? 'Opening...' : label}
    </button>
  )
}

function OrderCard({ order: o, onUpdateStatus, session, onFileError, highlighted }) {
  const profile = o.profile || (o.job_category === 'apparel' ? 'apparel' : 'standardPrint')
  const Icon = PROFILE_ICON[profile] ? Icons[PROFILE_ICON[profile]] : null

  const details = [['Copies', o.copies]]
  if (!o.bring_own) {
    if (profile === 'apparel') {
      if (o.shirt_color) details.push(['Shirt Color', o.shirt_color])
      if (o.shirt_size) details.push(['Size', o.shirt_size])
      if (o.print_placement) details.push(['Placement', o.print_placement])
    } else if (profile === 'card') {
      if (o.color) details.push(['Color', o.color])
      if (o.card_finish) details.push(['Card Finish', o.card_finish])
    } else if (profile === 'banner') {
      if (o.color) details.push(['Color', o.color])
      if (o.banner_finish) details.push(['Banner Finish', o.banner_finish])
    } else if (profile === 'stickers') {
      if (o.color) details.push(['Color', o.color])
      if (o.sticker_finish) details.push(['Sticker Finish', o.sticker_finish])
    } else {
      if (o.color) details.push(['Color', o.color])
      if (o.paper_size) details.push(['Paper', o.paper_size])
      if (o.finishing) details.push(['Finishing', o.finishing])
    }
  }
  details.push(['Customer', o.customer_name])
  details.push(['File', o.bring_own ? 'Bringing in person' : o.file_name || '—'])

  const nextAction = {
    new: { label: 'Start order', status: 'in_progress', primary: true },
    in_progress: { label: 'Mark done', status: 'done', primary: true },
    done: { label: 'Reopen', status: 'new', primary: false },
  }[o.status]

  const statusColor = { new: 'bg-gold/20 text-gold-dark', in_progress: 'bg-ink/10 text-ink', done: 'bg-green/15 text-green' }[o.status] || 'bg-line'

  return (
    <div
      id={`order-${o.order_code}`}
      className={['anim-in scroll-mt-24 rounded-xl border bg-white p-4', o.status === 'new' ? 'border-gold-dark border-l-4' : 'border-line', highlighted ? 'ring-2 ring-gold-dark ring-offset-2 ring-offset-paper' : ''].join(' ')}
    >
      {highlighted && <p className="mb-2 text-[13px] font-bold text-gold-dark">Opened from the WhatsApp message</p>}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] text-muted">#{o.order_code}, {formatTime(o.created_at)}</div>
          <p className="mt-0.5 flex items-center gap-1.5 text-base font-bold text-ink">
            {Icon && <Icon size={16} className="text-muted" />}
            {o.job}
          </p>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold ${statusColor}`}>
          {o.status === 'new' && <span className="live-dot" aria-hidden="true" />}
          {o.status.replace('_', ' ')}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {details.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[13px] text-muted">{label}</dt>
            <dd className="break-words font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {(isSafeUrl(o.ticket_link) || isSafeUrl(o.file_link) || isStored(o.ticket_link) || isStored(o.file_link)) && (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-gold-dark">
          {isSafeUrl(o.ticket_link) && <a href={o.ticket_link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 underline"><Icons.Receipt size={16} /> View ticket</a>}
          {isSafeUrl(o.file_link) && <a href={o.file_link} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-1.5 underline"><Icons.Paperclip size={16} /> Download file</a>}
          {isStored(o.ticket_link) && <StoredFileLink stored={o.ticket_link} session={session} label="View ticket" Icon={Icons.Receipt} onError={onFileError} />}
          {isStored(o.file_link) && <StoredFileLink stored={o.file_link} session={session} label="Download file" Icon={Icons.Paperclip} onError={onFileError} />}
        </div>
      )}

      {nextAction && (
        <button
          onClick={() => onUpdateStatus(o.id, nextAction.status)}
          className={[
            'mt-3 min-h-[44px] rounded-full px-5 text-sm font-bold',
            nextAction.primary ? 'bg-gold-dark text-white hover:bg-ink' : 'border-[1.5px] border-line-strong text-ink hover:bg-ink/5',
          ].join(' ')}
        >
          {nextAction.label}
        </button>
      )}
    </div>
  )
}

function PortfolioTab({ session, showToast }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('standardPrint')
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [items, setItems] = useState([])
  const [loaded, setLoaded] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_items?select=*&order=display_order.asc,created_at.desc`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error()
      setItems((await res.json()).filter((i) => isSafeUrl(i.image_url)))
    } catch {
      setItems([])
    } finally {
      setLoaded(true)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Portfolio photos go in the public "portfolio" bucket in Supabase.
  const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/portfolio/`
  const uploadImage = (f) =>
    new Promise((resolve, reject) => {
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`
      const path = `${id}-${safeName(f.name)}`
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/portfolio/${path}`)
      xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY)
      xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`)
      xhr.setRequestHeader('x-upsert', 'false')
      xhr.setRequestHeader('Content-Type', f.type || 'application/octet-stream')
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      })
      xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(PUBLIC_PREFIX + path) : reject(new Error()))
      xhr.onerror = () => reject(new Error())
      xhr.send(f)
    })

  const submit = async () => {
    setError('')
    if (!file) { setError('Please choose a photo first.'); return }
    setSubmitting(true)
    setProgress(0)
    try {
      const imageUrl = await uploadImage(file)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${session.access_token}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ title, category, image_url: imageUrl }),
      })
      if (!res.ok) throw new Error()
      setTitle('')
      setFile(null)
      load()
    } catch {
      setError('Something went wrong — please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const remove = async (id) => {
    // Also remove the photo itself if it lives in our bucket (best effort).
    const item = items.find((x) => x.id === id)
    if (item && item.image_url && item.image_url.startsWith(PUBLIC_PREFIX)) {
      fetch(`${SUPABASE_URL}/storage/v1/object/portfolio/${item.image_url.slice(PUBLIC_PREFIX.length)}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}` },
      }).catch(() => {})
    }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/portfolio_items?id=eq.${id}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, Prefer: 'return=minimal' },
      })
      if (!res.ok) showToast("Couldn't delete that item — please try again.", true)
    } catch {
      showToast("Couldn't delete that item — check your connection.", true)
    }
    load()
  }

  return (
    <div>
      <div className="rounded-xl border border-line bg-white p-5 shadow-card">
        <p className="text-base font-bold text-ink">Add a sample to the public portfolio</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Only upload photos of your own completed work — not designs, logos, or images that belong to someone else. This goes on the public site.
        </p>

        <label className="mt-4 block text-sm font-bold text-ink">Title</label>
        <input
          value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Wedding invitation cards"
          className="mt-1.5 w-full field"
        />

        <label className="mt-3 block text-sm font-bold text-ink">Category</label>
        <select
          value={category} onChange={(e) => setCategory(e.target.value)}
          className="mt-1.5 w-full field"
        >
          <option value="standardPrint">Print &amp; Copy</option>
          <option value="card">Cards</option>
          <option value="banner">Banners</option>
          <option value="stickers">Stickers</option>
          <option value="apparel">T-Shirts</option>
          <option value="other">Other</option>
        </select>

        <label className="mt-3 block text-sm font-bold text-ink">Photo</label>
        <input
          type="file" accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="mt-1.5 w-full text-[13px]"
        />

        {submitting && (
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full bg-gold-dark transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
        {error && <p className="mt-2 text-sm font-semibold text-red">{error}</p>}

        <button
          onClick={submit} disabled={submitting}
          className="mt-4 w-full btn-primary w-full rounded-lg"
        >
          {submitting ? 'Uploading…' : 'Add to Portfolio'}
        </button>
      </div>

      <p className="mt-6 text-[13px] font-bold text-ink">Current portfolio ({items.length} items)</p>
      {!loaded ? (
        <p className="mt-2 text-[13px] text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="mt-2 text-[13px] text-muted">No portfolio items yet — add your first one above.</p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border border-line bg-white">
              <img src={item.image_url} alt={item.title || ''} className="aspect-square w-full object-cover" />
              <div className="p-2.5">
                <p className="truncate text-sm font-semibold text-ink">{item.title || '(untitled)'}</p>
                <button onClick={() => remove(item.id)} className="mt-1 flex items-center gap-1 text-[13px] font-bold text-red">
                  <Icons.Trash2 size={11} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
