import { Link } from 'react-router-dom'
import { MapPin, Clock, Phone, Mail } from 'lucide-react'
import { SHOP_WHATSAPP } from '../lib/config.js'
import { WhatsAppIcon } from './BrandIcons.jsx'
import SocialLinks from './SocialLinks.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white/60">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <img
              src="./logo-mark.png"
              alt="G1 Creative Agency"
              width="72"
              height="48"
              loading="lazy"
              className="h-12 w-auto"
            />
            <div className="mt-2 font-display text-base font-extrabold text-ink">
              G1 Creative Agency
            </div>

            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
              <li className="flex gap-2">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-dark" />
                Behind 3sec Kitchen, UENR, Sunyani
              </li>
              <li className="flex gap-2">
                <Clock size={16} className="mt-0.5 shrink-0 text-gold-dark" />
                Mon–Sat, 9:00 AM – 7:30 PM
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-sm font-extrabold text-ink">
              Contact
            </h2>

            <ul className="mt-3 space-y-2 text-sm text-ink">
              <li>
                <a
                  href="tel:+233534068414"
                  className="flex gap-2 hover:text-gold-dark"
                >
                  <Phone
                    size={16}
                    className="mt-0.5 shrink-0 text-gold-dark"
                  />
                  Call: +233 53 406 8414
                </a>
              </li>

              <li>
                <a
                  href={`https://wa.me/${SHOP_WHATSAPP}`}
                  className="flex gap-2 hover:text-gold-dark"
                >
                  <WhatsAppIcon
                    size={16}
                    className="mt-0.5 shrink-0 text-gold-dark"
                  />
                  WhatsApp &amp; payments: +233 54 685 0197
                </a>
              </li>

              <li>
                <a
                  href="mailto:g1creative97@gmail.com"
                  className="flex gap-2 break-all hover:text-gold-dark"
                >
                  <Mail
                    size={16}
                    className="mt-0.5 shrink-0 text-gold-dark"
                  />
                  g1creative97@gmail.com
                </a>
              </li>
            </ul>

            <p className="mt-5 text-sm font-bold text-ink">Follow us</p>
            <SocialLinks className="mt-2" />

            
          </div>

          <div>
            <h2 className="font-display text-sm font-extrabold text-ink">
              Pages
            </h2>

            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  to="/order"
                  className="inline-block py-1 font-semibold text-ink hover:text-gold-dark"
                >
                  Start an order
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
