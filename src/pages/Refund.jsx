import { Link } from 'react-router-dom'
import { PolicyLayout, DraftBanner, Confirm, H2 } from '../components/PolicyLayout.jsx'

export default function Refund() {
  return (
    <PolicyLayout title="Refund Policy">
      <DraftBanner>
        <b>This is a starting draft, not your finalized policy.</b> Custom/personalized print work is commonly
        non-refundable once produced — that's reflected below as a reasonable default — but every{' '}
        <span className="font-bold text-gold-dark">CONFIRM</span> marker is a real decision only the shop owner
        can make. Please review before publishing.
      </DraftBanner>

      <H2>Made-to-order printing</H2>
      <p>
        Because most of what we print is made specifically for you — business cards with your details, banners
        with your design, T-shirts with your print — orders generally can't be refunded once production has
        started, the same way a custom order works at most print shops.
      </p>

      <H2>Orders that were never confirmed</H2>
      <p>
        If you sent an order on WhatsApp but never heard back from us and no work began, no charge applies — you
        haven't paid anything yet at that point, since this system doesn't take payment online.
      </p>

      <H2>When a reprint or refund may apply</H2>
      <p><Confirm>we'll typically offer a free reprint or refund if:</Confirm></p>
      <ul className="list-disc space-y-1 pl-5">
        <li>The finished item doesn't match what was confirmed with you (wrong quantity, wrong color mode, wrong size, etc. — caused by our error, not a mistake in what was submitted)</li>
        <li>There's a genuine quality/print defect</li>
      </ul>

      <H2>What doesn't qualify</H2>
      <p><Confirm>typically not covered:</Confirm></p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Changing your mind after the order was confirmed and printing began</li>
        <li>Errors in the file, design, spelling, or details you submitted yourself</li>
        <li>Minor, expected variation in color between a screen and a printed result</li>
      </ul>

      <H2>Timeframe</H2>
      <p>
        <Confirm>please let us know about any issue within a set window — e.g. "48 hours" — of collecting your order; shop to specify</Confirm>.
      </p>

      <H2>Partial issues</H2>
      <p>
        <Confirm>if only part of a bulk order has a defect (e.g. 5 of 100 flyers), whether we reprint just those
        or offer partial credit — shop to specify</Confirm>.
      </p>

      <H2>How to request one</H2>
      <p>Message us on WhatsApp with your order number and a photo of the issue, and we'll take it from there.</p>

      <p className="text-[13px] text-muted">
        See also our <Link to="/terms" className="font-bold text-gold-dark">Terms &amp; Conditions</Link>.
      </p>
    </PolicyLayout>
  )
}
