import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { LayoutDashboard, BookOpen, BarChart3, CalendarDays, Brain, Settings, Plus, Check, House, ListChecks, User, Wifi, BatteryFull, SignalHigh, RefreshCw, ShieldCheck } from 'lucide-react'
import { smooth } from './ui.jsx'
import { EQUITY, DAILY } from '../lib/sample.js'
import { LOGO } from './ui.jsx'

// ── Story timeline (ms) ───────────────────────────────────────────────
// A trade gets logged on the phone, then lands on the tablet a moment later.
const LOOP = 15000
const T = { typeStart: 500, typeEnd: 2700, press: 2950, saved: 3250, sync: 3700, toastEnd: 6800, today: 5600, mind: 10300 }
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v))
const typed = (text, t, start, end) => text.slice(0, Math.round(clamp((t - start) / (end - start)) * text.length))

function useStory(stageRef) {
  const [t, setT] = useState(T.today + 600)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = true, start = performance.now(), id
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.05 })
    if (stageRef.current) io.observe(stageRef.current)
    setT(0)
    id = setInterval(() => {
      if (!visible || document.hidden) { start += 100; return }
      setT((performance.now() - start) % LOOP)
    }, 100)
    return () => { clearInterval(id); io.disconnect() }
  }, [stageRef])
  return t
}

// Smoothly follows a target number
function useTween(target, ms = 900) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const a = from.current, b = target, s = performance.now()
    if (a === b) return
    let raf
    const tick = (now) => {
      const p = clamp((now - s) / ms)
      const val = a + (b - a) * (1 - Math.pow(1 - p, 4))
      setV(val); from.current = val
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

// Renders children at a fixed design size and scales them to the frame width
function Scaled({ w, h, children, className = '' }) {
  const ref = useRef(null)
  const [s, setS] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setS(el.offsetWidth / w)
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (ro) ro.observe(el)
    return () => ro && ro.disconnect()
  }, [w])
  return (
    <div ref={ref} className={'screen ' + className} style={{ aspectRatio: `${w} / ${h}` }}>
      <div style={{ width: w, height: h, transform: `scale(${s})`, transformOrigin: '0 0', visibility: s ? 'visible' : 'hidden' }}>{children}</div>
    </div>
  )
}

const usd = (v, cents = true) => (v < 0 ? '-' : '') + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })

// ── Tablet: the dashboard ─────────────────────────────────────────────
function MiniChart() {
  const W = 720, H = 236, top = 30, bottom = H - 8
  const max = 3000, min = Math.min(0, ...EQUITY.map((p) => p.value))
  const pts = EQUITY.map((p, i) => [6 + (i / (EQUITY.length - 1)) * (W - 22), bottom - ((p.value - min) / (max - min)) * (bottom - top)])
  const line = smooth(pts)
  const last = pts[pts.length - 1]
  const tY = bottom - ((3000 - min) / (max - min)) * (bottom - top)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block', overflow: 'visible' }} aria-hidden="true">
      <defs><linearGradient id="tabFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".2" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      <line x1="6" x2={W - 16} y1={tY} y2={tY} stroke="rgba(255,255,255,.28)" strokeDasharray="2 7" />
      <text x="6" y={tY - 9} fill="rgba(255,255,255,.5)" style={{ font: '500 12px Inter, sans-serif' }}>Profit target $3,000</text>
      <path d={`${line} L${last[0]} ${H} L6 ${H} Z`} fill="url(#tabFill)" style={{ animation: 'fade 1.2s var(--ease) 1.4s both' }} />
      <path d={line} fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" pathLength="1" strokeDasharray="1" style={{ animation: 'draw 2s var(--ease) 1s both', filter: 'drop-shadow(0 0 8px rgba(255,255,255,.5))' }} />
      <line x1={last[0]} x2={last[0]} y1={last[1]} y2={H} stroke="rgba(255,255,255,.55)" strokeDasharray="4 6" style={{ animation: 'fade .6s 2.8s both' }} />
      <circle cx={last[0]} cy={last[1]} r="9" fill="#000" stroke="#fff" strokeWidth="4" style={{ transformOrigin: `${last[0]}px ${last[1]}px`, animation: 'pop .6s var(--spring) 2.8s both' }} />
    </svg>
  )
}

