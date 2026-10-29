import { useEffect, useState } from 'react'
import { ShieldCheck, Lock, Check, Minus, Sunrise, Zap, MoonStar, CalendarCheck, ArrowRight, AlertTriangle, Trophy, Ban } from 'lucide-react'
import { CountUp } from './ui.jsx'
import { SIGNUP_URL } from '../lib/site.jsx'

// ── Real numbers from the live journal (admin panel, Oct 28 2026) ─────
const PROOF = [
  { v: 149, f: (v) => Math.round(v), label: 'traders journaling' },
  { v: 836, f: (v) => Math.round(v).toLocaleString('en-US'), label: 'trades logged' },
  { v: 175, f: (v) => '$' + Math.round(v) + 'K', label: 'P&L tracked' },
]
export function Proof() {
  return (
    <section className="wrap proof" aria-label="LIMITLESS in numbers">
      {PROOF.map((p, i) => (
        <div key={p.label} className="col proof-item" data-reveal style={{ '--i': i }}>
          <span className="big num proof-num"><CountUp value={p.v} format={p.f} /></span>
          <span className="muted" style={{ fontSize: 14 }}>{p.label}</span>
        </div>
      ))}
      <span className="proof-note faint">Live numbers from the journal, October 2026</span>
    </section>
  )
}

// ── Prop firm rule simulator ──────────────────────────────────────────
const ACC = { net: 2140, target: 3000, trailing: 2500, dailyStop: 600, bestDay: 610, maxShare: 0.3 }
const usd = (v) => (v < 0 ? '-' : '') + '$' + Math.abs(Math.round(v)).toLocaleString('en-US')

function sim(today) {
  const total = ACC.net + today
  const stopUsed = Math.max(0, -today) / ACC.dailyStop
  const ddLeft = Math.max(0, ACC.trailing + Math.min(0, today))
  const best = Math.max(ACC.bestDay, today)
  const share = total > 0 ? best / total : 1
  let status = 'safe', msg = 'Inside every rule. Trade your plan.'
  if (today <= -ACC.dailyStop) { status = 'bad'; msg = `Daily stop hit at ${usd(-ACC.dailyStop)}. LIMITLESS locks the rest of the day.` }
  else if (share > ACC.maxShare && today > ACC.bestDay) { status = 'warn'; msg = `Today would be ${Math.round(share * 100)}% of your profit. Over 30% delays the payout, so consider stopping here.` }
  else if (total >= ACC.target) { status = 'pass'; msg = 'Profit target reached inside the rules. Evaluation passed.' }
  else if (stopUsed >= 0.66) { status = 'warn'; msg = `${usd(ACC.dailyStop + today)} left before your daily stop.` }
  return { total, stopUsed, ddLeft, share, status, msg }
}

export function RuleSim() {
  const [today, setToday] = useState(180)
  const s = sim(today)
  const chip = { safe: ['Safe to trade', ShieldCheck], warn: ['Close to a rule', AlertTriangle], bad: ['Rule broken', Ban], pass: ['Passed', Trophy] }[s.status]
  const ChipIcon = chip[1]
  const rows = [
    { k: 'Profit target', v: `${usd(Math.max(0, s.total))} of ${usd(ACC.target)}`, p: s.total / ACC.target },
    { k: 'Trailing drawdown', v: `${usd(s.ddLeft)} left`, p: s.ddLeft / ACC.trailing },
    { k: 'Your daily stop', v: `${usd(Math.max(0, -today))} of ${usd(ACC.dailyStop)}`, p: s.stopUsed, bad: s.stopUsed >= 1, warn: s.stopUsed >= 0.66 },
    { k: 'Consistency, 30% max', v: `${Math.round(Math.min(1, s.share) * 100)}%`, p: s.share / ACC.maxShare, warn: s.share > 0.25, bad: s.share > ACC.maxShare },
  ]
  return (
    <section id="rules" className="wrap section" style={{ scrollMarginTop: 40 }}>
      <div className="grid g2" style={{ alignItems: 'center', gap: 48 }}>
        <div className="col" style={{ gap: 16 }} data-reveal>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}><ShieldCheck size={12} /> For funded traders</span>
          <h2 className="h-lg">See the breach before it happens.</h2>
          <p className="lead">Drag today's P&amp;L and watch an Apex 50K evaluation react. With Pro, LIMITLESS tracks this live while you trade: target, trailing drawdown, your daily stop and the consistency rule.</p>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}><Lock size={11} /> Pro feature, coming soon</span>
        </div>
        <div className={'glass panel sim sim-' + s.status} style={{ gap: 18, padding: 30, '--i': 1 }} data-reveal>
          <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
            <div className="col"><h3 style={{ fontSize: 18, fontWeight: 600 }}>Apex 50K evaluation</h3><span className="faint" style={{ fontSize: 12.5 }}>Sample account, try it</span></div>
            <span className={'tag sim-chip'}><ChipIcon size={13} /> {chip[0]}</span>
          </div>
          <div className="ink col" style={{ borderRadius: 22, padding: '16px 18px', gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <label htmlFor="sim-today" style={{ fontSize: 13, color: 'var(--fg2)' }}>Today's P&amp;L</label>
              <span className={'num display ' + (today >= 0 ? 'pos' : 'neg')} style={{ fontSize: 26, fontWeight: 700 }}>{today > 0 ? '+' : ''}{usd(today)}</span>
            </div>
            <input id="sim-today" type="range" className="sim-range" min="-800" max="1200" step="10" value={today} onChange={(e) => setToday(Number(e.target.value))} style={{ '--v': `${((today + 800) / 2000) * 100}%` }} />
            <div className="row num faint" style={{ justifyContent: 'space-between', fontSize: 11 }}><span>-$800</span><span>$0</span><span>+$1,200</span></div>
          </div>
          {rows.map((r) => (
            <div key={r.k} className="col" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}><span>{r.k}</span><span className="num" style={{ fontWeight: 600 }}>{r.v}</span></div>
              <div className="bar well"><i style={{ width: `${Math.max(2, Math.min(1, r.p) * 100)}%`, background: r.bad ? 'var(--neg)' : r.warn ? 'linear-gradient(90deg,#fff,#FFC98A)' : '#fff', transition: 'width .45s var(--ease), background .3s', animation: 'none' }} /></div>
            </div>
          ))}
          <p className="sim-msg" aria-live="polite">{s.msg}</p>
        </div>
      </div>
    </section>
  )
}

