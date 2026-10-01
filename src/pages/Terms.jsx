import { Link } from 'react-router-dom'
import { PolicyLayout, DraftBanner, Confirm, H2 } from '../components/PolicyLayout.jsx'

export default function Terms() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <DraftBanner>
        <b>This is a starting draft, not a finished legal document.</b> The sections marked{' '}
        <span className="font-bold text-gold-dark">CONFIRM</span> reflect standard print-shop practice, not your
        specific policy — read through and adjust anything that doesn't match how the shop actually operates
        before publishing this for real. Consider having a local advisor review it too.
      </DraftBanner>

      <H2>1. Placing an order</H2>
      <p>
        Orders are placed through our online order form and sent to us via WhatsApp. Submitting an order is a
        request for the work described — it isn't confirmed until we reply to accept it.
      </p>

      <H2>2. Pricing and payment</H2>
      <p>
        <Confirm>this system doesn't take payment online</Confirm>. Prices are confirmed directly with you (by
        WhatsApp reply or in person) before work begins, and payment is made{' '}
        <Confirm>on collection / on WhatsApp / at drop-off — shop to specify</Confirm>.
      </p>

      <H2>3. Turnaround time</H2>
      <p>
        <Confirm>typical turnaround for standard jobs — e.g. "same day" / "1–2 business days" — shop to specify</Confirm>.
        Larger or custom jobs (banners, bulk T-shirt printing) may take longer — we'll confirm a timeframe when we
        accept your order.
      </p>

      <H2>4. Files you provide</H2>
      <p>
        By uploading a file, you confirm you have the right to use and print it — for example, it's your own
        design, or you have permission from whoever created it. We don't check this for you, so please make sure
        before uploading.
      </p>

      <H2>5. Accuracy of your order</H2>
      <p>
        Please double-check the details on the review screen before sending — copies, color, size, and finishing —
        since we print based on what's submitted.{' '}
        <Confirm>whether a reprint is chargeable or free if something's wrong because the order details themselves were incorrect</Confirm>.
      </p>

      <H2>6. Cancellations</H2>
      <p>
        <Confirm>orders can be cancelled by messaging us before work has started</Confirm>. Once printing has
        begun on a job, <Confirm>shop to specify cancellation policy</Confirm>.
      </p>

      <H2>7. Refunds</H2>
      <p>See our separate <Link to="/refund" className="font-bold text-gold-dark">Refund Policy</Link> for details.</p>

      <H2>8. Ownership of designs</H2>
      <p>
        <Confirm>if the shop creates a custom design for you (not one you supplied), who owns the final artwork
        and whether it can be reused, resold, or reprinted elsewhere — shop to specify</Confirm>. Files or designs
        you supply remain yours; you're responsible for having the rights to use them (see section 4).
      </p>

      <H2>9. Our liability</H2>
      <p>
        <Confirm>a limit on our liability for delays, errors, or loss connected to an order — e.g. limited to the
        value of that order — shop to specify, ideally with local legal advice</Confirm>. Nothing here is meant to
        limit liability that can't be limited by law.
      </p>

      <H2>10. Age and capacity</H2>
      <p>
        By placing an order, you confirm you're old enough to enter into this agreement under the laws of Ghana,
        or that a parent or guardian has approved the order on your behalf.
      </p>

      <H2>11. How we contact you</H2>
      <p>We'll communicate about your order using the WhatsApp number the message comes from, unless you tell us otherwise.</p>

      <H2>12. Governing law</H2>
      <p>
        <Confirm>these terms are governed by the laws of Ghana, and any dispute will be handled by the courts of
        Ghana (or another resolution method the shop prefers, such as mediation) — shop to specify</Confirm>.
      </p>

      <H2>13. Changes to these terms</H2>
      <p>These terms may be updated from time to time. The version shown here is the one that applies at the time you place an order.</p>

      <p className="text-[13px] text-muted">
        See also our <Link to="/privacy" className="font-bold text-gold-dark">Privacy Policy</Link> and{' '}
        <Link to="/refund" className="font-bold text-gold-dark">Refund Policy</Link>.
      </p>
    </PolicyLayout>
  )
}