function MiniCalendar({ synced }) {
  const byDay = Object.fromEntries(DAILY.map((d) => [d.day, d.net]))
  const weeks = [[null, null, null, 1, 2], [5, 6, 7, 8, 9], [12, 13, 14, 15, 16], [19, 20, 21, 22, 23], [26, 27, 28, 29, 30]]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
      {['M', 'T', 'W', 'T', 'F'].map((d, i) => <span key={i} style={{ fontSize: 11, color: 'var(--fg3)', textAlign: 'center' }}>{d}</span>)}
      {weeks.flat().map((d, i) => {
        if (!d) return <span key={i} />
        const n = d === 28 ? (synced ? 530 : null) : byDay[d]
        const has = n !== undefined && n !== null
        const a = has ? 0.18 + Math.min(1, Math.abs(n) / 640) * 0.6 : 0
        return (
          <span key={i} className="num" style={{
            height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600,
            background: has ? (n >= 0 ? `rgba(255,255,255,${a})` : `rgba(255,169,161,${a * 0.8})`) : 'rgba(255,255,255,.04)',
            color: has && n >= 0 && a > 0.5 ? '#000' : d > 28 ? 'rgba(255,255,255,.25)' : '#fff',
            boxShadow: d === 28 ? '0 0 0 2px #fff' + (synced ? ', 0 0 18px rgba(255,255,255,.5)' : '') : 'none',
            transition: 'background .6s, box-shadow .6s, color .6s',
          }}>{d}</span>
        )
      })}
    </div>
  )
}

const ROWS = [
  { d: 'Oct 27', s: 'MNQ', side: 'Short', set: 'Breaker block', pnl: -50, r: '-0.5R' },
  { d: 'Oct 26', s: 'NQ', side: 'Long', set: 'FVG fill', pnl: 210, r: '1.2R' },
  { d: 'Oct 26', s: 'ES', side: 'Long', set: 'Liquidity sweep', pnl: -360, r: '-1.0R' },
]
const NEW_ROW = { d: 'Oct 28', s: 'NQ', side: 'Long', set: 'OTE retrace', pnl: 530, r: '1.9R', fresh: true }

