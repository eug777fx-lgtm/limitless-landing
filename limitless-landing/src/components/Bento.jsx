import { Zap, Target, Brain, ShieldCheck, Clock, Upload, CalendarDays, ListChecks, Check, FileSpreadsheet, ArrowRight, Mail } from 'lucide-react'
import { Snap } from './ui.jsx'
import { Corners } from './Hud.jsx'
import { DAILY } from '../lib/sample.js'

// Every card carries a small live visual of the feature it describes (sample data).

function Head({ icon: Icon, title, body }) {
  return (
    <div className="col" style={{ gap: 8 }}>
      <span className="bento-ico ink"><Icon size={18} /></span>
      <h3 className="bento-title">{title}</h3>
      <p className="muted bento-body">{body}</p>
    </div>
  )
}

function LogVis() {
  const fields = [['Entry', '21,142.25'], ['Stop', '21,128.00'], ['Exit', '21,168.75']]
  return (
    <div className="bento-vis col" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 8 }}>
        <span className="pill-w">NQ</span><span className="pill-w">Long</span><span className="pill-g">1 contract</span><span className="pill-g">OTE retrace</span>
      </div>
      <div className="row" style={{ gap: 8 }}>
        {fields.map(([k, v], i) => (
          <div key={k} className="well col bento-field" style={{ '--d': `${0.25 + i * 0.35}s` }}>
            <span className="faint" style={{ fontSize: 11 }}>{k}</span>
            <span className="num typed" style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
      </div>
      <div className="ink row bento-result">
        <div className="col"><span className="faint" style={{ fontSize: 11 }}>P&amp;L, calculated</span><span className="num display pos" style={{ fontSize: 24, fontWeight: 700 }}>+$530.00</span></div>
        <div className="col" style={{ alignItems: 'flex-end' }}><span className="faint" style={{ fontSize: 11 }}>Result</span><span className="num display" style={{ fontSize: 20, fontWeight: 600 }}>1.9R</span></div>
        <span className="pill-w row" style={{ gap: 6 }}><Check size={13} strokeWidth={3} /> Saved in 10s</span>
      </div>
    </div>
  )
}

function GradesVis() {
  const rows = [['OTE retrace', 'A+', 0.68], ['Liquidity sweep', 'A', 0.61], ['FVG fill', 'B', 0.52], ['Unplanned', 'D', 0.31]]
  return (
    <div className="bento-vis col" style={{ gap: 9 }}>
      {rows.map(([n, g, w], i) => (
        <div key={n} className="row" style={{ gap: 10, fontSize: 13 }}>
          <span className={'grade' + (i === 0 ? ' top' : i === 3 ? ' bad' : '')}>{g}</span>
          <span style={{ flex: 1, minWidth: 0 }}>{n}</span>
          <div className="mini-bar well"><i style={{ width: `${w * 100}%`, '--d': `${0.2 + i * 0.1}s`, background: i === 3 ? 'var(--neg)' : '#fff' }} /></div>
          <span className="num faint" style={{ width: 34, textAlign: 'right' }}>{Math.round(w * 100)}%</span>
        </div>
      ))}
    </div>
  )
}

function MoodVis() {
  const b = [['Focused', 92, '#fff'], ['Patient', 55, 'rgba(255,255,255,.6)'], ['FOMO', 30, 'var(--neg)'], ['Revenge', 24, 'var(--neg)']]
  return (
    <div className="bento-vis row" style={{ gap: 14, alignItems: 'flex-end', justifyContent: 'center', height: 118 }}>
      {b.map(([l, h, c], i) => (
        <div key={l} className="col" style={{ alignItems: 'center', gap: 6 }}>
          <div className="well" style={{ width: 14, height: 90, borderRadius: 99, position: 'relative', overflow: 'hidden' }}>
            <i className="grow-y" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${h}%`, borderRadius: 99, background: c, '--d': `${0.2 + i * 0.08}s` }} />
          </div>
          <span style={{ fontSize: 10.5, color: 'var(--fg2)' }}>{l}</span>
        </div>
      ))}
    </div>
  )
}

function ScoreVis() {
  const r = 42, len = 2 * Math.PI * r
  return (
    <div className="bento-vis row" style={{ gap: 16, justifyContent: 'center' }}>
      <svg width="112" height="112" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
        <circle className="ring-draw" cx="50" cy="50" r={r} fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${len * 0.92} ${len}`} transform="rotate(-90 50 50)" style={{ '--len': len * 0.92, filter: 'drop-shadow(0 0 6px rgba(255,255,255,.5))' }} />
        <text x="50" y="57" textAnchor="middle" fill="#fff" style={{ font: '700 24px Poppins, sans-serif' }}>92</text>
      </svg>
      <div className="col" style={{ gap: 6, fontSize: 12.5 }}>
        {['1R max', 'Stop at 2 losses', 'NY AM only'].map((t) => <span key={t} className="row" style={{ gap: 7 }}><span className="dot-ok"><Check size={10} strokeWidth={3} /></span>{t}</span>)}
        <span className="row faint" style={{ gap: 7 }}><span className="dot-no" />No red news</span>
      </div>
    </div>
  )
}

function HoursVis() {
  // weekday x hour heat, sample
  const hours = ['9:30', '10', '11', '12', '13', '14']
  const grid = [
    [3, 4, 1, -1, 0, -2], [2, 3, 1, 0, -1, -1], [4, 3, 0, -2, -1, 0], [3, 2, 1, -1, -3, -1], [1, 2, 0, 0, -1, -2],
  ]
  return (
    <div className="bento-vis col" style={{ gap: 4 }}>
      {grid.map((row, i) => (
        <div key={i} className="row" style={{ gap: 4 }}>
          <span className="faint" style={{ width: 14, fontSize: 10 }}>{'MTWTF'[i]}</span>
          {row.map((v, j) => <span key={j} className="heat" style={{ '--d': `${(i * 6 + j) * 0.025}s`, background: v > 0 ? `rgba(255,255,255,${0.12 + v * 0.2})` : v < 0 ? `rgba(255,169,161,${0.1 - v * 0.17})` : 'rgba(255,255,255,.05)' }} />)}
        </div>
      ))}
      <div className="row" style={{ gap: 4, paddingLeft: 18 }}>{hours.map((h) => <span key={h} className="faint num" style={{ flex: 1, fontSize: 9.5, textAlign: 'center' }}>{h}</span>)}</div>
    </div>
  )
}

function ImportVis() {
  return (
    <div className="bento-vis col" style={{ gap: 12 }}>
      <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
        <span className="well row file-chip"><FileSpreadsheet size={16} /> tradovate_export.csv</span>
        <ArrowRight size={16} className="faint" />
        <span className="ink row file-chip" style={{ gap: 6 }}><Check size={14} strokeWidth={3} className="pos" /> 61 trades imported</span>
      </div>
      <div className="well" style={{ height: 8, borderRadius: 99, overflow: 'hidden' }}><i className="import-bar" /></div>
      <span className="faint" style={{ fontSize: 12 }}>Your first full review is ready on day one.</span>
    </div>
  )
}

function CalendarVis() {
  const by = Object.fromEntries(DAILY.map((d) => [d.day, d.net]))
  const weeks = [[0, 0, 0, 1, 2], [5, 6, 7, 8, 9], [12, 13, 14, 15, 16], [19, 20, 21, 22, 23], [26, 27, 28, 29, 30]]
  return (
    <div className="bento-vis" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
      {weeks.flat().map((d, i) => {
        const n = by[d]
        const a = n ? 0.16 + Math.min(1, Math.abs(n) / 640) * 0.6 : 0
        return <span key={i} className="cal num" style={{ visibility: d ? 'visible' : 'hidden', background: n ? (n > 0 ? `rgba(255,255,255,${a})` : `rgba(255,169,161,${a * 0.8})`) : 'rgba(255,255,255,.04)', color: n > 0 && a > 0.5 ? '#000' : '#fff' }}>{d || ''}</span>
      })}
    </div>
  )
}

function PlanVis() {
  const items = [['Bias marked on the 4H', true], ['Liquidity levels drawn', true], ['News checked', true], ['Waiting for the sweep', false]]
  return (
    <div className="bento-vis col" style={{ gap: 8 }}>
      {items.map(([t, ok], i) => (
        <span key={t} className="row check-row" style={{ gap: 10, fontSize: 13, '--d': `${0.2 + i * 0.15}s` }}>
          <span className={ok ? 'dot-ok' : 'dot-no'}>{ok && <Check size={10} strokeWidth={3} />}</span>
          <span className={ok ? '' : 'faint'}>{t}</span>
        </span>
      ))}
      <span className="pill-g" style={{ alignSelf: 'flex-start', marginTop: 4 }}>AI checklist built from your plan</span>
    </div>
  )
}

function ReviewVis() {
  return (
    <div className="bento-vis ink col mail" style={{ gap: 8 }}>
      <div className="row" style={{ gap: 8, fontSize: 12 }}><span className="mail-dot" /><b>LIMITLESS</b><span className="faint" style={{ marginLeft: 'auto' }}>Sun 6:00 PM</span></div>
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>Your week: +$1,140 · 4 of 5 days green</span>
      <span className="faint" style={{ fontSize: 12, lineHeight: 1.5 }}>Best setup OTE retrace. Rule broken most: stop after 2 losses.</span>
    </div>
  )
}

const CARDS = [
  { cls: 'span2', icon: Zap, title: 'Log a trade in seconds', body: 'Symbol, side, entry, stop, exit. P&L and R calculate themselves, and chart screenshots paste straight in.', Vis: LogVis },
  { icon: Target, title: 'Find your A+ setup', body: 'Every setup is graded by its own results.', Vis: GradesVis },
  { icon: Brain, title: 'See what your mood costs', body: 'Tag your state before entry and see the dollar cost of tilt.', Vis: MoodVis },
  { icon: ShieldCheck, title: 'Score your discipline', body: 'Your rules, ticked on every trade, scored daily.', Vis: ScoreVis },
  { icon: Clock, title: 'Know your hours', body: 'Net by weekday and hour, so you trade the window that pays.', Vis: HoursVis },
  { cls: 'span2', icon: Upload, title: 'Bring your history', body: 'Import past trades from a CSV export and get a full review on day one.', Vis: ImportVis },
  { icon: CalendarDays, title: 'P&L calendar', body: 'Every day at a glance, green and red.', Vis: CalendarVis },
  { cls: 'span2', icon: ListChecks, title: 'Trading plan and pre-market checklist', body: 'Write your plan once. LIMITLESS turns it into a checklist you tick before the open.', Vis: PlanVis },
  { icon: Mail, title: 'Daily and weekly reviews', body: 'A short recap in your inbox after the session and every Sunday.', Vis: ReviewVis },
]

export default function Bento() {
  return (
    <Snap className="bento">
      {CARDS.map(({ cls = '', icon, title, body, Vis }, i) => (
        <article key={title} className={'glass bento-card lift ' + cls} data-reveal style={{ '--i': i % 3 }}>
          <Corners />
          <span className="bento-id mono">{String(i + 1).padStart(2, '0')}</span>
          <Head icon={icon} title={title} body={body} />
          <Vis />
        </article>
      ))}
    </Snap>
  )
}
