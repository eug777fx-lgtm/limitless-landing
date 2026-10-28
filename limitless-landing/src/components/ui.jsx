import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { wordSize } from '../lib/site.jsx'
import { money } from '../lib/sample.js'

export const LOGO = '/logo2.png'

export function Logo({ size = 26 }) {
  return <img src={LOGO} alt="" width={size} style={{ width: size, height: 'auto', display: 'block' }} />
}

// Black stage: spotlight, faint grid, soft orbs and the giant word that blurs through glass
export function Backdrop({ word, top = 110, size = 236, orbs = [] }) {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="grid" />
      <div className="spot" />
      {orbs.map((o, i) => <div key={i} className="orb" style={o} />)}
      {word && <div className="word" data-word={word} style={{ top, fontSize: wordSize(word, size) }}>{word}</div>}
    </div>
  )
}

// Segmented control with a sliding white pill
export function Seg({ options, value, onChange, label, style }) {
  const ref = useRef(null)
  const [pill, setPill] = useState(null)
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current && ref.current.querySelector('[aria-pressed="true"]')
      if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (ro && ref.current) ro.observe(ref.current)
    return () => ro && ro.disconnect()
  }, [value, options.length])
  return (
    <div ref={ref} className="seg well" role="group" aria-label={label} style={style}>
      {pill && <span className="seg-pill" style={{ left: pill.left, width: pill.width }} />}
      {options.map((o) => <button key={o} type="button" aria-pressed={value === o ? 'true' : 'false'} onClick={() => onChange(o)}>{o}</button>)}
    </div>
  )
}

// Counts up once it scrolls into view
export function CountUp({ value, format = (v) => String(Math.round(v)), duration = 1300 }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(0)
  useEffect(() => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) { setShown(value); return }
    let raf
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration)
        setShown(value * (1 - Math.pow(1 - p, 4)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) io.observe(ref.current)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [value, duration])
  return <span ref={ref}>{format(shown)}</span>
}

export function Ring({ pct, size = 104, stroke = 10, label, sub }) {
  const r = 50 - stroke / 2
  const len = 2 * Math.PI * r
  const p = Math.max(0, Math.min(1, pct))
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${Math.round(p * 100)} percent ${sub || ''}`} style={{ flexShrink: 0 }}>
      <circle cx="50" cy="50" r={r} fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle cx="50" cy="50" r={r} fill="none" stroke="#FFFFFF" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${len * p} ${len}`} transform="rotate(-90 50 50)"
        style={{ '--len': len * p, strokeDashoffset: 0, animation: 'ring 1.4s var(--ease) .3s both', filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.55))' }} />
      <text x="50" y={sub ? 52 : 57} textAnchor="middle" fill="#FFFFFF" style={{ font: '700 20px Poppins, sans-serif' }}>{label}</text>
      {sub && <text x="50" y="68" textAnchor="middle" fill="rgba(255,255,255,0.6)" style={{ font: '500 9px Inter, sans-serif' }}>{sub}</text>}
    </svg>
  )
}

export function Bar({ pct, fill, delay = 0.2 }) {
  return (
    <div className="bar well" data-reveal style={{ '--d': `${delay}s`, transform: 'none', opacity: 1 }}>
      <i style={{ width: `${Math.max(2, Math.min(1, pct) * 100)}%`, background: fill }} />
    </div>
  )
}

