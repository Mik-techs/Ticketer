import { Link } from 'react-router-dom'
import { PolicyLayout, Callout, H2 } from '../components/PolicyLayout.jsx'

export default function Privacy() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p className="text-[13px] text-muted">Last updated: check with the shop for the current date this was published.</p>

      <p>
        This page explains, plainly, what happens to your information when you place an order through our
        website. It describes what this specific system actually does — not a generic template.
      </p>

      <H2>What we collect</H2>
      <p>When you place an order, we collect:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Your name</li>
        <li>What you want printed, and the job details (copies, color, size, finishing, or the equivalent — e.g. shirt size for T-shirts)</li>
        <li>A file you upload, if you choose to attach one, plus a generated image of your order ticket</li>
      </ul>
      <p>
        We do not ask for your phone number or email directly. If you send your order to us on WhatsApp, WhatsApp
        shares your number with us as part of how WhatsApp itself works — that happens between you and WhatsApp,
        governed by WhatsApp's own privacy policy, not something this website controls.
      </p>

      <H2>How it's used</H2>
      <p>
        Your order details are sent to the shop as a WhatsApp message, and separately saved to a database so
        staff can see, organize, and track orders over time. That's the whole purpose of collecting it — fulfilling
        your print order and keeping a record of it.
      </p>

      <H2>Where it's stored</H2>
      <p>We use two outside services to run this system:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><b>Supabase</b> — hosts the order database. Only the shop's logged-in staff can view or manage orders stored there.</li>
        <li><b>Catbox.moe</b> — a free file-hosting service used to hold any file you upload and the generated order-ticket image, so a link to it can be included in your order.</li>
      </ul>

      <Callout>
        <b>Worth knowing:</b> these services may store data on servers located outside Ghana. Supabase and Catbox
        are both run by companies based abroad, so your order details and any uploaded file may cross borders as
        part of normal processing. Neither service is chosen or reviewed by this policy for that purpose — it's a
        practical consequence of using them.
      </Callout>

      <Callout>
        <b>Also worth knowing:</b> files uploaded through Catbox get a private-feeling but not truly
        access-controlled link — nobody can find it by searching, but anyone who has the exact link could open it.
        Please don't upload anything highly sensitive (like a passport photo page) if that link ever being seen by
        someone outside the shop would concern you. If in doubt, choose "I'll bring it myself" instead of uploading.
      </Callout>

      <H2>Children's privacy</H2>
      <p>
        This service is intended for use by adults placing print orders. We don't knowingly collect information
        from children. If you believe a minor has submitted an order without a parent or guardian's involvement,
        please contact us using the details below and we'll remove the record.
      </p>

      <H2>Your choices</H2>
      <ul className="list-disc space-y-1 pl-5">
        <li>Uploading a file is always optional — you can choose to bring your item in person instead.</li>
        <li>You can ask the shop to delete your order record at any time using the contact details below.</li>
      </ul>

      <H2>Cookies</H2>
      <p>
        This site doesn't use cookies, and doesn't use any advertising or analytics trackers. The only thing
        stored in your browser is a login session — and only on the staff dashboard, not on the customer order
        form or this page — so staff don't have to log in again every time they open it.
      </p>

      <H2>How long we keep it</H2>
      <p>Order records are kept in the database until the shop removes them. There's currently no automatic deletion after a set time.</p>

      <H2>Questions or requests</H2>
      <p>Contact the shop directly:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Email: g1creative97@gmail.com</li>
        <li>Phone: +233 53 406 8414</li>
        <li>WhatsApp: +233 54 685 0197</li>
      </ul>

      <H2>A note on the law</H2>
      <p>
        This page describes our actual practices but isn't legal advice. Ghana's Data Protection Act, 2012 (Act
        843) governs how personal data must be handled by businesses in Ghana, and may require registering with
        the Data Protection Commission depending on the nature and scale of data processing. The shop owner should
        confirm their specific obligations with the Commission or a local advisor rather than relying on this page
        alone.
      </p>

      <p className="text-[13px] text-muted">
        See also our <Link to="/terms" className="font-bold text-gold-dark">Terms &amp; Conditions</Link> and{' '}
        <Link to="/refund" className="font-bold text-gold-dark">Refund Policy</Link>.
      </p>
    </PolicyLayout>
  )
}
