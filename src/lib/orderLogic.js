import { UPLOAD_ENDPOINT, SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js'

// ---- Job catalog (step 1) ----
export const JOB_CATALOG = [
  { key: 'photocopy', label: 'Photocopy', icon: 'Copy', profile: 'standardPrint', job: 'Photocopying' },
  {
    key: 'card', label: 'Card', icon: 'CreditCard', profile: 'card',
    subtypes: [
      { label: 'Business Card', icon: 'CreditCard' },
      { label: 'ID Card', icon: 'IdCard' },
      { label: 'Invitation Card', icon: 'Mail' },
      { label: 'Other Card', icon: 'FileText' },
    ],
  },
  { key: 'flyers', label: 'Flyers/Posters', icon: 'Image', profile: 'standardPrint', job: 'Flyers / Posters' },
  { key: 'cv', label: 'CV', icon: 'FileText', profile: 'standardPrint', job: 'CV design/printing' },
  { key: 'handouts', label: 'Handouts', icon: 'Layers', profile: 'standardPrint', job: 'Handouts/Past questions' },
  { key: 'banner', label: 'Banner', icon: 'Flag', profile: 'banner', job: 'Banner printing' },
  {
    key: 'stickers', label: 'Stickers', icon: 'Tag', profile: 'stickers',
    subtypes: [
      { label: 'Wall Stickers', icon: 'PanelsTopLeft' },
      { label: 'Pen Stickers', icon: 'Pen' },
      { label: 'Keychains', icon: 'Key' },
      { label: 'Label Stickers', icon: 'Tag' },
      { label: 'Other Sticker', icon: 'Sparkles' },
    ],
  },
  {
    key: 'tshirt', label: 'T-Shirt Printing', icon: 'Shirt', profile: 'apparel',
    subtypes: [
      { label: 'Screen Print', icon: 'Printer' },
      { label: 'DTF Print', icon: 'Droplet' },
      { label: 'Embroidery', icon: 'Scissors' },
      { label: 'Not sure', icon: 'HelpCircle' },
    ],
  },
]

// Which profiles ask a "size" question (step 5). Card/banner/stickers
// aren't meaningfully sized in A4/A3 sheet terms, so they skip it.
export function needsStep5(profile) {
  return profile === 'standardPrint' || profile === 'apparel'
}

export const NO_FILE_SEQUENCE = [1, 2, 3, 7, 8]

export function currentSequence(state) {
  if (state.bringOwn) return NO_FILE_SEQUENCE
  return needsStep5(state.profile) ? [1, 2, 3, 4, 5, 6, 7, 8] : [1, 2, 3, 4, 6, 7, 8]
}

export const PROFILE_LABELS = {
  standardPrint: {
    4: { title: 'Color or black & white?', sub: 'Tap a picture.' },
    5: { title: 'What paper size?', sub: 'Not sure? Just pick "Not sure" — we\'ll ask you at the counter.' },
    6: { title: 'Anything special?', sub: 'Tap a picture, or skip if just plain paper is fine.' },
  },
  card: {
    4: { title: 'Color or black & white?', sub: 'Tap a picture.' },
    6: { title: 'What finish?', sub: 'Tap a picture, or Not sure if you want to decide at the counter.' },
  },
  banner: {
    4: { title: 'Color or black & white?', sub: 'Tap a picture.' },
    6: { title: 'How should it be finished?', sub: 'This is about how the banner is mounted/hung.' },
  },
  stickers: {
    4: { title: 'Color or black & white?', sub: 'Tap a picture.' },
    6: { title: 'What finish?', sub: 'Tap a picture, or Not sure if you want to decide at the counter.' },
  },
  apparel: {
    4: { title: 'What shirt color?', sub: 'Tap a picture, or choose Other if you\'re not sure yet.' },
    5: { title: 'What size?', sub: 'Pick one, or Mixed sizes if it\'s more than one shirt.' },
    6: { title: 'Where should the print go?', sub: 'Tap a picture.' },
  },
}

export const DEFAULT_STATE = {
  profile: 'standardPrint',
  color: 'Color',
  size: 'A4 (normal size)',
  binding: 'Plain, no finishing',
  cardFinish: 'Matte',
  bannerFinish: 'Eyelets / Grommets',
  stickerFinish: 'Glossy',
  shirtColor: 'White',
  shirtSize: 'Small',
  placement: 'Front',
  bringOwn: false,
}

// Single source of truth for "what fields does this job type need, and
// what should they be labeled" — used by the ticket image, the review
// summary, the WhatsApp message, and the database payload.
export function getProfileFields(s) {
  if (s.bringOwn) return []
  switch (s.profile) {
    case 'apparel':
      return [
        { label: 'Shirt Color', value: s.shirtColor, dbKey: 'shirt_color' },
        { label: 'Size', value: s.shirtSize, dbKey: 'shirt_size' },
        { label: 'Print Placement', value: s.placement, dbKey: 'print_placement' },
      ]
    case 'card':
      return [
        { label: 'Color', value: s.color, dbKey: 'color' },
        { label: 'Card Finish', value: s.cardFinish, dbKey: 'card_finish' },
      ]
    case 'banner':
      return [
        { label: 'Color', value: s.color, dbKey: 'color' },
        { label: 'Banner Finish', value: s.bannerFinish, dbKey: 'banner_finish' },
      ]
    case 'stickers':
      return [
        { label: 'Color', value: s.color, dbKey: 'color' },
        { label: 'Sticker Finish', value: s.stickerFinish, dbKey: 'sticker_finish' },
      ]
    default:
      return [
        { label: 'Color', value: s.color, dbKey: 'color' },
        { label: 'Paper', value: s.size, dbKey: 'paper_size' },
        { label: 'Finishing', value: s.binding, dbKey: 'finishing' },
      ]
  }
}

export function makeOrderId() {
  const d = new Date()
  const stamp =
    d.getFullYear().toString().slice(2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `PR-${stamp}-${rand}`
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(' ')
  const lines = []
  let line = ''
  words.forEach((word) => {
    const test = line ? line + ' ' + word : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = test
    }
  })
  if (line) lines.push(line)
  return lines
}

function drawDashed(ctx, x1, y1, x2, y2) {
  ctx.save()
  ctx.strokeStyle = '#d8d2c4'
  ctx.lineWidth = 1.5
  ctx.setLineDash([5, 4])
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()
}

// Renders the printable order ticket onto a <canvas> element.
export function drawTicket(canvas, data) {
  const dpr = window.devicePixelRatio || 1
  const width = 480
  let y = 0

  const scratch = document.createElement('canvas').getContext('2d')
  scratch.font = '13px monospace'

  const rows = []
  rows.push({ label: 'Job', value: data.job })
  rows.push({ label: 'Copies', value: String(data.copies) })
  getProfileFields(data).forEach((f) => rows.push({ label: f.label, value: f.value }))
  rows.push({ label: 'File', value: data.fileText })
  rows.push({ label: 'Customer', value: data.name })

  let estRows = 0
  rows.forEach((r) => {
    const lines = wrapText(scratch, r.value, width - 40 - 100)
    estRows += Math.max(1, lines.length)
  })
  const height = 210 + estRows * 24 + 90

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.aspectRatio = `${width}/${height}`
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#c9a227'
  ctx.globalAlpha = 0.6
  for (let x = 0; x < width; x += 20) ctx.fillRect(x, 0, 10, 6)
  ctx.globalAlpha = 1

  y = 34
  ctx.fillStyle = '#8a6d1a'
  ctx.font = 'bold 11px sans-serif'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText('G1 CREATIVE AGENCY', 24, y)

  y += 26
  ctx.fillStyle = '#1c2b3a'
  ctx.font = '800 22px sans-serif'
  ctx.fillText('Print Order', 24, y)

  y += 22
  ctx.fillStyle = '#6b7280'
  ctx.font = '12px sans-serif'
  ctx.fillText(`#${data.orderId} · ${data.dateStr}`, 24, y)

  y += 20
  drawDashed(ctx, 24, y, width - 24, y)

  y += 26
  ctx.font = '13px sans-serif'
  rows.forEach((r) => {
    ctx.fillStyle = '#6b7280'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText(r.label.toUpperCase(), 24, y)

    ctx.fillStyle = '#1c2b3a'
    ctx.font = '13px sans-serif'
    const lines = wrapText(ctx, r.value, width - 24 - 24)
    lines.forEach((line, i) => {
      ctx.fillText(line, 24, y + 16 + i * 17)
    })
    y += 16 + lines.length * 17 + 6
  })

  y += 8
  drawDashed(ctx, 24, y, width - 24, y)

  y += 26
  ctx.fillStyle = '#3a7d44'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Thank you! See you at the counter.', width / 2, y)
  ctx.textAlign = 'left'

  ctx.strokeStyle = '#d8d2c4'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1)
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

// Uploads a file/blob to Catbox, reporting progress via onProgress(pct).
export function uploadFile(file, filename, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('reqtype', 'fileupload')
    formData.append('fileToUpload', file, filename || file.name || 'upload')

    const xhr = new XMLHttpRequest()
    xhr.open('POST', UPLOAD_ENDPOINT)

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.onload = () => {
      const url = (xhr.responseText || '').trim()
      if (xhr.status >= 200 && xhr.status < 300 && url.startsWith('http')) {
        resolve(url)
      } else {
        reject(new Error('upload failed'))
      }
    }
    xhr.onerror = () => reject(new Error('upload failed'))
    xhr.send(formData)
  })
}

