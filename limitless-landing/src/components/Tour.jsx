import { useEffect, useRef, useState } from 'react'
import { LayoutDashboard, BookOpen, BarChart3, ShieldCheck, Brain, Settings, Check, Image as ImageIcon, Lock } from 'lucide-react'
import { Scaled, TabletScreen } from './Devices.jsx'
import { LOGO } from './ui.jsx'
import { Corners } from './Hud.jsx'

// ── Shared app shell (same look as the hero tablet) ───────────────────
const NAV = [LayoutDashboard, BookOpen, BarChart3, ShieldCheck, Brain, Settings]
function Shell({ on, title, sub, right, children }) {
  return (
    <div className="tab-ui">
      <aside className="tab-side">
        <span className="ink" style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}><img src={LOGO} alt="" style={{ width: 24 }} /></span>
        {NAV.map((Icon, i) => <span key={i} className={i === on ? 'tab-nav on' : 'tab-nav'}><Icon size={19} /></span>)}
      </aside>
      <div className="tab-main">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="col" style={{ gap: 2 }}>
            <span style={{ fontSize: 13, color: 'var(--fg3)' }}>{sub}</span>
            <span className="display" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</span>
          </div>
          {right}
        </div>
        {children}
      </div>
    </div>
  )
}
const Card = ({ children, style, className = '' }) => <div className={'well col ' + className} style={{ borderRadius: 22, padding: '18px 20px', gap: 12, ...style }}>{children}</div>
const H = ({ children, aside }) => <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontSize: 14, fontWeight: 600 }}>{children}</span>{aside && <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{aside}</span>}</div>
const Pill = ({ children, solid }) => <span style={{ padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 500, background: solid ? '#fff' : 'rgba(255,255,255,.07)', color: solid ? '#000' : 'var(--fg2)' }}>{children}</span>

// ── Journal: trade list + one trade opened with its chart ─────────────
function Candles() {
  // deterministic sample: drift down into a sweep, then a displacement rally
  const W = 560, H = 260, n = 38
  let p = 100, seed = 7
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 }
  const c = Array.from({ length: n }, (_, i) => {
    const drift = i < 18 ? -0.55 : i < 21 ? -1.6 : i < 24 ? 2.6 : 0.9
    const o = p, cl = p + drift + (rnd() - 0.5) * 2.2
    const hi = Math.max(o, cl) + rnd() * 1.4, lo = Math.min(o, cl) - rnd() * 1.4 - (i === 20 ? 3 : 0)
    p = cl
    return { o, c: cl, h: hi, l: lo }
  })
  const max = Math.max(...c.map((k) => k.h)) + 2, min = Math.min(...c.map((k) => k.l)) - 2
  const y = (v) => 10 + ((max - v) / (max - min)) * (H - 20)
  const bw = W / n
  const entry = c[22].o, stop = c[20].l - 0.4, exit = c[33].c
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} aria-hidden="true">
      <rect x={bw * 22} y={y(exit)} width={bw * 12} height={y(entry) - y(exit)} fill="rgba(166,242,190,.08)" />
      <rect x={bw * 22} y={y(entry)} width={bw * 12} height={y(stop) - y(entry)} fill="rgba(255,169,161,.08)" />
      {[['Exit', exit, 'rgba(166,242,190,.9)'], ['Entry', entry, '#fff'], ['Stop', stop, 'rgba(255,169,161,.9)']].map(([l, v, col]) => (
        <g key={l}><line x1={bw * 22} x2={W} y1={y(v)} y2={y(v)} stroke={col} strokeDasharray="4 5" /><text x={W - 4} y={y(v) - 5} textAnchor="end" fill={col} style={{ font: '600 11px Inter, sans-serif' }}>{l}</text></g>
      ))}
      {c.map((k, i) => {
        const up = k.c >= k.o, col = up ? '#fff' : 'rgba(255,255,255,.35)'
        return <g key={i}><line x1={bw * i + bw / 2} x2={bw * i + bw / 2} y1={y(k.h)} y2={y(k.l)} stroke={col} /><rect x={bw * i + 2} y={y(Math.max(k.o, k.c))} width={bw - 4} height={Math.max(1.5, Math.abs(y(k.o) - y(k.c)))} rx="1.5" fill={up ? '#fff' : 'rgba(255,255,255,.18)'} stroke={col} strokeWidth=".6" /></g>
      })}
      <circle cx={bw * 20 + bw / 2} cy={y(c[20].l)} r="11" fill="none" stroke="rgba(255,255,255,.5)" strokeDasharray="3 3" />
      <text x={bw * 20 + bw / 2} y={y(c[20].l) + 26} textAnchor="middle" fill="rgba(255,255,255,.6)" style={{ font: '500 11px Inter, sans-serif' }}>Sweep</text>
    </svg>
  )
}