const f = (n) => Math.round(n * 10) / 10
// Catmull-Rom through the points, as cubic Beziers
export function smooth(pts) {
  if (!pts.length) return ''
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

// Equity curve: draws in, glows, and scrubs under the pointer
export function EquityChart({ series, target, height = 250, ticks = 5 }) {
  const box = useRef(null)
  const svgRef = useRef(null)
  const [W, setW] = useState(1000)
  const [hover, setHover] = useState(null)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const measure = () => setW(Math.max(280, Math.round(el.getBoundingClientRect().width)))
    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (ro) ro.observe(el)
    return () => ro && ro.disconnect()
  }, [])
  const narrow = W < 600
  const H = narrow ? Math.round(height * 0.82) : height, padL = 8, padR = narrow ? 20 : 30, top = target ? 40 : 18, bottom = H - 22
  const nt = narrow ? Math.min(ticks, 4) : ticks
  const max = Math.max(target || 0, ...series.map((p) => p.value), 1)
  const min = Math.min(0, ...series.map((p) => p.value))
  const x = (i) => padL + (i / Math.max(1, series.length - 1)) * (W - padL - padR)
  const y = (v) => bottom - ((v - min) / (max - min)) * (bottom - top)
  const pts = series.map((p, i) => [x(i), y(p.value)])
  const line = smooth(pts)
  const last = pts[pts.length - 1] || [0, 0]
  const area = `${line} L${f(last[0])} ${H} L${f(pts[0] ? pts[0][0] : 0)} ${H} Z`
  const onMove = (e) => {
    const r = svgRef.current.getBoundingClientRect()
    const vx = ((e.clientX - r.left) / r.width) * W
    let best = 0, bd = Infinity
    pts.forEach((p, i) => { const d = Math.abs(p[0] - vx); if (d < bd) { bd = d; best = i } })
    setHover(best)
  }
  const hp = hover !== null ? pts[hover] : null
  const tickIdx = Array.from({ length: nt }, (_, k) => Math.round((k / (nt - 1)) * (series.length - 1)))
  return (
    <div ref={box} style={{ position: 'relative' }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible', touchAction: 'pan-y' }}
        onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img"
        aria-label={`Sample equity curve from $0 to ${money(series[series.length - 1].value, false)}`}>
        <defs>
          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.17" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {target && <>
          <line x1={padL} y1={y(target)} x2={W - padR} y2={y(target)} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 7" />
          <text x={padL} y={y(target) - 10} fill="rgba(255,255,255,0.55)" style={{ font: '500 12px Inter, sans-serif' }}>Profit target {money(target, false)}</text>
        </>}
        {min < 0 && <line x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} stroke="rgba(255,255,255,0.12)" />}
        <path d={area} fill="url(#eqFill)" style={{ animation: 'fade 1.2s var(--ease) .5s both' }} />
        <path d={line} fill="none" stroke="#FFFFFF" strokeWidth={narrow ? 3 : 3.5} strokeLinecap="round" pathLength="1" strokeDasharray="1"
          style={{ animation: 'draw 1.8s var(--ease) .3s both', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.45))' }} />
        {hp ? <>
          <line x1={hp[0]} y1={hp[1]} x2={hp[0]} y2={H} stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeDasharray="4 6" />
          <circle cx={hp[0]} cy={hp[1]} r="9" fill="#000" stroke="#FFFFFF" strokeWidth="4" />
        </> : <>
          <line x1={last[0]} y1={last[1]} x2={last[0]} y2={H} stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="4 6" style={{ animation: 'fade .6s 1.8s both' }} />
          <circle cx={last[0]} cy={last[1]} r="10" fill="#000" stroke="#FFFFFF" strokeWidth="4" style={{ transformOrigin: `${last[0]}px ${last[1]}px`, animation: 'pop .6s var(--spring) 1.8s both' }} />
        </>}
      </svg>
      {hp && (
        <div className="glass" style={{ position: 'absolute', left: `${(hp[0] / W) * 100}%`, top: `${(hp[1] / H) * 100}%`, transform: `translate(${hp[0] > W * 0.7 ? '-110%' : '14px'}, -120%)`, padding: '8px 12px', borderRadius: 14, pointerEvents: 'none', whiteSpace: 'nowrap', '--fill': 0.14 }}>
          <div className="faint" style={{ fontSize: 11 }}>{series[hover].label}</div>
          <div className="num display" style={{ fontSize: 16, fontWeight: 600 }}>{money(series[hover].value)}</div>
          <div className="num" style={{ fontSize: 11.5 }}><span className="faint">Day </span><span className={series[hover].sub >= 0 ? 'pos' : 'neg'}>{money(series[hover].sub)}</span></div>
        </div>
      )}
      <div className="num display" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: 'var(--fg3)', marginTop: 6 }}>
        {tickIdx.map((ti, k) => k === nt - 1
          ? <span key={k} style={{ background: '#FFFFFF', color: '#000', fontWeight: 600, borderRadius: 99, padding: '6px 12px' }}>{series[ti].label}</span>
          : <span key={k}>{series[ti].label}</span>)}
      </div>
    </div>
  )
}

// Vertical pill bars
export function PillBars({ items, height = 140, width = 12 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`, gap: 12, alignItems: 'end' }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <span className="num" style={{ fontSize: 12, fontWeight: 600, padding: it.peak ? '5px 10px' : 0, borderRadius: 10, background: it.peak ? '#FFF' : 'transparent', color: it.peak ? '#000' : 'rgba(255,255,255,0.8)', boxShadow: it.peak ? '0 0 18px rgba(255,255,255,0.4)' : 'none', whiteSpace: 'nowrap' }}>{it.value}</span>
          <div className="well" style={{ width, height, borderRadius: 99, position: 'relative', overflow: 'hidden' }}>
            <div className="pillbar" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${Math.max(3, it.pct * 100)}%`, borderRadius: 99, background: it.fill || '#FFFFFF', '--d': `${0.2 + i * 0.07}s` }} />
          </div>
          <span style={{ fontSize: 11, lineHeight: 1.3, color: 'var(--fg2)', textAlign: 'center' }}>{it.label}</span>
        </div>
      ))}
    </div>
  )
}

// Grid on desktop, swipeable row with dots on phones
export function Snap({ className = '', children }) {
  const ref = useRef(null)
  const [at, setAt] = useState(0)
  const count = Array.isArray(children) ? children.length : 1
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const on = () => {
      const kids = [...el.children]
      const mid = el.scrollLeft + el.clientWidth / 2
      let best = 0, bd = Infinity
      kids.forEach((k, i) => { const d = Math.abs(k.offsetLeft + k.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i } })
      setAt(best)
    }
    el.addEventListener('scroll', on, { passive: true })
    return () => el.removeEventListener('scroll', on)
  }, [])
  const go = (i) => { const k = ref.current && ref.current.children[i]; if (k) ref.current.scrollTo({ left: k.offsetLeft - (ref.current.clientWidth - k.offsetWidth) / 2, behavior: 'smooth' }) }
  return (
    <>
      <div ref={ref} className={className + ' snap'}>{children}</div>
      <div className="snap-dots" role="group" aria-label="Slides">
        {Array.from({ length: count }, (_, i) => <button key={i} type="button" aria-label={`Show item ${i + 1}`} aria-current={i === at ? 'true' : undefined} className={i === at ? 'on' : ''} onClick={() => go(i)} />)}
      </div>
    </>
  )
}
