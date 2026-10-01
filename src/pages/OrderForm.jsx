import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import * as Icons from 'lucide-react'
import Tile from '../components/Tile.jsx'
import { SHOP_WHATSAPP } from '../lib/config.js'
import {
  JOB_CATALOG,
  PROFILE_LABELS,
  DEFAULT_STATE,
  currentSequence,
  getProfileFields,
  makeOrderId,
  drawTicket,
  canvasToBlob,
  storeOrderFile,
  MAX_UPLOAD_BYTES,
  saveOrderToDashboard,
  buildMessage,
} from '../lib/orderLogic.js'

export default function OrderForm() {
  const [step, setStep] = useState(1)
  const [state, setState] = useState(DEFAULT_STATE)
  const [job, setJob] = useState('')
  const [jobError, setJobError] = useState(false)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState(false)
  const [copies, setCopies] = useState(1)
  const [quickSelection, setQuickSelection] = useState({ key: null, subtypeLabel: null })
  const [subtypeItem, setSubtypeItem] = useState(null) // catalog item whose subtypes are open
  const [file, setFile] = useState(null)
  const [fileError, setFileError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [orderId] = useState(makeOrderId())
  const [sendState, setSendState] = useState('idle') // idle | creating-ticket | uploading-file | saving | done
  const [uploadPct, setUploadPct] = useState(0)
  const [overlayOpen, setOverlayOpen] = useState(false)
  const [pendingUrl, setPendingUrl] = useState('')

  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const stepRef = useRef(null)
  const firstRender = useRef(true)
  const [searchParams] = useSearchParams()

  const sequence = currentSequence(state)
  const stepIndex = sequence.indexOf(step)

  const setField = (group, val) => setState((s) => ({ ...s, [group]: val }))

  const applyProfile = (profile) => setState((s) => ({ ...s, profile }))

  // Move on after a single-choice tap so people don't have to hit Next.
  // Only used where the next step doesn't depend on state that is still updating.
  const advanceFrom = (from) => {
    setTimeout(() => {
      const idx = sequence.indexOf(from)
      setStep(sequence[Math.min(idx + 1, sequence.length - 1)])
      window.scrollTo(0, 0)
    }, 180)
  }

  const goNext = () => {
    if (step === 1 && !job.trim()) {
      setJobError(true)
      return
    }
    if (step === 7 && !name.trim()) {
      setNameError(true)
      return
    }
    const idx = sequence.indexOf(step)
    const next = sequence[Math.min(idx + 1, sequence.length - 1)]
    setStep(next)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    const idx = sequence.indexOf(step)
    const prev = sequence[Math.max(idx - 1, 0)]
    setStep(prev)
    window.scrollTo(0, 0)
  }

  const selectSimpleJob = (item, { advance = true } = {}) => {
    setQuickSelection({ key: item.key, subtypeLabel: null })
    setJob(item.job)
    setJobError(false)
    applyProfile(item.profile)
    if (advance) advanceFrom(1)
  }

  const openSubtypePanel = (item) => setSubtypeItem(item)

  const pickSubtype = (item, sub) => {
    setQuickSelection({ key: item.key, subtypeLabel: sub.label })
    setJob(`${item.label} - ${sub.label}`)
    setJobError(false)
    applyProfile(item.profile)
    setSubtypeItem(null)
    advanceFrom(1)
  }

  // Arriving from a service on the home page (/order?job=banner): skip the
  // job picker, or open its options if that job has sub-types.
  useEffect(() => {
    const key = searchParams.get('job')
    const item = key && JOB_CATALOG.find((j) => j.key === key)
    if (!item) return
    if (item.subtypes) {
      setSubtypeItem(item)
    } else {
      selectSimpleJob(item, { advance: false })
      setStep(2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Move keyboard/screen-reader focus to the new step so it gets announced.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    stepRef.current?.focus({ preventScroll: true })
  }, [step, subtypeItem])

  const onJobInput = (val) => {
    setJob(val)
    if (val.trim()) setJobError(false)
    if (quickSelection.key) setQuickSelection({ key: null, subtypeLabel: null })
    if (/shirt/i.test(val)) applyProfile('apparel')
  }

  const onFileChange = (files) => {
    if (files && files.length) {
      if (files[0].size > MAX_UPLOAD_BYTES) {
        setFileError('That file is over 25 MB. Please choose a smaller one, or send it to us on WhatsApp.')
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      setFileError('')
      setField('bringOwn', false)
      setFile(files[0])
    }
  }

  const toggleBringOwn = () => {
    setField('bringOwn', true)
    setFile(null)
    setFileError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Redraw the ticket whenever the review step is shown or inputs change.
  const buildSummary = useCallback(() => {
    if (!canvasRef.current) return
    const hasFile = !!file
    const fileText = hasFile ? file.name : state.bringOwn ? "I'll bring it myself" : 'None'
    drawTicket(canvasRef.current, {
      job: job.trim() || '(not filled in)',
      name: name.trim() || '(not filled in)',
      fileText,
      copies,
      profile: state.profile,
      color: state.color,
      size: state.size,
      binding: state.binding,
      cardFinish: state.cardFinish,
      bannerFinish: state.bannerFinish,
      stickerFinish: state.stickerFinish,
      shirtColor: state.shirtColor,
      shirtSize: state.shirtSize,
      placement: state.placement,
      bringOwn: state.bringOwn,
      orderId,
      dateStr: new Date().toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
    })
  }, [file, job, name, copies, state, orderId])

  useEffect(() => {
    if (step === 8) buildSummary()
  }, [step, buildSummary])

  const handleSend = async () => {
    const jobVal = job.trim() || 'Not specified'
    const nameVal = name.trim() || 'Not specified'
    const hasFile = !!file
    const fileName = hasFile ? file.name : ''

    setSendState('creating-ticket')
    setUploadPct(0)

    let ticketLink = null
    try {
      const ticketBlob = await canvasToBlob(canvasRef.current)
      ticketLink = await storeOrderFile(ticketBlob, `order-${orderId}.png`, orderId, setUploadPct)
    } catch {
      ticketLink = null
    }

    let fileLink = null
    let fileUploadFailed = false
    if (hasFile) {
      setSendState('uploading-file')
      setUploadPct(0)
      try {
        fileLink = await storeOrderFile(file, undefined, orderId, setUploadPct)
      } catch {
        fileUploadFailed = true
      }
    }

    setSendState('saving')
    const dbPayload = {
      order_code: orderId,
      job: jobVal,
      copies,
      profile: state.profile,
      job_category: state.profile === 'apparel' ? 'apparel' : 'print',
      color: null, paper_size: null, finishing: null,
      card_finish: null, banner_finish: null, sticker_finish: null,
      shirt_color: null, shirt_size: null, print_placement: null,
      customer_name: nameVal,
      bring_own: state.bringOwn,
      file_name: hasFile ? fileName : null,
      file_link: fileLink,
      ticket_link: ticketLink,
    }
    getProfileFields(state).forEach((f) => { dbPayload[f.dbKey] = f.value })
    await saveOrderToDashboard(dbPayload)

    const msg = buildMessage({ job: jobVal, name: nameVal, copies, state, hasFile, fileName, fileLink, ticketLink, orderId, dashboardUrl: `${window.location.origin}/dashboard?order=${encodeURIComponent(orderId)}` })
    const url = `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(msg)}`
    setPendingUrl(url)
    setSendState('idle')

    if (fileUploadFailed) {
      setOverlayOpen(true)
    } else {
      window.location.href = url
    }
  }

  const sendBtnLabel = {
    idle: null,
    'creating-ticket': 'Creating ticket...',
    'uploading-file': 'Uploading your file...',
    saving: 'Saving order...',
  }[sendState]

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-12">
      <header className="mb-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-ink">Start an order</h1>
          <p className="text-sm font-semibold text-muted" aria-live="polite">
            Step {stepIndex + 1} of {sequence.length}
          </p>
        </div>
        <Dots sequence={sequence} step={step} />
      </header>

      <div className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-7">
        <div key={`${step}-${subtypeItem ? subtypeItem.key : ""}`} ref={stepRef} tabIndex={-1} className="anim-step outline-none">
        {step === 1 && (
          <Step1
            job={job} jobError={jobError} onJobInput={onJobInput}
            quickSelection={quickSelection} subtypeItem={subtypeItem}
            onSelectSimple={selectSimpleJob} onOpenSubtype={openSubtypePanel}
            onPickSubtype={pickSubtype} onCloseSubtype={() => setSubtypeItem(null)}
          />
        )}

        {step === 2 && <Step2 copies={copies} setCopies={setCopies} />}

        {step === 3 && (
          <Step3
            fileError={fileError} file={file} bringOwn={state.bringOwn} dragOver={dragOver}
            fileInputRef={fileInputRef}
            onFileChange={onFileChange} onToggleBringOwn={toggleBringOwn}
            setDragOver={setDragOver}
          />
        )}

        {step === 4 && (
          <Step4Color profile={state.profile} state={state} setField={setField} onPick={() => advanceFrom(4)} />
        )}

        {step === 5 && (
          <Step5Size profile={state.profile} state={state} setField={setField} onPick={() => advanceFrom(5)} />
        )}

        {step === 6 && (
          <Step6Finish profile={state.profile} state={state} setField={setField} onPick={() => advanceFrom(6)} />
        )}

        {step === 7 && (
          <Step7Name name={name} nameError={nameError} onEnter={goNext} onChange={(v) => { setName(v); if (v.trim()) setNameError(false) }} />
        )}

        {step === 8 && (
          <Step8Review
            canvasRef={canvasRef}
            sendState={sendState}
            sendBtnLabel={sendBtnLabel}
            uploadPct={uploadPct}
            onSend={handleSend}
          />
        )}
        </div>

        {step !== 8 && (
          <div className="sticky bottom-0 -mx-5 mt-6 flex items-center justify-between gap-3 border-t border-line bg-white/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-none">
            {stepIndex > 0 ? (
              <button onClick={goBack} className="btn-ghost">
                <Icons.ArrowLeft size={18} /> Back
              </button>
            ) : <span />}
            <button onClick={goNext} className="btn-primary">
              Next <Icons.ArrowRight size={18} className="nudge-r" />
            </button>
          </div>
        )}
        {step === 8 && (
          <div className="mt-6">
            <button onClick={goBack} className="btn-ghost">
              <Icons.ArrowLeft size={18} /> Back
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Need help right now?{' '}
        <a
          href={`https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent('Hi, I need help with a print order.')}`}
          className="font-semibold text-gold-dark"
        >
          Message us directly
        </a>
      </p>

      {overlayOpen && (
        <FileUploadFailedOverlay
          fileName={file?.name}
          onContinue={() => {
            setOverlayOpen(false)
            window.location.href = pendingUrl
          }}
        />
      )}
    </div>
  )
}

function Dots({ sequence, step }) {
  const idx = sequence.indexOf(step)
  return (
    <div className="mt-3 flex gap-1.5" aria-hidden="true">
      {sequence.map((_, i) => (
        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= idx ? 'bg-gold-dark' : 'bg-line'}`} />
      ))}
    </div>
  )
}

// ---- Step 1: job type ----
function Step1({ job, jobError, onJobInput, quickSelection, subtypeItem, onSelectSimple, onOpenSubtype, onPickSubtype, onCloseSubtype }) {
  if (subtypeItem) {
    return (
      <div>
        <button onClick={onCloseSubtype} className="mb-3 flex min-h-[44px] items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
          <Icons.ArrowLeft size={15} /> Back
        </button>
        <h2 className="text-xl font-extrabold text-ink">{subtypeItem.label}</h2>
        <p className="mt-1 text-[15px] text-muted">Pick the closest match — we can adjust details at the counter.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {subtypeItem.subtypes.map((sub) => (
            <Tile key={sub.label} icon={sub.icon} label={sub.label} onClick={() => onPickSubtype(subtypeItem, sub)} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">What do you need?</h2>
      <p className="mt-1 text-[15px] text-muted">Tap something common below, or type your own.</p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {JOB_CATALOG.map((item) => (
          <Tile
            key={item.key}
            icon={item.icon}
            label={item.label}
            sublabel={quickSelection.key === item.key ? quickSelection.subtypeLabel : null}
            selected={quickSelection.key === item.key}
            onClick={() => (item.subtypes ? onOpenSubtype(item) : onSelectSimple(item))}
          />
        ))}
      </div>

      <label htmlFor="job-input" className="mt-5 block text-sm font-bold text-ink">Or describe it yourself</label>
      <input
        id="job-input"
        type="text"
        value={job}
        onChange={(e) => onJobInput(e.target.value)}
        placeholder="e.g. 10 copies of my CV"
        aria-invalid={jobError}
        aria-describedby={jobError ? 'job-error' : undefined}
        className="field mt-1.5"
      />
      {jobError && <p id="job-error" className="mt-1.5 text-sm font-semibold text-red">Choose a job above or describe it here.</p>}
    </div>
  )
}

// ---- Step 2: copies ----
const COPY_PRESETS = [1, 5, 10, 20, 50, 100]

function Step2({ copies, setCopies }) {
  const [raw, setRaw] = useState(String(copies))

  const inputRef = useRef(null)
  const pop = () => {
    const el = inputRef.current
    if (!el) return
    el.classList.remove('anim-pop')
    void el.offsetWidth // restart the animation
    el.classList.add('anim-pop')
  }
  const commit = (n) => {
    pop()
    const v = Math.min(Math.max(1, n), 100000)
    setCopies(v)
    setRaw(String(v))
  }
  const onType = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6)
    setRaw(digits)
    const n = parseInt(digits, 10)
    if (n >= 1) setCopies(n)
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">How many copies?</h2>
      <p className="mt-1 text-[15px] text-muted">Type a number, or tap one below. You can change it later if needed.</p>

      <div className="mt-5 flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="One fewer copy"
          onClick={() => commit(copies - 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-line-strong text-ink hover:bg-ink/5"
        >
          <Icons.Minus size={20} />
        </button>
        <label className="sr-only" htmlFor="copies-input">Number of copies</label>
        <input
          id="copies-input"
          ref={inputRef}
          inputMode="numeric"
          pattern="[0-9]*"
          value={raw}
          onChange={onType}
          onBlur={() => commit(parseInt(raw, 10) || 1)}
          onFocus={(e) => e.target.select()}
          className="h-14 w-28 rounded-lg border-[1.5px] border-line-strong bg-white text-center font-display text-3xl font-extrabold text-ink focus:border-gold-dark"
        />
        <button
          type="button"
          aria-label="One more copy"
          onClick={() => commit(copies + 1)}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-line-strong text-ink hover:bg-ink/5"
        >
          <Icons.Plus size={20} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {COPY_PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={copies === n}
            onClick={() => commit(n)}
            className={[
              'min-h-[44px] min-w-[52px] rounded-full border-[1.5px] px-4 text-[15px] font-bold transition-colors',
              copies === n ? 'border-gold-dark bg-gold/15 text-ink' : 'border-line bg-white text-ink hover:border-line-strong',
            ].join(' ')}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---- Step 3: file ----
function Step3({ file, fileError, bringOwn, dragOver, fileInputRef, onFileChange, onToggleBringOwn, setDragOver }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">Attach your file</h2>
      <p className="mt-1 text-[15px] text-muted">Or choose "I'll bring it myself" if you'd rather hand it over in person.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          onFileChange(e.dataTransfer.files)
        }}
        onClick={() => fileInputRef.current?.click()}
        className={[
          'mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          dragOver ? 'border-gold bg-gold/10' : file ? 'border-green bg-green/5' : 'border-line-strong bg-paper',
        ].join(' ')}
      >
        {file ? (
          <>
            <Icons.CheckCircle2 size={26} className="text-green" />
            <span className="break-all text-[15px] font-semibold text-ink">{file.name}</span>
          </>
        ) : (
          <>
            <Icons.Paperclip size={26} className="text-muted" />
            <span className="text-[15px] font-semibold text-ink">Tap to choose a photo or file</span>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => onFileChange(e.target.files)}
        />
      </div>
      {fileError && <p role="alert" className="mt-2 text-sm font-semibold text-red">{fileError}</p>}

      <div className="mt-3">
        <Tile
          icon="UserRound"
          label="I'll bring it myself"
          selected={bringOwn}
          onClick={onToggleBringOwn}
        />
      </div>
    </div>
  )
}

// ---- Step 4: color ----
const COLOR_OPTIONS = [
  { val: 'Color', icon: 'Palette', label: 'Color' },
  { val: 'Black & White', icon: 'Contrast', label: 'B&W' },
]
const SHIRT_COLOR_OPTIONS = [
  { val: 'White', icon: 'Shirt', label: 'White' },
  { val: 'Black', icon: 'Shirt', label: 'Black' },
  { val: 'Other color', icon: 'Palette', label: 'Other' },
  { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
]

function Step4Color({ profile, state, setField, onPick }) {
  const labels = PROFILE_LABELS[profile][4]
  const isApparel = profile === 'apparel'
  const options = isApparel ? SHIRT_COLOR_OPTIONS : COLOR_OPTIONS
  const group = isApparel ? 'shirtColor' : 'color'
  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">{labels.title}</h2>
      <p className="mt-1 text-[15px] text-muted">{labels.sub}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((o) => (
          <Tile key={o.val} icon={o.icon} label={o.label} selected={state[group] === o.val} onClick={() => { setField(group, o.val); onPick() }} />
        ))}
      </div>
    </div>
  )
}

// ---- Step 5: size ----
const PAPER_OPTIONS = [
  { val: 'A4 (normal size)', icon: 'FileText', label: 'Normal (A4)' },
  { val: 'A3 (large size)', icon: 'Layers', label: 'Large (A3)' },
  { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
]
const SHIRT_SIZE_OPTIONS = [
  { val: 'Small', letter: 'S', label: 'Small' },
  { val: 'Medium', letter: 'M', label: 'Medium' },
  { val: 'Large', letter: 'L', label: 'Large' },
  { val: 'X-Large', letter: 'XL', label: 'X-Large' },
  { val: 'Mixed sizes', icon: 'Shirt', label: 'Mixed sizes' },
  { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
]

function Step5Size({ profile, state, setField, onPick }) {
  const labels = PROFILE_LABELS[profile][5]
  const isApparel = profile === 'apparel'
  const options = isApparel ? SHIRT_SIZE_OPTIONS : PAPER_OPTIONS
  const group = isApparel ? 'shirtSize' : 'size'
  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">{labels.title}</h2>
      <p className="mt-1 text-[15px] text-muted">{labels.sub}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map((o) => (
          <Tile key={o.val} icon={o.icon} letter={o.letter} label={o.label} selected={state[group] === o.val} onClick={() => { setField(group, o.val); onPick() }} />
        ))}
      </div>
    </div>
  )
}

// ---- Step 6: finishing ----
const FINISH_OPTIONS = {
  standardPrint: { group: 'binding', options: [
    { val: 'Plain, no finishing', icon: 'FileText', label: 'Plain' },
    { val: 'Stapled', icon: 'Paperclip', label: 'Stapled' },
    { val: 'Spiral bound', icon: 'CircleDashed', label: 'Spiral bound' },
    { val: 'Laminated', icon: 'ShieldCheck', label: 'Laminated' },
  ]},
  card: { group: 'cardFinish', options: [
    { val: 'Matte', icon: 'CreditCard', label: 'Matte' },
    { val: 'Glossy', icon: 'Sparkles', label: 'Glossy' },
    { val: 'Laminated', icon: 'ShieldCheck', label: 'Laminated' },
    { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
  ]},
  banner: { group: 'bannerFinish', options: [
    { val: 'Eyelets / Grommets', icon: 'CircleDot', label: 'Eyelets' },
    { val: 'Hemmed edges', icon: 'Square', label: 'Hemmed Edges' },
    { val: 'Pole pocket', icon: 'GripVertical', label: 'Pole Pocket' },
    { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
  ]},
  stickers: { group: 'stickerFinish', options: [
    { val: 'Glossy', icon: 'Sparkles', label: 'Glossy' },
    { val: 'Matte', icon: 'Tag', label: 'Matte' },
    { val: 'Waterproof', icon: 'Droplet', label: 'Waterproof' },
    { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
  ]},
  apparel: { group: 'placement', options: [
    { val: 'Front', icon: 'Shirt', label: 'Front' },
    { val: 'Back', icon: 'Shirt', label: 'Back' },
    { val: 'Front and Back', icon: 'Shirt', label: 'Front & Back' },
    { val: 'Not sure', icon: 'HelpCircle', label: 'Not sure' },
  ]},
}

function Step6Finish({ profile, state, setField, onPick }) {
  const labels = PROFILE_LABELS[profile][6]
  const { group, options } = FINISH_OPTIONS[profile]
  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">{labels.title}</h2>
      <p className="mt-1 text-[15px] text-muted">{labels.sub}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((o) => (
          <Tile key={o.val} icon={o.icon} label={o.label} selected={state[group] === o.val} onClick={() => { setField(group, o.val); onPick() }} />
        ))}
      </div>
    </div>
  )
}

// ---- Step 7: name ----
function Step7Name({ name, nameError, onChange, onEnter }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">What's your name?</h2>
      <p className="mt-1 text-[15px] text-muted">So we know who the order is for.</p>
      <label htmlFor="name-input" className="sr-only">Your name</label>
      <input
        id="name-input"
        type="text"
        value={name}
        autoComplete="name"
        enterKeyHint="next"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onEnter() }}
        placeholder="Your name"
        aria-invalid={nameError}
        aria-describedby={nameError ? 'name-error' : undefined}
        className="field mt-4"
      />
      {nameError && <p id="name-error" className="mt-1.5 text-sm font-semibold text-red">Enter your name so we know who the order is for.</p>}
    </div>
  )
}

// ---- Step 8: review & send ----
function Step8Review({ canvasRef, sendState, sendBtnLabel, uploadPct, onSend }) {
  const sending = sendState !== 'idle'
  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">Double-check your order</h2>
      <p className="mt-1 text-[15px] text-muted">
        Check the details. Tapping send opens WhatsApp with your order ready to go, and we confirm everything with you before printing.
      </p>

      <canvas ref={canvasRef} className="mt-4 w-full rounded-lg shadow-card" />

      {sending && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadPct}>
          <div className="h-full bg-gold-dark transition-all" style={{ width: `${uploadPct}%` }} />
        </div>
      )}

      <p className="mt-4 text-[13px] leading-relaxed text-muted">
        By sending, you agree your order details are shared with us via WhatsApp and saved for order processing. See our{' '}
        <Link to="/privacy" target="_blank" className="font-bold text-gold-dark">Privacy Policy</Link> and{' '}
        <Link to="/terms" target="_blank" className="font-bold text-gold-dark">Terms</Link>.
      </p>

      <button
        onClick={onSend}
        disabled={sending}
        className="btn-send mt-5"
      >
        {sending ? (
          <span className="print-loader" aria-hidden="true"><i /><i /><i /></span>
        ) : (
          <Icons.Send size={17} className="nudge-r" />
        )}
        {sending ? sendBtnLabel : 'Send order on WhatsApp'}
      </button>
    </div>
  )
}

function FileUploadFailedOverlay({ fileName, onContinue }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lift">
        <Icons.Paperclip size={36} className="mx-auto text-gold-dark" />
        <p className="mt-3 text-[15px] font-bold text-ink">We couldn't upload your file</p>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">
          Everything else went through fine — once WhatsApp opens, please attach{' '}
          <strong>"{fileName}"</strong> manually to the chat.
        </p>
        <button
          onClick={onContinue}
          className="btn-primary mt-5 w-full"
        >
          Continue to WhatsApp
        </button>
      </div>
    </div>
  )
}
