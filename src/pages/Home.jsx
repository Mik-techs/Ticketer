import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import HeroBackground from '../components/HeroBackground.jsx'
import SocialLinks from '../components/SocialLinks.jsx'
import { WhatsAppIcon } from '../components/BrandIcons.jsx'
import { Copy, CreditCard, Image as ImageIcon, Flag, Tag, Shirt, ChevronRight, MapPin, Clock, GraduationCap, FileText, Keyboard, Gift } from 'lucide-react'
import { SHOP_WHATSAPP } from '../lib/config.js'

// `job` matches a key in JOB_CATALOG so each row opens the order form
// with that job already chosen.
// A row with no `job` opens the order form so the customer can describe it.
const SERVICES = [
  { job: 'photocopy', title: 'Photocopying & scanning', desc: 'Black & white or color copies, any quantity. Scanning too.', Icon: Copy },
  { job: 'handouts', title: 'Handouts, past questions & assignments', desc: 'Printed neatly and ready for class.', Icon: GraduationCap },
  { job: null, title: 'Typing & project work help', desc: 'Tell us what you need typed or put together.', Icon: Keyboard },
  { job: 'cv', title: 'CV design & passport pictures', desc: 'A clean CV, designed and printed. Passport pictures too.', Icon: FileText },
  { job: 'card', title: 'Business cards & ID cards', desc: 'Business cards, ID cards, invitations.', Icon: CreditCard },
  { job: 'flyers', title: 'Flyers, posters & brochures', desc: 'Designed and printed, ready to hand out.', Icon: ImageIcon },
  { job: 'banner', title: 'Banners', desc: 'Large format, with eyelets, hemmed edges or a pole pocket.', Icon: Flag },
  { job: 'stickers', title: 'Stickers & keychains', desc: 'Wall, pen and label stickers in glossy, matte or waterproof.', Icon: Tag },
  { job: 'tshirt', title: 'T-shirt printing', desc: 'Screen print, DTF or embroidery. Front, back or both.', Icon: Shirt },
  { job: null, title: 'Souvenirs & picture frames', desc: 'Tell us what you have in mind and we\'ll quote it.', Icon: Gift },
]

const STEPS = [
  { title: 'Tell us what you need', desc: 'Pick a job type and answer a few quick questions.' },
  { title: 'Attach your file', desc: 'Upload your design, or bring it in person.' },
  { title: 'Send it on WhatsApp', desc: 'Check your order slip, then send. We confirm the details with you before printing.' },
]

// A sample of the slip customers get at the end of the order form.
function SampleSlip() {
  const rows = [
    ['Job', 'CV design/printing'],
    ['Copies', '10'],
    ['Color', 'Color'],
    ['Paper', 'A4 (normal size)'],
    ['Finishing', 'Plain, no finishing'],
    ['File', 'my-cv.pdf'],
  ]
  return (
    <figure className="anim-slip mx-auto w-full max-w-[340px] -rotate-1 rounded-sm bg-white text-ink shadow-lift">
      <div className="h-1.5 w-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #c9a227 0 10px, transparent 10px 20px)' }} />
      <div className="px-6 pb-2 pt-5">
        <p className="text-[13px] font-bold text-gold-dark">G1 Creative Agency</p>
        <p className="font-display text-2xl font-extrabold leading-tight">Print Order</p>
        <p className="mt-0.5 text-[13px] text-muted">#PR-260928-4821</p>
      </div>
      <dl className="px-6 py-3">
        {rows.map(([k, v]) => (
          <div key={k} className="slip-row flex gap-3 border-t border-dashed border-line py-2 text-sm" style={{ animationDelay: `${0.75 + rows.findIndex((r) => r[0] === k) * 0.11}s` }}>
            <dt className="w-20 shrink-0 text-muted">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <figcaption className="border-t-[1.5px] border-dashed border-line-strong px-6 py-3 text-[13px] text-muted">
        Sample slip. Yours is filled in from your answers.
      </figcaption>
    </figure>
  )
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink">
        <HeroBackground />
        {/* soft shade behind the headline so text stays easy to read over the moving lines */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-5 py-14 sm:py-20 md:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="max-w-xl text-[2.5rem] font-extrabold leading-[1.05] text-white sm:text-5xl">
              Order your printing from your phone.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/80">
              Flyers, cards, banners, stickers, T-shirts and photocopies. Answer a few questions,
              send the order on WhatsApp, and we get to work. No queueing.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/order" className="btn-primary bg-gold text-ink hover:bg-white">
                Start an order
              </Link>
              <Link to="/portfolio" className="btn border-[1.5px] border-white/30 text-white hover:bg-white/10">
                See our work
              </Link>
            </div>
          </div>
          <SampleSlip />
        </div>
      </section>

      {/* Student discount, straight from the shop's flyer */}
      <section className="bg-red">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display text-5xl font-extrabold leading-none text-white">50%</span>
            <p className="text-white">
              <span className="block font-display text-xl font-extrabold leading-tight">Discount for students</span>
              <span className="block text-[15px] text-white/90">Ask us how to claim it.</span>
            </p>
          </div>
          <a
            href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent('Hi, how do I get the student discount?')}`}
            className="btn bg-white text-ink hover:bg-paper"
          >
            <WhatsAppIcon size={18} /> Ask on WhatsApp
          </a>
        </div>
      </section>

      {/* Services: a menu board, each row opens the order form on that job */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h2 className="text-2xl font-extrabold sm:text-3xl">What we print</h2>
        <p className="mt-2 text-base text-muted">Tap a job to start an order for it.</p>

        <ul className="mt-6 border-t-[1.5px] border-dashed border-line-strong">
          {SERVICES.map(({ job, title, desc, Icon }, i) => (
            <Reveal as="li" delay={Math.min(i, 5) * 60} key={title} className="border-b-[1.5px] border-dashed border-line-strong">
              <Link
                to={job ? `/order?job=${job}` : '/order'}
                className="group flex items-center gap-4 py-4 transition-colors hover:bg-white/60 sm:px-2"
              >
                <Icon size={24} strokeWidth={1.6} className="wiggle shrink-0 text-gold-dark" />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-extrabold">{title}</span>
                  <span className="mt-0.5 block text-[15px] leading-snug text-muted">{desc}</span>
                </span>
                <ChevronRight size={20} className="shrink-0 text-line-strong transition-transform group-hover:translate-x-1 group-hover:text-ink" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* How it works: a real sequence, so numbered */}
      <section className="border-y border-line bg-white/60">
        <div className="mx-auto max-w-5xl px-5 py-14">
          <h2 className="text-2xl font-extrabold sm:text-3xl">How ordering works</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal as="li" delay={i * 120} key={s.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-base font-extrabold text-gold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-extrabold leading-snug">{s.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-muted">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Visit / contact */}
      <section className="mx-auto max-w-5xl px-5 py-14">
        <Reveal className="flex flex-col gap-6 rounded-xl border-[1.5px] border-dashed border-line-strong p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-2xl font-extrabold">Come by the shop</h2>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li className="flex gap-2"><MapPin size={18} className="mt-0.5 shrink-0 text-gold-dark" />Behind 3sec Kitchen, UENR, Sunyani</li>
              <li className="flex gap-2"><Clock size={18} className="mt-0.5 shrink-0 text-gold-dark" />Mon–Sat, 9:00 AM – 7:30 PM</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <SocialLinks className="sm:justify-end" />
            <Link to="/order" className="btn-primary">Start an order</Link>
            <a
              href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent('Hi, I have a question about printing.')}`}
              className="btn-ghost"
            >
              <WhatsAppIcon size={18} /> Ask a question
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
