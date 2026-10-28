import { useState } from 'react'
import { ArrowRight, Check, Lock } from 'lucide-react'
import { SIGNUP_URL, SUPABASE_URL, SUPABASE_HEADERS, wordSize } from '../lib/site.jsx'

export const LITE_FEATURES = [
  'Unlimited trades with chart screenshots',
  'Equity curve, P&L calendar and full analytics',
  'Setup grades, sessions and hour breakdown',
  'Psychology and discipline tracking',
  'Account rules: target, daily stop, consistency',
  'Trading plan with AI checklist',
  'CSV import and export',
  'Daily and weekly review emails',
]
const PRO_TEASE = ['Everything in Lite', 'Prop firm rule engines', 'Payout tracker and scaling planner', 'Multi account command center', 'Advanced analytics', 'Priority support']

// Pro early list: writes to the same waitlist table the old site used
function ProList() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | busy | done | already | error
  const submit = async (e) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(email)) { setState('error'); return }
    setState('busy')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: 'POST',
        headers: { ...SUPABASE_HEADERS, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      if (res.ok) return setState('done')
      const body = await res.json().catch(() => ({}))
      if (res.status === 409 || body.code === '23505') return setState('already')
      setState('error')
    } catch { setState('error') }
  }
  if (state === 'done' || state === 'already') {
    return <div className="well row" style={{ gap: 10, borderRadius: 99, padding: '0 18px', minHeight: 54, fontSize: 14 }}><span className="check" style={{ width: 24, height: 24 }}><Check size={12} strokeWidth={3} /></span>{state === 'done' ? 'You are on the Pro list.' : 'You are already on the list.'}</div>
  }
  return (
    <form onSubmit={submit} className="col" style={{ gap: 8 }} noValidate>
      <div className="well row" style={{ borderRadius: 99, padding: 5, gap: 6 }}>
        <label htmlFor="pro-email" className="sr">Email for the Pro list</label>
        <input id="pro-email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" className="input" value={email} onChange={(e) => { setEmail(e.target.value); if (state === 'error') setState('idle') }} style={{ height: 44, background: 'transparent', boxShadow: 'none', minWidth: 0 }} />
        <button type="submit" className="btn btn-ghost btn-sm" disabled={state === 'busy'} style={{ minHeight: 44 }}>{state === 'busy' ? 'Adding' : 'Notify me'}</button>
      </div>
      {state === 'error' && <span className="neg" role="alert" style={{ fontSize: 12.5, paddingLeft: 18 }}>Enter a valid email and try again.</span>}
    </form>
  )
}

export function PlanCards() {
  return (
    <div className="grid g2" style={{ gap: 18, alignItems: 'stretch' }}>
      <div className="glass col lift" style={{ padding: 30, gap: 0 }} data-reveal>
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="display" style={{ fontSize: 15, fontWeight: 500 }}>Lite</span>
          <span className="tag tag-solid">Available now</span>
        </div>
        <div className="row" style={{ alignItems: 'baseline', gap: 4 }}>
          <span className="big num" style={{ fontSize: 64 }}>$15</span>
          <span className="display" style={{ fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>/m</span>
        </div>
        <p className="muted" style={{ fontSize: 14, margin: '10px 0 22px' }}>The full journal. Cancel anytime.</p>
        <div style={{ height: 1, background: 'var(--line)', margin: '0 -30px 22px' }} />
        <ul className="col" style={{ gap: 14, marginBottom: 28, listStyle: 'none', padding: 0, marginTop: 0 }}>
          {LITE_FEATURES.map((t) => <li key={t} className="row" style={{ gap: 12, fontSize: 14, color: 'rgba(255,255,255,0.84)' }}><span className="check off"><Check size={13} strokeWidth={3} /></span>{t}</li>)}
        </ul>
        <a href={SIGNUP_URL} className="btn btn-primary btn-lg" style={{ marginTop: 'auto' }}>Get started <ArrowRight size={16} /></a>
      </div>

      <div className="glass col" style={{ padding: 30, gap: 0, overflow: 'hidden', '--i': 1 }} data-reveal aria-label="Pro plan, coming soon">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="display" style={{ fontSize: 15, fontWeight: 500 }}>Pro</span>
          <span className="tag tag-soft"><Lock size={11} /> Coming soon</span>
        </div>
        <div aria-hidden="true" style={{ filter: 'blur(9px)', opacity: 0.55, userSelect: 'none', pointerEvents: 'none' }}>
          <div className="row" style={{ alignItems: 'baseline', gap: 4 }}>
            <span className="big num" style={{ fontSize: 64 }}>$00</span>
            <span className="display" style={{ fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>/m</span>
          </div>
          <p className="muted" style={{ fontSize: 14, margin: '10px 0 22px' }}>Built for funded traders running real size.</p>
          <div style={{ height: 1, background: 'var(--line)', margin: '0 -30px 22px' }} />
          <div className="col" style={{ gap: 14, marginBottom: 28 }}>
            {PRO_TEASE.map((t) => <div key={t} className="row" style={{ gap: 12, fontSize: 14 }}><span className="check"><Check size={13} strokeWidth={3} /></span>{t}</div>)}
          </div>
        </div>
        <div className="pro-lock">
          <span className="ink" style={{ width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock size={20} /></span>
          <span className="display" style={{ fontSize: 19, fontWeight: 600 }}>More tools for funded traders</span>
          <span className="muted" style={{ fontSize: 13.5, maxWidth: 280 }}>Prop firm rule engines, payouts and multi account tracking. Get told the day it opens.</span>
        </div>
        <div style={{ marginTop: 'auto' }}><ProList /></div>
      </div>
    </div>
  )
}

export function PricingSection({ id = 'pricing', as = 'section' }) {
  const Tag = as
  const ws = wordSize('Pricing', 260)
  return (
    <Tag id={id} className="stage" style={{ paddingBlock: '120px 80px', scrollMarginTop: 40 }}>
      <div aria-hidden="true" className="backdrop">
        <div className="word" data-word="Pricing" style={{ top: 40, fontSize: ws }}>Pricing</div>
      </div>
      <div className="wrap" style={{ maxWidth: 1000, paddingTop: `calc(${ws} * 0.52)` }}>
        <PlanCards />
        <p className="faint" style={{ fontSize: 12.5, textAlign: 'center', marginTop: 22 }}>Prices in USD. Secure checkout by Stripe. Cancel anytime from your account.</p>
      </div>
    </Tag>
  )
}