const TRADES = [
  ['Oct 28', 'NQ', 'Long', 'OTE retrace', 530, '1.9R', true],
  ['Oct 27', 'MNQ', 'Short', 'Breaker block', -50, '-0.5R'],
  ['Oct 26', 'NQ', 'Long', 'FVG fill', 210, '1.2R'],
  ['Oct 26', 'ES', 'Long', 'Liquidity sweep', -360, '-1.0R'],
  ['Oct 23', 'NQ', 'Short', 'OTE retrace', 420, '2.1R'],
  ['Oct 22', 'NQ', 'Long', 'Unplanned', -280, '-1.4R'],
  ['Oct 21', 'GC', 'Long', 'Liquidity sweep', 390, '1.6R'],
  ['Oct 20', 'NQ', 'Short', 'FVG fill', -150, '-0.8R'],
]
function JournalScreen() {
  return (
    <Shell on={1} title="Journal" sub="61 trades · October" right={<div className="row" style={{ gap: 8 }}><Pill solid>All</Pill><Pill>Wins</Pill><Pill>Losses</Pill><Pill>A+ only</Pill></div>}>
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 14, flex: 1, minHeight: 0 }}>
        <Card style={{ padding: '6px 16px', gap: 0 }}>
          {TRADES.map(([d, s, side, set, pnl, r, on]) => (
            <div key={d + set} className="row" style={{ gap: 12, height: 72, borderTop: on ? 'none' : '1px solid var(--line)', fontSize: 13.5, margin: on ? '6px -8px' : 0, padding: on ? '0 8px' : 0, borderRadius: on ? 16 : 0, background: on ? 'rgba(255,255,255,.08)' : 'none', boxShadow: on ? 'inset 0 0 0 1px rgba(255,255,255,.25)' : 'none' }}>
              <span className="ink" style={{ width: 46, height: 40, borderRadius: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1 }}><b style={{ fontSize: 12.5 }}>{s}</b><small style={{ fontSize: 8, color: 'var(--fg3)' }}>{side.toUpperCase()}</small></span>
              <div className="col" style={{ flex: 1 }}><span style={{ fontWeight: 500 }}>{set}</span><span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>{d} · {r}</span></div>
              <span className="num" style={{ fontWeight: 600, color: pnl >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{pnl > 0 ? '+' : '-'}${Math.abs(pnl)}</span>
            </div>
          ))}
        </Card>
        <Card style={{ gap: 14 }}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="col"><span className="display" style={{ fontSize: 22, fontWeight: 600 }}>NQ Long · OTE retrace</span><span style={{ fontSize: 12.5, color: 'var(--fg3)' }}>Oct 28 · 10:02 to 10:41 · 1 contract</span></div>
            <div className="col" style={{ alignItems: 'flex-end' }}><span className="num display pos" style={{ fontSize: 28, fontWeight: 700 }}>+$530.00</span><span className="num" style={{ fontSize: 13, color: 'var(--fg2)' }}>1.9R · 26.5 pts</span></div>
          </div>
          <div className="ink" style={{ borderRadius: 18, padding: '12px 14px', position: 'relative' }}>
            <span className="row" style={{ position: 'absolute', left: 14, top: 10, gap: 6, fontSize: 11, color: 'var(--fg3)' }}><ImageIcon size={12} /> 5m chart screenshot</span>
            <Candles />
          </div>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}><Pill solid>Focused</Pill><Pill>A+ setup</Pill><Pill>NY AM</Pill><Pill>Followed plan</Pill></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="col" style={{ gap: 6, fontSize: 13 }}>
              <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>Rules</span>
              {['Risk 1R or less', 'Max 3 trades', 'NY AM killzone', 'No red news'].map((t) => <span key={t} className="row" style={{ gap: 8 }}><span className="dot-ok"><Check size={10} strokeWidth={3} /></span>{t}</span>)}
            </div>
            <div className="col" style={{ gap: 6 }}>
              <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>Notes</span>
              <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--fg2)' }}>Waited for the sweep of the Asia low, entered on the retrace into the FVG. Partials at 1R, runner to the high.</span>
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  )
}