const TabletScreen = memo(function TabletScreen({ synced, toast }) {
  const net = useTween(synced ? 2140 : 1610)
  const wr = useTween(synced ? 54 : 53.3)
  const rows = synced ? [NEW_ROW, ...ROWS] : ROWS
  const nav = [LayoutDashboard, BookOpen, BarChart3, CalendarDays, Brain, Settings]
  return (
    <div className="tab-ui">
      <aside className="tab-side">
        <span className="ink" style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><img src={LOGO} alt="" style={{ width: 24 }} /></span>
        {nav.map((Icon, i) => <span key={i} className={i === 0 ? 'tab-nav on' : 'tab-nav'}><Icon size={19} /></span>)}
      </aside>
      <div className="tab-main">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 13, color: 'var(--fg3)' }}>Wednesday, Oct 28</span>
            <span className="display" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>Dashboard</span>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <div className="well row" style={{ borderRadius: 99, padding: 4, gap: 2, fontSize: 13 }}>
              {['Week', 'Month', 'Year'].map((l) => <span key={l} style={{ padding: '8px 14px', borderRadius: 99, fontWeight: 500, background: l === 'Month' ? '#fff' : 'transparent', color: l === 'Month' ? '#000' : 'var(--fg2)' }}>{l}</span>)}
            </div>
            <span className="row" style={{ gap: 6, background: '#fff', color: '#000', borderRadius: 99, padding: '0 16px', height: 40, fontSize: 13, fontWeight: 600 }}><Plus size={15} /> Log trade</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[
            ['Net P&L', '$' + Math.round(net).toLocaleString('en-US'), synced ? '+$530 today' : 'October'],
            ['Win rate', wr.toFixed(0) + '%', synced ? '33 of 61 trades' : '32 of 60 trades'],
            ['Profit factor', '1.60', 'Above 1.5 target'],
            ['Discipline', synced ? '92' : '91', 'Rules kept'],
          ].map(([k, v, s], i) => (
            <div key={k} className="well col" style={{ borderRadius: 20, padding: '16px 18px', gap: 4, boxShadow: i === 0 && toast ? 'inset 0 0 0 1px rgba(255,255,255,.5), 0 0 30px rgba(255,255,255,.12)' : undefined, transition: 'box-shadow .6s' }}>
              <span style={{ fontSize: 12.5, color: 'var(--fg3)' }}>{k}</span>
              <span className="num display" style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em' }}>{v}</span>
              <span style={{ fontSize: 12, color: i === 0 && synced ? 'var(--pos)' : 'var(--fg3)', transition: 'color .6s' }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>
          <div className="well col" style={{ borderRadius: 22, padding: '18px 20px 14px', gap: 6 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Equity · Apex 50K eval</span>
              <span style={{ fontSize: 12, color: 'var(--fg3)' }}>71% to target</span>
            </div>
            <MiniChart />
          </div>
          <div className="well col" style={{ borderRadius: 22, padding: '18px 18px', gap: 12 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontSize: 14, fontWeight: 600 }}>October</span><span style={{ fontSize: 12, color: 'var(--fg3)' }}>P&amp;L calendar</span></div>
            <MiniCalendar synced={synced} />
          </div>
        </div>

        <div className="well col" style={{ borderRadius: 22, padding: '8px 20px', overflow: 'hidden', flex: 1 }}>
          {rows.slice(0, 4).map((r) => (
            <div key={r.d + r.set} className={'tab-row' + (r.fresh ? ' fresh' : '')}>
              <span style={{ width: 70, color: 'var(--fg3)' }}>{r.d}</span>
              <span className="ink" style={{ width: 46, height: 30, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>{r.s}</span>
              <span style={{ width: 60, color: 'var(--fg2)' }}>{r.side}</span>
              <span style={{ flex: 1 }}>{r.set}</span>
              <span className="num" style={{ width: 64, color: 'var(--fg2)', textAlign: 'right' }}>{r.r}</span>
              <span className="num" style={{ width: 90, textAlign: 'right', fontWeight: 600, color: r.pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{(r.pnl > 0 ? '+' : '') + usd(r.pnl, false)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={'tab-toast' + (toast ? ' on' : '')}><RefreshCw size={15} /> New trade synced from your phone</div>
    </div>
  )
})

// ── Phone: log, today, mind ───────────────────────────────────────────
function StatusBar() {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '14px 26px 0 30px', fontSize: 14, fontWeight: 600, height: 44 }}>
      <span className="num">9:41</span>
      <span className="row" style={{ gap: 5 }}><SignalHigh size={15} /><Wifi size={15} /><BatteryFull size={19} /></span>
    </div>
  )
}

function Field({ label, value, focus }) {
  return (
    <div className="col" style={{ gap: 5, flex: 1, minWidth: 0 }}>
      <span style={{ fontSize: 11, color: 'var(--fg3)' }}>{label}</span>
      <span className="num well" style={{ height: 42, borderRadius: 13, display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 15, fontWeight: 500, boxShadow: focus ? 'inset 0 0 0 1.5px #fff' : undefined }}>
        {value}{focus && <i className="caret" />}
      </span>
    </div>
  )
}

function LogScreen({ t }) {
  const f = (txt, i) => typed(txt, t, T.typeStart + i * 550, T.typeStart + i * 550 + 480)
  const which = t < T.typeStart ? -1 : Math.min(3, Math.floor((t - T.typeStart) / 550))
  const done = t >= T.typeEnd
  const pressed = t >= T.press && t < T.saved
  const saved = t >= T.saved
  return (
    <div className="col" style={{ padding: '6px 20px 0', gap: 14, height: '100%' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="display" style={{ fontSize: 24, fontWeight: 600 }}>New trade</span>
        <span style={{ fontSize: 13, color: 'var(--fg3)' }}>Oct 28 · 10:02</span>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <span style={{ background: '#fff', color: '#000', borderRadius: 99, padding: '7px 14px', fontSize: 13, fontWeight: 600 }}>NQ</span>
        <div className="well row" style={{ borderRadius: 99, padding: 3, fontSize: 13 }}>
          <span style={{ padding: '5px 14px', borderRadius: 99, background: '#fff', color: '#000', fontWeight: 600 }}>Long</span>
          <span style={{ padding: '5px 12px', color: 'var(--fg2)' }}>Short</span>
        </div>
        <span className="well" style={{ borderRadius: 99, padding: '7px 12px', fontSize: 13, color: 'var(--fg2)' }}>1 ct</span>
      </div>
      <div className="row" style={{ gap: 10 }}>
        <Field label="Entry" value={f('21,142.25', 0)} focus={which === 0} />
        <Field label="Stop" value={f('21,128.00', 1)} focus={which === 1} />
      </div>
      <div className="row" style={{ gap: 10 }}>
        <Field label="Exit" value={f('21,168.75', 2)} focus={which === 2} />
        <Field label="Setup" value={f('OTE retrace', 3)} focus={which === 3 && !done} />
      </div>
      <div className="col" style={{ gap: 7 }}>
        <span style={{ fontSize: 11, color: 'var(--fg3)' }}>How did you feel?</span>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          {['Focused', 'Patient', 'FOMO', 'Hesitant'].map((s) => <span key={s} style={{ borderRadius: 99, padding: '6px 12px', fontSize: 12.5, fontWeight: 500, transition: 'all .4s', background: s === 'Focused' && done ? '#fff' : 'rgba(255,255,255,.06)', color: s === 'Focused' && done ? '#000' : 'var(--fg2)' }}>{s}</span>)}
        </div>
      </div>
      <div className="ink row" style={{ borderRadius: 18, padding: '14px 16px', justifyContent: 'space-between', opacity: done ? 1 : 0.35, transition: 'opacity .5s' }}>
        <div className="col"><span style={{ fontSize: 11, color: 'var(--fg3)' }}>P&amp;L</span><span className="num display pos" style={{ fontSize: 24, fontWeight: 700 }}>{done ? '+$530.00' : '$0.00'}</span></div>
        <div className="col" style={{ alignItems: 'flex-end' }}><span style={{ fontSize: 11, color: 'var(--fg3)' }}>Result</span><span className="num display" style={{ fontSize: 20, fontWeight: 600 }}>{done ? '1.9R' : '0R'}</span></div>
      </div>
      <span className="row" style={{ marginTop: 'auto', marginBottom: 14, height: 52, borderRadius: 99, justifyContent: 'center', gap: 8, fontWeight: 600, fontSize: 15, background: saved ? 'rgba(166,242,190,1)' : '#fff', color: '#000', transform: pressed ? 'scale(.95)' : 'none', transition: 'transform .25s var(--spring), background .4s', boxShadow: '0 0 24px rgba(255,255,255,.25)' }}>
        {saved ? <><Check size={17} strokeWidth={3} /> Saved</> : 'Save trade'}
      </span>
    </div>
  )
}

const TodayScreen = memo(function TodayScreen() {
  const rules = ['Risk 1R or less', 'Stop after 2 losses', 'Max 3 trades', 'NY AM only', 'No red news']
  return (
    <div className="col" style={{ padding: '6px 20px 0', gap: 16 }}>
      <span style={{ fontSize: 13, color: 'var(--fg3)' }}>Today</span>
      <span className="num display" style={{ fontSize: 46, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginTop: -8 }}>+$530<span style={{ color: 'var(--fg3)', fontSize: 28 }}>.00</span></span>
      <div className="row" style={{ gap: 8 }}>
        <span className="well" style={{ borderRadius: 99, padding: '6px 12px', fontSize: 12.5 }}>1 trade</span>
        <span className="well" style={{ borderRadius: 99, padding: '6px 12px', fontSize: 12.5 }}>1.9R</span>
        <span style={{ borderRadius: 99, padding: '6px 12px', fontSize: 12.5, background: '#fff', color: '#000', fontWeight: 600 }}>A+ setup</span>
      </div>
      <div className="well col" style={{ borderRadius: 22, padding: 16, gap: 11 }}>
        <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontWeight: 600, fontSize: 14 }}>Rules kept</span><span className="num" style={{ fontWeight: 700 }}>5/5</span></div>
        {rules.map((r, i) => (
          <div key={r} className="row" style={{ gap: 10, fontSize: 13, animation: `rise .5s var(--ease) ${0.15 + i * 0.08}s both` }}>
            <span style={{ width: 22, height: 22, borderRadius: 99, background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(255,255,255,.35)' }}><Check size={12} strokeWidth={3} /></span>{r}
          </div>
        ))}
      </div>
      <div className="ink col" style={{ borderRadius: 20, padding: '14px 16px', gap: 8 }}>
        <div className="row" style={{ justifyContent: 'space-between', fontSize: 12.5 }}><span style={{ color: 'var(--fg3)' }}>Apex 50K · to target</span><span className="num" style={{ fontWeight: 600 }}>$860</span></div>
        <div style={{ height: 9, borderRadius: 99, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: '71%', borderRadius: 99, background: '#fff', transformOrigin: 'left', animation: 'growX 1.1s var(--ease) .3s both', boxShadow: '0 0 10px rgba(255,255,255,.5)' }} /></div>
      </div>
      <div className="well row" style={{ borderRadius: 20, padding: '12px 14px', gap: 12, animation: 'rise .5s var(--ease) .6s both' }}>
        <span className="ink" style={{ width: 44, height: 44, borderRadius: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1 }}><b style={{ fontSize: 13 }}>NQ</b><small style={{ fontSize: 8, color: 'var(--fg3)', letterSpacing: '.1em' }}>LONG</small></span>
        <div className="col" style={{ flex: 1 }}><span style={{ fontSize: 14, fontWeight: 500 }}>OTE retrace</span><span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>10:02 · Focused</span></div>
        <span className="num pos" style={{ fontWeight: 700 }}>+$530</span>
      </div>
    </div>
  )
})

const MindScreen = memo(function MindScreen() {
  const bars = [['Focused', 92, true], ['Patient', 55], ['Calm', 30], ['Hesitant', 16], ['FOMO', 28, false, true], ['Revenge', 22, false, true]]
  return (
    <div className="col" style={{ padding: '6px 20px 0', gap: 16 }}>
      <span style={{ fontSize: 13, color: 'var(--fg3)' }}>Psychology · October</span>
      <span className="display" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15, marginTop: -8 }}>You trade best when you are focused.</span>
      <div className="well" style={{ borderRadius: 22, padding: '18px 14px 12px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, alignItems: 'end' }}>
        {bars.map(([l, h, peak, bad], i) => (
          <div key={l} className="col" style={{ alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 150, borderRadius: 99, background: 'rgba(255,255,255,.06)', position: 'relative', overflow: 'hidden' }}>
              <i style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h + '%', borderRadius: 99, background: bad ? 'rgba(255,169,161,.9)' : peak ? '#fff' : 'rgba(255,255,255,.55)', transformOrigin: 'bottom', animation: `growY .9s var(--ease) ${0.1 + i * 0.07}s both`, boxShadow: peak ? '0 0 12px rgba(255,255,255,.5)' : 'none' }} />
            </div>
            <span style={{ fontSize: 9.5, color: 'var(--fg2)' }}>{l}</span>
          </div>
        ))}
      </div>
      <div className="ink row" style={{ borderRadius: 20, padding: '14px 16px', gap: 12, fontSize: 13, lineHeight: 1.45 }}>
        <Brain size={18} style={{ flexShrink: 0 }} />
        <span>FOMO and revenge cost you <b className="neg">$850</b> this month.</span>
      </div>
      <div className="well col" style={{ borderRadius: 20, padding: '14px 16px', gap: 4, animation: 'rise .5s var(--ease) .5s both' }}>
        <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>Your best window</span>
        <div className="row" style={{ justifyContent: 'space-between' }}><span className="display" style={{ fontSize: 18, fontWeight: 600 }}>9:30 to 10:30</span><span className="num pos" style={{ fontWeight: 700 }}>+$1,320</span></div>
      </div>
    </div>
  )
})

function PhoneScreen({ t }) {
  const idx = t < T.today ? 0 : t < T.mind ? 1 : 2
  const tabs = [House, ListChecks, BarChart3, User]
  return (
    <div className="ph-ui">
      <div className="island" />
      <StatusBar />
      <div style={{ position: 'relative', flex: 1 }}>
        {[<LogScreen key="l" t={t} />, <TodayScreen key="t" />, <MindScreen key="m" />].map((el, i) => {
          const prev = (idx + 2) % 3
          return <div key={i} className={'ph-screen' + (i === idx ? ' on' : i === prev ? ' past' : '')}>{i === idx || i === prev ? el : null}</div>
        })}
      </div>
      <div className="ph-tabs">
        {tabs.map((Icon, i) => <span key={i} className={(idx === 0 && i === 1) || (idx === 1 && i === 0) || (idx === 2 && i === 2) ? 'on' : ''}><Icon size={20} /></span>)}
      </div>
      <div className="home-bar" />
    </div>
  )
}

// ── The stage ─────────────────────────────────────────────────────────
export default function HeroDevices() {
  const stage = useRef(null)
  const inner = useRef(null)
  const raw = useStory(stage)
  // between key moments nothing on screen changes, so snap time to the last moment
  const marks = [0, T.typeStart, T.typeEnd, T.press, T.saved, T.sync, T.today, T.toastEnd, T.mind]
  const t = raw >= T.typeStart && raw <= T.typeEnd + 200 ? raw : Math.max(...marks.filter((m) => m <= raw))
  const synced = t >= T.sync
  const toast = t >= T.sync && t < T.toastEnd

  // Devices start tipped back and settle flat as the page scrolls
  useEffect(() => {
    const el = inner.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 700px)').matches) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = stage.current.getBoundingClientRect()
        const p = clamp(1 - (r.top - window.innerHeight * 0.18) / (window.innerHeight * 0.62))
        el.style.setProperty('--p', p.toFixed(3))
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div ref={stage} className="devices" aria-label="LIMITLESS on a tablet and a phone, with sample data" role="img">
      <div className="devices-glow" aria-hidden="true" />
      <div ref={inner} className="devices-inner">
        <div className="tablet">
          <Scaled w={1180} h={820}><TabletScreen synced={synced} toast={toast} /></Scaled>
        </div>
        <div className="phone">
          <Scaled w={330} h={714}><PhoneScreen t={t} /></Scaled>
        </div>
      </div>
      <div className="glass float dev-chip chip-a" aria-hidden="true"><ShieldCheck size={15} /> 5/5 rules kept</div>
      <div className={'glass dev-chip chip-b' + (synced ? ' on' : '')} aria-hidden="true"><span className="num pos" style={{ fontWeight: 600 }}>+1.9R</span> logged in 10 seconds</div>
    </div>
  )
}
