import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Lock, ShieldCheck, RefreshCw, CreditCard, Tag } from 'lucide-react'
import { Link, APP_URL, CHECKOUT_LIVE, usePageMeta } from '../lib/site.jsx'
import { Backdrop, LOGO } from '../components/ui.jsx'
import { LITE_FEATURES } from '../components/Pricing.jsx'

const STEPS = ['Account', 'Payment', 'Done']

function Steps({ at }) {
  return (
    <ol className="co-steps" aria-label="Checkout steps">
      {STEPS.map((s, i) => (
        <li key={s} className={i < at ? 'done' : i === at ? 'on' : ''} aria-current={i === at ? 'step' : undefined}>
          <span className="co-dot">{i < at ? <Check size={11} strokeWidth={3} /> : i + 1}</span>{s}
          {i < STEPS.length - 1 && <i className="co-line" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  )
}

function Summary() {
  return (
    <aside className="co-summary ink" aria-label="Order summary">
      <div className="row" style={{ gap: 14 }}>
        <span className="logo-dot logo-chip" style={{ width: 52, height: 52 }}><img src={LOGO} alt="" style={{ width: 30 }} /></span>
        <div className="col" style={{ flex: 1 }}><span className="display" style={{ fontSize: 18, fontWeight: 600 }}>LIMITLESS Lite</span><span className="faint" style={{ fontSize: 13 }}>Billed monthly</span></div>
        <span className="display num" style={{ fontSize: 22, fontWeight: 600 }}>$15.00</span>
      </div>
      <ul className="co-feats">
        {LITE_FEATURES.slice(0, 6).map((f) => <li key={f}><Check size={14} />{f}</li>)}
      </ul>
      <div className="co-sep" />
      <div className="col num" style={{ gap: 10, fontSize: 14 }}>
        <div className="row co-sum-row"><span className="muted">Subtotal</span><span>$15.00</span></div>
        <div className="row co-sum-row"><span className="muted">Tax</span><span className="muted">Calculated by Stripe</span></div>
        <div className="row co-sum-row co-total"><span>Due today</span><span>$15.00</span></div>
      </div>
      <p className="faint" style={{ fontSize: 12.5, lineHeight: 1.55 }}>Renews every month at $15. Cancel anytime from Subscription in your account, and keep access until the end of the month you paid for.</p>
    </aside>
  )
}

function AccountStep({ form, setForm, onNext }) {
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setErr('Add your first name.')
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr('Enter a valid email.')
    if (form.password.length < 8) return setErr('Use at least 8 characters for your password.')
    setErr(''); onNext()
  }
  return (
    <form className="co-step col" onSubmit={submit} noValidate>
      <div className="col" style={{ gap: 6 }}>
        <h1 className="co-h">Create your account</h1>
        <p className="muted" style={{ fontSize: 14.5 }}>This is your login for the journal. Already have one? <a href={APP_URL} className="co-link">Log in</a></p>
      </div>
      <label className="co-field"><span>First name</span><input className="input" autoComplete="given-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Eugene" /></label>
      <label className="co-field"><span>Email</span><input className="input" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" /></label>
      <label className="co-field">
        <span>Password</span>
        <span className="co-pass">
          <input className="input" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" />
          <button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
        </span>
      </label>
      {err && <p className="neg" role="alert" style={{ fontSize: 13 }}>{err}</p>}
      <button type="submit" className="btn btn-primary btn-lg">Continue to payment <ArrowRight size={16} /></button>
      <p className="faint" style={{ fontSize: 12, lineHeight: 1.55 }}>By continuing you agree to the <Link to="/terms" className="co-link">Terms</Link> and <Link to="/privacy" className="co-link">Privacy Policy</Link>.</p>
    </form>
  )
}

// Live mode: the journal app owns the account (Supabase auth on app.limitless-journal.com),
// so the site doesn't collect details it can't use. One tap hands off to the app sign up,
// which remembers the plan and opens Stripe Checkout right after.
function LiveAccountStep() {
  const [busy, setBusy] = useState(false)
  const go = (path) => { setBusy(true); window.location.href = `${APP_URL}/${path}` }
  return (
    <div className="co-step col">
      <div className="col" style={{ gap: 6 }}>
        <h1 className="co-h">Create your account</h1>
        <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6 }}>Two quick steps. Make your login in the journal, then pay on Stripe's secure page. You land back in your journal, unlocked.</p>
      </div>
      <div className="col" style={{ gap: 10 }}>
        {[
          [Lock, 'Step 1: email and password for your journal login.'],
          [ShieldCheck, 'Step 2: secure checkout by Stripe. LIMITLESS never sees your card.'],
          [RefreshCw, 'Cancel anytime. Your trades stay saved.'],
        ].map(([Icon, t]) => <div key={t} className="well row co-note"><Icon size={16} />{t}</div>)}
      </div>
      <button type="button" className="btn btn-primary btn-lg" onClick={() => go('?signup=1&plan=lite')} disabled={busy}>
        {busy ? <><span className="co-spin" /> Opening the journal</> : <>Create account and continue <ArrowRight size={16} /></>}
      </button>
      <p className="muted" style={{ fontSize: 13.5 }}>Already have an account? <button type="button" className="co-link" style={{ background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }} onClick={() => go('?login=1&plan=lite')}>Log in to subscribe</button></p>
      <p className="faint" style={{ fontSize: 12, lineHeight: 1.55 }}>By continuing you agree to the <Link to="/terms" className="co-link">Terms</Link> and <Link to="/privacy" className="co-link">Privacy Policy</Link>.</p>
    </div>
  )
}

function PaymentStep({ form, onBack, onPay, busy }) {
  return (
    <div className="co-step col">
      <div className="col" style={{ gap: 6 }}>
        <h1 className="co-h">Payment</h1>
        <p className="muted" style={{ fontSize: 14.5 }}>Signed up as <b style={{ color: '#fff', fontWeight: 600 }}>{form.email || 'you@email.com'}</b>. You finish on Stripe's secure checkout page, then come straight back to your journal.</p>
      </div>
      <div className="col" style={{ gap: 10 }}>
        {[
          [ShieldCheck, 'Card details go to Stripe only. LIMITLESS never sees them.'],
          [CreditCard, 'Pay by card, Apple Pay or Google Pay.'],
          [Tag, 'Have a promo code? Add it on the Stripe page.'],
          [RefreshCw, 'Cancel anytime. Your trades stay saved.'],
        ].map(([Icon, t]) => <div key={t} className="well row co-note"><Icon size={16} />{t}</div>)}
      </div>
      <button type="button" className="btn btn-primary btn-lg" onClick={onPay} disabled={busy}>
        {busy ? <><span className="co-spin" /> Opening secure checkout</> : <><Lock size={15} /> Continue to secure checkout · $15.00</>}
      </button>
      <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
        <button type="button" className="co-back" onClick={onBack}><ArrowLeft size={14} /> Back</button>
        <span className="faint" style={{ fontSize: 12 }}>Secure checkout by Stripe</span>
      </div>
    </div>
  )
}

function StripeStop({ onBack }) {
  return (
    <div className="co-step col co-stop">
      <span className="co-stop-ico glass"><Lock size={22} /></span>
      <h1 className="co-h">Stripe checkout opens here</h1>
      <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.65 }}>Once Stripe is connected, this button takes the trader to Stripe's payment page for $15 a month. After paying they land back in the journal, unlocked, with a welcome screen.</p>
      <div className="well col" style={{ borderRadius: 20, padding: '14px 16px', gap: 8, fontSize: 13.5 }}>
        {['Account created', 'Stripe checkout for LIMITLESS Lite', 'Back to the journal, plan active'].map((t, i) => (
          <span key={t} className="row" style={{ gap: 10 }}><span className={i === 0 ? 'co-dot done' : 'co-dot'}>{i === 0 ? <Check size={11} strokeWidth={3} /> : i + 1}</span>{t}</span>
        ))}
      </div>
      <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}>Preview: no account was created and nothing was charged</span>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-ghost" onClick={onBack}><ArrowLeft size={15} /> Back to payment</button>
        <Link to="/" className="btn btn-ghost">Back to the site</Link>
      </div>
    </div>
  )
}

