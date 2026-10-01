// All values come from environment variables at build time (Vite exposes
// anything prefixed VITE_). This keeps secrets out of the repo — set the
// real values in Netlify's Site settings → Environment variables.
//
// Note on the Supabase anon key: it is meant to be public (it's the
// "anon" key, not a service key), but it only stays safe if Row Level
// Security policies on your tables actually restrict what an anonymous
// or logged-in-staff request can do. Confirm that's set up before relying
// on it.
export const SHOP_WHATSAPP = import.meta.env.VITE_SHOP_WHATSAPP || '233546850197'
export const UPLOAD_ENDPOINT = import.meta.env.VITE_UPLOAD_ENDPOINT || 'https://catbox.moe/user/api.php'
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Social profiles shown in the footer and on the home page. Instagram and X
// links are built from the handles already on the site. Facebook needs the
// real profile/page link: set VITE_FACEBOOK_URL (e.g. https://www.facebook.com/yourpage).
// Until then, the Facebook icon opens a search for the name instead.
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/gyankomichael'
export const X_URL = import.meta.env.VITE_X_URL || 'https://x.com/michael_gy2946'
export const FACEBOOK_URL =
  import.meta.env.VITE_FACEBOOK_URL || 'https://www.facebook.com/search/top?q=Michael%20Gyanko'