// ── Analytics ─────────────────────────────────────────────────────────
function AnalyticsScreen() {
  const setups = [['OTE retrace', 'A+', 22, 68, 1840], ['Liquidity sweep', 'A', 16, 61, 760], ['FVG fill', 'B', 13, 52, 140], ['Breaker block', 'C', 6, 45, -120], ['Unplanned', 'D', 4, 31, -480]]
  const days = [['Mon', 480], ['Tue', 310], ['Wed', 690], ['Thu', -220], ['Fri', 880]]
  const rdist = [1, 2, 5, 9, 6, 3, 8, 11, 7, 5, 3, 1]
  return (
    <Shell on={2} title="Analytics" sub="October · Apex 50K eval" right={<div className="row" style={{ gap: 8 }}><Pill>Week</Pill><Pill solid>Month</Pill><Pill>All time</Pill></div>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
        {[['Net P&L', '$2,140'], ['Win rate', '54%'], ['Profit factor', '1.60'], ['Avg win', '$312'], ['Avg loss', '-$198']].map(([k, v]) => (
          <Card key={k} style={{ gap: 2, padding: '14px 16px' }}><span style={{ fontSize: 12, color: 'var(--fg3)' }}>{k}</span><span className="num display" style={{ fontSize: 26, fontWeight: 700 }}>{v}</span></Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14, flex: 1, minHeight: 0 }}>
        <Card style={{ gap: 4 }}>
          <H aside="Graded by results">Setups</H>
          <div className="row" style={{ fontSize: 11.5, color: 'var(--fg3)', gap: 12, padding: '6px 0' }}><span style={{ width: 36 }}>Grade</span><span style={{ flex: 1 }}>Setup</span><span style={{ width: 54, textAlign: 'right' }}>Trades</span><span style={{ width: 120 }}>Win rate</span><span style={{ width: 70, textAlign: 'right' }}>Net</span></div>
          {setups.map(([n, g, t, w, net], i) => (
            <div key={n} className="row" style={{ gap: 12, height: 50, borderTop: '1px solid var(--line)', fontSize: 13.5 }}>
              <span style={{ width: 36 }}><span className={'grade' + (i === 0 ? ' top' : g === 'D' ? ' bad' : '')}>{g}</span></span>
              <span style={{ flex: 1 }}>{n}</span>
              <span className="num" style={{ width: 54, textAlign: 'right', color: 'var(--fg2)' }}>{t}</span>
              <span className="row" style={{ width: 120, gap: 8 }}><span style={{ flex: 1, height: 7, borderRadius: 99, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: w + '%', borderRadius: 99, background: g === 'D' ? 'var(--neg)' : '#fff' }} /></span><span className="num" style={{ fontSize: 12 }}>{w}%</span></span>
              <span className="num" style={{ width: 70, textAlign: 'right', fontWeight: 600, color: net >= 0 ? 'var(--pos)' : 'var(--neg)' }}>{net >= 0 ? '+' : '-'}${Math.abs(net).toLocaleString()}</span>
            </div>
          ))}
        </Card>
        <div className="col" style={{ gap: 14 }}>
          <Card>
            <H aside="Net by day">Weekdays</H>
            <div className="row" style={{ alignItems: 'flex-end', gap: 14, height: 130, padding: '0 6px' }}>
              {days.map(([d, v]) => (
                <div key={d} className="col" style={{ flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: '100%' }}>
                  <span className="num" style={{ fontSize: 11, color: v >= 0 ? 'var(--fg2)' : 'var(--neg)' }}>{v >= 0 ? '+' : '-'}${Math.abs(v)}</span>
                  <i style={{ width: '100%', maxWidth: 34, height: Math.abs(v) / 9, borderRadius: 10, background: v >= 0 ? (v > 800 ? '#fff' : 'rgba(255,255,255,.55)') : 'rgba(255,169,161,.85)', boxShadow: v > 800 ? '0 0 16px rgba(255,255,255,.4)' : 'none' }} />
                  <span style={{ fontSize: 11.5, color: 'var(--fg3)' }}>{d}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <H aside="61 trades">R distribution</H>
            <div className="row" style={{ alignItems: 'flex-end', gap: 5, height: 92 }}>
              {rdist.map((h, i) => <i key={i} style={{ flex: 1, height: h * 7.5, borderRadius: 6, background: i < 6 ? 'rgba(255,169,161,.7)' : '#fff', opacity: i < 6 ? 1 : 0.55 + h / 25 }} />)}
            </div>
            <div className="row num" style={{ justifyContent: 'space-between', fontSize: 11, color: 'var(--fg3)' }}><span>-2R</span><span>0</span><span>+3R</span></div>
          </Card>
        </div>
      </div>
    </Shell>
  )
}

// ── Rules ─────────────────────────────────────────────────────────────
function RulesScreen() {
  const g = [['Profit target', '$2,140 of $3,000', 0.71, '#fff'], ['Trailing drawdown', '$2,500 left of $2,500', 1, '#fff'], ['Daily stop', '$120 used of $600', 0.2, '#fff'], ['Consistency, 30% max', 'Best day is 29%', 0.95, 'linear-gradient(90deg,#fff,#FFC98A)']]
  const log = [['10:41', 'Trade closed +$530. Consistency now 29% of profit.', 'warn'], ['10:02', 'Pre-market checklist complete. Safe to trade.', 'ok'], ['Oct 27', 'Daily stop reached at -$600. Trading locked for the day.', 'bad'], ['Oct 23', 'Payout eligible after 2 more winning days.', 'ok']]
  return (
    <Shell on={3} title="Account rules" sub="Apex 50K evaluation" right={<span className="row" style={{ gap: 8, background: '#fff', color: '#000', borderRadius: 99, padding: '9px 16px', fontSize: 13, fontWeight: 600 }}><span style={{ width: 8, height: 8, borderRadius: 99, background: '#1a9f53' }} /> Safe to trade</span>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {g.map(([k, v, p, fill]) => (
          <Card key={k} style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}><span style={{ fontSize: 14, fontWeight: 600 }}>{k}</span><span className="num" style={{ fontSize: 13, color: 'var(--fg2)' }}>{v}</span></div>
            <div style={{ height: 12, borderRadius: 99, background: 'rgba(255,255,255,.08)', overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: p * 100 + '%', borderRadius: 99, background: fill, boxShadow: '0 0 12px rgba(255,255,255,.35)' }} /></div>
          </Card>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 14, flex: 1 }}>
        <Card style={{ alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <svg width="170" height="170" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${263.9 * 0.71} 264`} transform="rotate(-90 50 50)" style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,.5))' }} />
            <text x="50" y="52" textAnchor="middle" fill="#fff" style={{ font: '700 22px Poppins, sans-serif' }}>71%</text>
            <text x="50" y="65" textAnchor="middle" fill="rgba(255,255,255,.55)" style={{ font: '500 7.5px Inter, sans-serif' }}>to target</text>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600 }}>$860 to pass</span>
          <span style={{ fontSize: 12, color: 'var(--fg3)' }}>About 4 average green days</span>
        </Card>
        <Card style={{ gap: 0 }}>
          <H aside="Today and recent">Rule alerts</H>
          {log.map(([t, m, k]) => (
            <div key={t} className="row" style={{ gap: 14, height: 62, borderTop: '1px solid var(--line)', fontSize: 13.5 }}>
              <span className="num" style={{ width: 52, color: 'var(--fg3)' }}>{t}</span>
              <span style={{ width: 10, height: 10, borderRadius: 99, background: k === 'ok' ? 'var(--pos)' : k === 'warn' ? 'var(--warn)' : 'var(--neg)', boxShadow: '0 0 10px currentColor' }} />
              <span style={{ flex: 1 }}>{m}</span>
              {k === 'bad' && <Lock size={14} style={{ color: 'var(--neg)' }} />}
            </div>
          ))}
        </Card>
      </div>
    </Shell>
  )
}

// ── Psychology ────────────────────────────────────────────────────────
function MindScreenBig() {
  const bars = [['Focused', 1840, 92], ['Patient', 960, 55], ['Calm', 410, 30], ['Hesitant', -220, 16], ['FOMO', -480, 28], ['Revenge', -370, 22], ['Bored', -150, 12]]
  return (
    <Shell on={4} title="Psychology" sub="How your state of mind pays" right={<div className="row" style={{ gap: 8 }}><Pill solid>Net</Pill><Pill>Win rate</Pill><Pill>R</Pill></div>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14, flex: 1 }}>
        <Card>
          <H aside="Before entry, October">Net by state of mind</H>
          <div className="row" style={{ alignItems: 'flex-end', gap: 16, flex: 1, padding: '10px 10px 0' }}>
            {bars.map(([l, v, h]) => (
              <div key={l} className="col" style={{ flex: 1, alignItems: 'center', gap: 8, justifyContent: 'flex-end', height: '100%' }}>
                <span className="num" style={{ fontSize: 12, fontWeight: 600, padding: l === 'Focused' ? '4px 8px' : 0, borderRadius: 8, background: l === 'Focused' ? '#fff' : 'none', color: l === 'Focused' ? '#000' : v < 0 ? 'var(--neg)' : 'var(--fg2)' }}>{v > 0 ? '+' : '-'}${Math.abs(v).toLocaleString()}</span>
                <div style={{ width: 18, height: 300, borderRadius: 99, background: 'rgba(255,255,255,.06)', position: 'relative', overflow: 'hidden' }}><i style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: h + '%', borderRadius: 99, background: v < 0 ? 'rgba(255,169,161,.85)' : l === 'Focused' ? '#fff' : 'rgba(255,255,255,.55)' }} /></div>
                <span style={{ fontSize: 12, color: 'var(--fg2)' }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="col" style={{ gap: 14 }}>
          {[
            ['Tilt cost this month', '-$1,220', 'FOMO, revenge and boredom trades together.', 'neg'],
            ['Your best state', 'Focused', '68% win rate, 2.1R average when you tag Focused.', ''],
            ['Pattern spotted', 'After 2 losses', 'Your third trade of the day loses 71% of the time. Your stop-at-2 rule saves you about $640 a month.', ''],
          ].map(([k, v, b, c]) => (
            <Card key={k} style={{ gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--fg3)' }}>{k}</span>
              <span className={'display ' + c} style={{ fontSize: 24, fontWeight: 700 }}>{v}</span>
              <span style={{ fontSize: 13, color: 'var(--fg2)', lineHeight: 1.5 }}>{b}</span>
            </Card>
          ))}
        </div>
      </div>
    </Shell>
  )
}

const TABS = [
  { key: 'dash', label: 'Dashboard', title: 'Your whole month on one screen.', body: 'Net P&L, win rate, profit factor and discipline score, with your equity curve against the profit target and a P&L calendar.', points: ['Equity curve against your target', 'Green and red P&L calendar', 'Recent trades with R multiples'], Screen: () => <TabletScreen synced toast={false} /> },
  { key: 'journal', label: 'Journal', title: 'Every trade, with the why behind it.', body: 'Chart screenshot, setup, state of mind, the rules you kept and your notes, all on one trade.', points: ['Paste a chart screenshot', 'Tag setup, session and state', 'Rules ticked on every trade'], Screen: JournalScreen },
  { key: 'analytics', label: 'Analytics', title: 'Know exactly where your edge is.', body: 'Setups graded by their own results, net by weekday and hour, and the full spread of your R multiples.', points: ['Setup grades from A+ to D', 'Best and worst weekdays', 'R distribution of every trade'], Screen: AnalyticsScreen },
  { key: 'rules', label: 'Rules', title: 'Your account rules, always on.', body: 'Distance to target, trailing drawdown, your daily stop and the consistency rule, with alerts before you break one.', points: ['Live distance to the profit target', 'Daily stop that locks the day', 'Consistency rule warning'], Screen: RulesScreen },
  { key: 'mind', label: 'Psychology', title: 'Turn feelings into numbers.', body: 'See what each state of mind pays you, what tilt costs, and the patterns you repeat without noticing.', points: ['Net and win rate by state', 'Monthly tilt cost', 'Patterns found for you'], Screen: MindScreenBig },
]

export default function Tour() {
  const [at, setAt] = useState(0)
  const [auto, setAuto] = useState(true)
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!auto || !visible || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setTimeout(() => setAt((a) => (a + 1) % TABS.length), 7000)
    return () => clearTimeout(id)
  }, [at, auto, visible])
  const tab = TABS[at]
  const Screen = tab.Screen
  return (
    <section id="tour" ref={ref} className="wrap section tour" style={{ scrollMarginTop: 40 }}>
      <div className="col" style={{ gap: 14, alignItems: 'center', textAlign: 'center', marginBottom: 34 }} data-reveal>
        <span className="tag tag-soft hud-label">Inside LIMITLESS</span>
        <h2 className="h-lg">One journal. Every answer.</h2>
      </div>
      <div className="tour-tabs well" role="tablist" aria-label="Product tour">
        {TABS.map((t, i) => (
          <button key={t.key} type="button" role="tab" aria-selected={i === at} className={i === at ? 'on' : ''} onClick={() => { setAt(i); setAuto(false) }}>
            {t.label}
            {i === at && auto && visible && <i key={at} className="tour-prog" />}
          </button>
        ))}
      </div>
      <div className="tour-body">
        <div className="tour-copy col" key={'c' + at}>
          <h3 className="h-md">{tab.title}</h3>
          <p className="muted" style={{ fontSize: 15.5, lineHeight: 1.65 }}>{tab.body}</p>
          <div className="col" style={{ gap: 10, marginTop: 4 }}>
            {tab.points.map((p) => <span key={p} className="row" style={{ gap: 10, fontSize: 14 }}><span className="dot-ok"><Check size={10} strokeWidth={3} /></span>{p}</span>)}
          </div>
        </div>
        <div className="tour-window glass" key={'w' + at}>
          <Corners />
          <div className="row tour-bar">
            <span className="tl" /><span className="tl" /><span className="tl" />
            <span className="tour-url">app.limitless-journal.com</span>
          </div>
          <Scaled w={1180} h={760}><Screen /></Scaled>
        </div>
        <span className="tour-note faint">Sample account. Your own trades show up here.</span>
      </div>
    </section>
  )
}