export default function Checkout() {
  usePageMeta('Checkout | LIMITLESS', 'Start LIMITLESS Lite for $15 a month.')
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const pay = () => {
    setBusy(true)
    if (CHECKOUT_LIVE) {
      // Live: the journal app owns sign up and the Stripe session (api/billing?action=checkout),
      // so the site hands over with only the plan. No personal data goes in the URL.
      window.location.href = `${APP_URL}/?signup=1&plan=lite`
      return
    }
    setTimeout(() => { setBusy(false); setStep(2) }, 1100)
  }
  return (
    <div className="stage co">
      <Backdrop word="CHECKOUT" top={96} size={220} />
      <div className="wrap co-wrap">
        <div className="glass co-card page-in">
          <div className="row co-top">
            <Steps at={step} />
            <Link to="/" className="co-back"><ArrowLeft size={14} /> Back to site</Link>
          </div>
          <div className="co-grid">
            <Summary />
            <div key={step} className="co-pane">
              {step === 0 && (CHECKOUT_LIVE ? <LiveAccountStep /> : <AccountStep form={form} setForm={setForm} onNext={() => setStep(1)} />)}
              {step === 1 && <PaymentStep form={form} busy={busy} onBack={() => setStep(0)} onPay={pay} />}
              {step === 2 && <StripeStop onBack={() => setStep(1)} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
