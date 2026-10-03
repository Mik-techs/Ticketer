import { useEffect, useRef, useState } from 'react'
import * as Icons from 'lucide-react'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/config.js'
import { safeName } from '../lib/orderLogic.js'

const SESSION_KEY = 'g1_dashboard_session'

const PROFILE_ICON = {
  apparel: 'Shirt',
  card: 'CreditCard',
  banner: 'Flag',
  stickers: 'Tag',
  standardPrint: null,
}

function isSafeUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url)
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function Dashboard() {
  const [session, setSession] = useState(() => getStoredSession())
  const [sessionExpired, setSessionExpired] = useState(false)

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return (
      <Centered>
        <Icons.Settings className="mx-auto text-gold-dark" size={30} />

        <p className="mt-3 text-[15px] font-bold text-ink">
          Dashboard isn't connected
        </p>

        <p className="mt-2 text-[15px] text-muted">
          Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment
          to enable staff login.
        </p>
      </Centered>
    )
  }

  if (!session) {
    return (
      <LoginScreen
        sessionExpired={sessionExpired}
        onLoggedIn={(s) => {
          localStorage.setItem(SESSION_KEY, JSON.stringify(s))
          setSession(s)
          setSessionExpired(false)
        }}
      />
    )
  }

  return (
    <DashboardScreen
      session={session}
      onExpire={() => {
        localStorage.removeItem(SESSION_KEY)
        setSession(null)
        setSessionExpired(true)
      }}
      onLogout={() => {
        localStorage.removeItem(SESSION_KEY)
        setSession(null)
        setSessionExpired(false)
      }}
    />
  )
}

function Centered({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-5">
      <div className="anim-in w-full max-w-sm rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        {children}
      </div>
    </div>
  )
}

