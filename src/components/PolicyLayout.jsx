import { Link } from 'react-router-dom'

export function PolicyLayout({ title, children }) {
  return (
    <div className="pb-16">
      <header className="bg-ink px-5 py-10 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-extrabold">{title}</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5">
        <div className="prose-policy mt-8 space-y-5 text-base leading-[1.7] text-ink">
          {children}
        </div>

        <Link to="/order" className="btn-primary mt-10">
          Back to order form
        </Link>
      </div>
    </div>
  )
}

export function DraftBanner({ children }) {
  return (
    <div className="rounded-lg border-[1.5px] border-gold bg-gold/10 p-4 text-[15px]">
      {children}
    </div>
  )
}

export function Callout({ children }) {
  return (
    <div className="rounded-md border border-line border-l-4 border-l-gold bg-white p-3.5 text-[15px]">
      {children}
    </div>
  )
}

export function Confirm({ children }) {
  return (
    <span className="rounded bg-gold/25 px-1.5 py-0.5 font-bold text-gold-dark">
      CONFIRM: {children}
    </span>
  )
}

export function H2({ children }) {
  return <h2 className="!mt-8 text-xl font-extrabold text-ink">{children}</h2>
}
