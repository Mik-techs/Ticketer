import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-28 text-center">
      <span className="font-display text-6xl font-extrabold text-gold-dark">404</span>
      <h1 className="mt-3 text-2xl font-extrabold text-ink">We can't find that page</h1>
      <p className="mt-2 text-base leading-relaxed text-muted">
        The link may be out of date or mistyped.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link to="/order" className="btn-primary">Start an order</Link>
        <Link to="/" className="btn-ghost">Go to home</Link>
      </div>
    </div>
  )
}