function LoginScreen({ sessionExpired, onLoggedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    setError('')
    setBusy(true)

    try {
      const trimmedEmail = email.trim()

      const normalizedUrl = SUPABASE_URL.replace(/\/$/, '')
      const authEndpoint = `${normalizedUrl}/auth/v1/token?grant_type=password`

      const res = await fetch(
        authEndpoint,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: trimmedEmail,
            password,
          }),
        }
      )

      const data = await res.json()

      // Handle HTTP status codes
      if (!res.ok) {
        console.error(`Supabase login error (${res.status}):`, data)

        let errorMessage = 'Login failed'

        if (res.status === 400) {
          // Invalid credentials
          errorMessage =
            data.error_description || data.msg || data.message || 'Invalid email or password.'
        } else if (res.status === 401) {
          // API key rejected
          errorMessage =
            'Supabase rejected the API key. Check VITE_SUPABASE_ANON_KEY in Netlify.'
        } else if (res.status === 429) {
          // Rate limited
          errorMessage = 'Too many login attempts. Please wait a while and try again.'
        } else if (res.status === 404) {
          // Path error
          errorMessage =
            'Supabase endpoint not found (404). Check your VITE_SUPABASE_URL format in Netlify.'
        } else {
          // Other errors
          const supabaseMsg =
            data.error_description || data.msg || data.message || data.error
          errorMessage = supabaseMsg
            ? `Error ${res.status}: ${supabaseMsg}`
            : `Error ${res.status}: Login failed`
        }

        throw new Error(errorMessage)
      }

      // Verify tokens exist
      if (!data.access_token || !data.refresh_token) {
        console.error('Unexpected Supabase response:', data)
        throw new Error('Supabase did not return a valid login session.')
      }

      onLoggedIn({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
    } catch (err) {
      console.error('Login error:', err)

      setError(
        err instanceof Error
          ? err.message
          : 'Login failed. Please try again.'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Centered>
      <img
        src="/logo-mark.png"
        alt="G1 Creative Agency"
        width="72"
        height="48"
        className="mx-auto h-12 w-auto"
      />

      <h1 className="mt-4 text-2xl font-extrabold text-ink">
        Staff login
      </h1>

      <p className="mt-1 text-sm text-muted">
        G1 Creative Agency dashboard
      </p>

      {sessionExpired && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-gold/15 px-3 py-2.5 text-sm font-semibold text-gold-dark"
        >
          Your session expired. Please log in again.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red/10 px-3 py-2.5 text-sm font-semibold text-red"
        >
          {error}
        </p>
      )}

      <form onSubmit={submit} className="mt-5 text-left">
        <label
          htmlFor="login-email"
          className="block text-sm font-bold text-ink"
        >
          Email
        </label>

        <input
          id="login-email"
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mb-4 mt-1.5"
        />

        <label
          htmlFor="login-password"
          className="block text-sm font-bold text-ink"
        >
          Password
        </label>

        <div className="relative mb-5 mt-1.5">
          <input
            id="login-password"
            type={showPw ? 'text' : 'password'}
            required
            autoComplete="current-password"
            value={password}
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
          type="submit"
          disabled={busy}
          className="btn-primary w-full rounded-lg"
        >
          {busy ? (
            <span className="print-loader" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : null}

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

  const [openCode, setOpenCode] = useState(
    () => new URLSearchParams(window.location.search).get('order')
  )

  const [highlightCode, setHighlightCode] = useState(null)

  const showToast = (message, isError) => {
    setToast({ message, isError })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchOrders = async () => {
    let res

    try {
      res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!res.ok) {
        const data = await res.json()
        console.error(`Supabase fetch error (${res.status}):`, data)

        if (res.status === 401) {
          showToast('Your session has expired. Please log in again.', true)
          onExpire()
        }

        return
      }

      const data = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      setUpdatedAt(new Date().toISOString())
    } catch (err) {
      console.error('Fetch orders error:', err)
      showToast('Could not load orders. Please try again.', true)
    }
  }

  useEffect(() => {
    fetchOrders()

    const intervalId = setInterval(fetchOrders, 5000)

    pollRef.current = intervalId

    return () => clearInterval(intervalId)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (openCode && orders.length > 0) {
      const order = orders.find((o) => o.id === openCode)

      if (order) {
        const element = document.querySelector(`[data-order-id="${openCode}"]`)

        setTimeout(
          () =>
            element?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
        , 100)
      } else {
        showToast(
          `Order #${openCode} isn't here yet. It may still be arriving.`,
          true
        )
      }

      setOpenCode(null)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedAt])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!res.ok) {
        showToast(
          "Couldn't update that order — please try again.",
          true
        )

        if (res.status === 401) onExpire()

        return
      }

      showToast(`Order status updated to "${status}".`)
      await fetchOrders()
    } catch (err) {
      console.error('Update status error:', err)
      showToast('Could not update status. Please try again.', true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper to-[#ebe5db] pb-16">
      <div className="border-b border-line bg-white px-5 py-3.5 sm:px-8 sm:py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-mark.png"
              alt="G1 Creative Agency"
              width="48"
              height="32"
              className="h-8 w-auto"
            />

            <div className="hidden sm:block">
              <h2 className="text-sm font-extrabold text-ink">
                Orders dashboard
              </h2>

              <p className="text-[11px] text-muted">
                Updated {updatedAt ? formatTime(updatedAt) : 'loading…'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 text-sm font-bold text-muted hover:text-ink"
            title="Log out"
          >
            <Icons.LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-5 px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 text-sm font-bold rounded-full transition ${
                filter === f.key
                  ? 'bg-ink text-gold'
                  : 'bg-white border border-line text-ink hover:border-ink'
              }`}
            >
              {f.label}

              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/30 text-xs font-semibold">
                {filter === f.key
                  ? orders.length
                  : f.key === 'all'
                    ? orders.length
                    : orders.filter((o) => o.status === f.key).length}
              </span>
            </button>
          ))}
        </div>

        {tab === 'orders'? (
          <OrdersTab
            orders={
              filter === 'all'
                ? orders
                : orders.filter((o) => o.status === filter)
            }
            counts={orders.reduce(
              (c, o) => ({
                ...c,
                [o.status]: (c[o.status] || 0) + 1,
              }),
              { all: orders.length }
            )}
            updatedAt={updatedAt}
            onUpdateStatus={updateStatus}
            session={session}
            highlightCode={highlightCode}
            onFileError={() =>
              showToast(
                "Couldn't open that file. Please try again.",
                true
              )
            }
          />
        ) : (
          <PortfolioTab
            session={session}
            showToast={showToast}
          />
        )}
      </div>

      {toast && (
        <div
          role="status"
          className={`anim-toast fixed bottom-6 left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lift ${
            toast.isError ? 'bg-red' : 'bg-ink'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'pending', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
]

function OrdersTab({ orders, counts, updatedAt, onUpdateStatus, session, highlightCode, onFileError }) {
  if (orders.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-line bg-white p-5 text-center">
        <p className="text-sm text-muted">No orders yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onUpdateStatus={onUpdateStatus}
          session={session}
          onFileError={onFileError}
        />
      ))}
    </div>
  )
}

function OrderCard({ order, onUpdateStatus, session, onFileError }) {
  const [updating, setUpdating] = useState(false)

  const toggleStatus = async () => {
    setUpdating(true)

    const newStatus = order.status === 'completed' ? 'pending' : 'completed'

    await onUpdateStatus(order.id, newStatus)

    setUpdating(false)
  }

  const displayFiles = order.file_url
    ? [{ stored: order.file_url, name: order.file_name || 'Uploaded file' }]
    : []

  return (
    <div
      data-order-id={order.id}
      className="rounded-lg border border-line bg-white p-5 shadow-sm hover:shadow-md transition"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-muted mb-1">
            Order #{order.id.slice(0, 8)}
          </div>

          <h3 className="text-lg font-bold text-ink">
            {order.item || 'Untitled order'}
          </h3>

          <div className="mt-2 space-y-1 text-sm text-muted">
            <p>
              <span className="font-semibold text-ink">{order.copies || 1}</span> copies
              {order.color && ` · ${order.color}`}
              {order.paper && ` · ${order.paper}`}
              {order.finishing && ` · ${order.finishing}`}
            </p>

            {order.name && (
              <p>
                Ordered by <span className="font-semibold text-ink">{order.name}</span>
              </p>
            )}

            <p className="pt-1">
              {formatTime(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${
              order.status === 'completed'
                ? 'bg-green/15 text-green-dark'
                : 'bg-gold/15 text-gold-dark'
            }`}
          >
            {order.status === 'completed' ? 'Completed' : 'Pending'}
          </span>

          <button
            onClick={toggleStatus}
            disabled={updating}
            className="px-2 py-1 text-xs font-bold text-blue hover:text-blue-dark disabled:opacity-50"
          >
            {order.status === 'completed' ? 'Mark pending' : 'Mark complete'}
          </button>
        </div>
      </div>

      {displayFiles.length > 0 && (
        <div className="border-t border-line pt-3 mt-3">
          <div className="text-xs font-bold text-muted mb-2">Files:</div>

          <div className="space-y-2">
            {displayFiles.map((file, idx) => (
              <StoredFileLink
                key={idx}
                stored={file.stored}
                session={session}
                label={file.name}
                Icon={Icons.FileText}
                onError={onFileError}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StoredFileLink({
  stored,
  session,
  label,
  Icon,
  onError,
}) {
  const [busy, setBusy] = useState(false)

  const open = async () => {
    const tab = window.open('', '_blank')
    setBusy(true)

    try {
      const path = stored
        .slice(3)
        .split('/')
        .map(encodeURIComponent)
        .join('/')

      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/sign/order-files/${path}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ expiresIn: 300 }),
        }
      )

      if (!res.ok) throw new Error()

      const { signedURL } = await res.json()
      const url = `${SUPABASE_URL}/storage/v1${signedURL}`

      if (tab) tab.location.href = url
      else window.location.href = url
    } catch {
      onError?.()
      setBusy(false)
    }
  }

  return (
    <button
      onClick={open}
      disabled={busy}
      className="flex items-center gap-2 text-sm font-semibold text-blue hover:text-blue-dark disabled:opacity-50"
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  )
}

function PortfolioTab({ session, showToast }) {
  const [portfolio, setPortfolio] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/portfolio?select=*&order=created_at.desc`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        )

        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        setPortfolio(Array.isArray(data) ? data : [])
      } catch {
        showToast("Couldn't load portfolio. Please refresh.", true)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <span className="print-loader">
          <i />
          <i />
          <i />
        </span>
      </div>
    )
  }

  if (portfolio.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-line bg-white p-5 text-center">
        <p className="text-sm text-muted">No portfolio items yet.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {portfolio.map((item) => (
        <div
          key={item.id}
          className="group rounded-lg border border-line bg-white overflow-hidden hover:shadow-md transition"
        >
          {item.image_url && (
            <div className="aspect-square overflow-hidden bg-paper">
              <img
                src={item.image_url}
                alt={item.title || 'Portfolio item'}
                className="h-full w-full object-cover group-hover:scale-105 transition"
              />
            </div>
          )}

          <div className="p-4">
            <h4 className="font-bold text-ink mb-1">{item.title || 'Untitled'}</h4>

            {item.description && (
              <p className="text-sm text-muted line-clamp-2">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