// ── A trading day with LIMITLESS ──────────────────────────────────────
const DAY = [
  { icon: Sunrise, time: 'Before the open', title: 'Plan', body: 'Your plan becomes a checklist. Bias, levels, news, ticked in a minute.' },
  { icon: Zap, time: 'During the session', title: 'Log', body: 'Every trade in about ten seconds, with the chart, your setup and your state.' },
  { icon: MoonStar, time: 'After the close', title: 'Review', body: 'A daily recap shows what worked, what leaked and which rule broke.' },
  { icon: CalendarCheck, time: 'Every weekend', title: 'Improve', body: 'The weekly report tells you which setups to size up and which to cut.' },
]
export function Day() {
  return (
    <section className="wrap section">
      <div className="col" style={{ gap: 14, maxWidth: 640, marginBottom: 40 }} data-reveal>
        <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}>How it fits your day</span>
        <h2 className="h-lg">A few minutes a day. A better trader every week.</h2>
      </div>
      <div className="day" data-reveal>
        <div className="day-line" aria-hidden="true"><i /></div>
        {DAY.map((d, i) => {
          const Icon = d.icon
          return (
            <div key={d.title} className="day-step col" style={{ '--i': i }}>
              <span className="day-ico glass"><Icon size={20} /></span>
              <span className="faint" style={{ fontSize: 12.5 }}>{d.time}</span>
              <h3 style={{ fontSize: 24, fontWeight: 600 }}>{d.title}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{d.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Compare ───────────────────────────────────────────────────────────
const COMPARE = [
  ['P&L and R calculated for you', 0, 0, 1],
  ['Chart screenshots on each trade', 1, 1, 1],
  ['Setup grades from your own results', 0, 0, 1],
  ['Cost of FOMO and revenge in dollars', 0, 0, 1],
  ['A review on every trade: reason, right, wrong', 0, 1, 1],
  ['Daily and weekly review emails', 0, 0, 1],
  ['Works on your phone in seconds', 0, 1, 1],
]
export function Compare() {
  const Cell = ({ v, me }) => <span className={'cmp-cell' + (me ? ' me' : '')}>{v ? <span className={me ? 'dot-ok' : 'dot-soft'}><Check size={10} strokeWidth={3} /></span> : <Minus size={14} className="faint" />}</span>
  return (
    <section className="wrap section" style={{ maxWidth: 1040 }}>
      <div className="col" style={{ gap: 14, alignItems: 'center', textAlign: 'center', marginBottom: 34 }} data-reveal>
        <span className="tag tag-soft">Why not a spreadsheet?</span>
        <h2 className="h-lg">A spreadsheet stores trades. LIMITLESS explains them.</h2>
      </div>
      <div className="glass cmp" data-reveal>
        <div className="cmp-row cmp-head">
          <span />
          <span className="cmp-cell">Spreadsheet</span>
          <span className="cmp-cell">Notes app</span>
          <span className="cmp-cell me"><b>LIMITLESS</b></span>
        </div>
        {COMPARE.map(([k, a, b, c]) => (
          <div key={k} className="cmp-row">
            <span className="cmp-k">{k}</span>
            <Cell v={a} /><Cell v={b} /><Cell v={c} me />
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Sticky start bar on phones ────────────────────────────────────────
export function StickyCta() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const calc = () => {
      raf = 0
      const y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight
      const pricing = document.getElementById('pricing')
      const inPricing = pricing ? (() => { const r = pricing.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0 })() : false
      setShow(y > 700 && y < h - 500 && !inPricing)
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(calc) }
    calc()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  return (
    <div className={'sticky-cta glass' + (show ? ' on' : '')} aria-hidden={!show}>
      <div className="col" style={{ minWidth: 0 }}><b style={{ fontSize: 14 }}>LIMITLESS Lite</b><span className="faint" style={{ fontSize: 12 }}>$15 a month · cancel anytime</span></div>
      <a href={SIGNUP_URL} className="btn btn-primary btn-sm" tabIndex={show ? 0 : -1}>Start <ArrowRight size={14} /></a>
    </div>
  )
}