// ---- Supabase Storage (private "order-files" bucket) ----
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024 // matches the bucket's 25 MB limit

export const safeName = (n) =>
  String(n || 'file').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^_+|_+$/g, '').slice(-80) || 'file'

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`

// Uploads to the private bucket. Visitors can only upload, never read back.
// Resolves to "sb:<path>", which the staff dashboard turns into a short-lived
// download link.
export function uploadOrderFile(file, filename, orderId, onProgress) {
  return new Promise((resolve, reject) => {
    const path = `${safeName(orderId)}/${newId()}-${safeName(filename || file.name)}`
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/order-files/${path}`)
    xhr.setRequestHeader('apikey', SUPABASE_ANON_KEY)
    xhr.setRequestHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    })
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve(`sb:${path}`) : reject(new Error('upload failed')))
    xhr.onerror = () => reject(new Error('upload failed'))
    xhr.send(file)
  })
}

// Uses Supabase when it's configured; falls back to Catbox only for local
// development without keys.
export function storeOrderFile(file, filename, orderId, onProgress) {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) return uploadOrderFile(file, filename, orderId, onProgress)
  return uploadFile(file, filename, onProgress)
}

export function saveOrderToDashboard(payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return Promise.resolve(false)
  return fetch(`${SUPABASE_URL}/rest/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.ok)
    .catch(() => false)
}

export function buildMessage({ job, name, copies, state, hasFile, fileName, fileLink, ticketLink, orderId, dashboardUrl }) {
  const stored = (v) => typeof v === 'string' && v.startsWith('sb:')
  let msg = `*G1 Creative Agency - New Order*\n`
  if (orderId) msg += `*Order:* #${orderId}\n`
  // Opens this order in the staff dashboard (staff log in first), where the ticket and file are one tap away.
  if (dashboardUrl) msg += `*Open ticket:* ${dashboardUrl}\n`
  msg += `------------------------\n`

  // Private files have no public link, so the message lists the details as text
  // and points to the dashboard for the ticket image and file.
  if (ticketLink && !stored(ticketLink)) {
    msg += `*Order Ticket:* ${ticketLink}\n`
    msg += `------------------------\n`
    msg += `*Customer:* ${name}\n`
  } else {
    msg += `*Job:* ${job}\n`
    msg += `*Copies:* ${copies}\n`
    getProfileFields(state).forEach((f) => {
      msg += `*${f.label}:* ${f.value}\n`
    })
    msg += `------------------------\n`
    msg += `*Customer:* ${name}\n`
  }

  if (hasFile && fileLink && stored(fileLink)) {
    msg += `*File:* ${fileName} (uploaded, we'll open it from the dashboard)\n`
  } else if (hasFile && fileLink) {
    msg += `*File:* ${fileName}\n`
    msg += `*Download:* ${fileLink}\n`
  } else if (hasFile) {
    msg += `*File:* ${fileName} (attached below)\n`
  } else if (state.bringOwn) {
    msg += `*File:* Customer will bring it in person\n`
  } else {
    msg += `*File:* None provided\n`
  }
  return msg
}
