// HUD layer: the reactor rings around the crown, boot readouts, frame brackets,
// a scanning line and the perspective grid floor. All monochrome, all CSS/SVG.

const ticks = (n, r, len, every = 1) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2
  const l = i % every === 0 ? len * 1.9 : len
  return <line key={i} x1={Math.cos(a) * r} y1={Math.sin(a) * r} x2={Math.cos(a) * (r - l)} y2={Math.sin(a) * (r - l)} />
})
const arc = (r, a0, a1) => {
  const p = (a) => [Math.cos((a - 90) * Math.PI / 180) * r, Math.sin((a - 90) * Math.PI / 180) * r]
  const [x0, y0] = p(a0), [x1, y1] = p(a1)
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`
}

export function Reactor() {
  return (
    <svg className="reactor" viewBox="-250 -250 500 500" aria-hidden="true">
      <defs>
        <radialGradient id="rcGlow"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset=".55" stopColor="#fff" stopOpacity=".04" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id="rcSweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity=".22" /></linearGradient>
        <path id="rcText" d={arc(196, -80, 280)} />
      </defs>
      <circle r="240" fill="url(#rcGlow)" className="rc-fade" />
      <g className="rc rc-1"><circle r="118" className="rc-line" />{ticks(120, 118, 5, 5)}</g>
      <g className="rc rc-2">{[0, 90, 180, 270].map((a) => <path key={a} d={arc(146, a + 8, a + 62)} className="rc-arc" />)}</g>
      <g className="rc rc-3"><circle r="170" className="rc-dash" /></g>
      <g className="rc rc-4">
        <text className="rc-text"><textPath href="#rcText" startOffset="0">RISK · 1R MAX ◆ EDGE · OTE RETRACE A+ ◆ MIND · FOCUSED ◆ RULES · 5 OF 5 ◆ ACCOUNT · APEX 50K ◆ STATUS · SAFE TO TRADE ◆</textPath></text>
      </g>
      <g className="rc rc-5">{[[-4, 4], [86, 94], [176, 184], [266, 274]].map(([a, b]) => <path key={a} d={arc(222, a, b)} className="rc-bracket" />)}<circle r="222" className="rc-faint" /></g>
      <g className="rc-sweep"><path d={`M0 0 L0 -236 ${arc(236, 0, 38).slice(arc(236, 0, 38).indexOf('A'))} Z`} fill="url(#rcSweep)" /></g>
    </svg>
  )
}

const BOOT = [
  ['LIMITLESS OS', 'v2.6'],
  ['journal', '836 trades'],
  ['setups graded', 'OK'],
  ['risk engine', 'ARMED'],
  ['psychology model', 'ONLINE'],
]
const LIVE = [
  ['session', 'NY AM'],
  ['account', 'APEX 50K'],
  ['daily stop', '$0 / $600'],
  ['status', 'SAFE'],
]
export function BootPanels() {
  return (
    <div className="boot" aria-hidden="true">
      <div className="boot-panel boot-l">
        <span className="boot-title">// SYSTEM</span>
        {BOOT.map(([k, v], i) => <span key={k} className="boot-line" style={{ '--d': `${0.5 + i * 0.22}s` }}><span>{k}</span><i /><b>{v}</b></span>)}
      </div>
      <div className="boot-panel boot-r">
        <span className="boot-title">// LIVE · SAMPLE</span>
        {LIVE.map(([k, v], i) => <span key={k} className="boot-line" style={{ '--d': `${0.9 + i * 0.22}s` }}><span>{k}</span><i /><b>{v}</b></span>)}
        <span className="boot-bars">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ '--h': `${20 + ((i * 37) % 70)}%`, '--d': `${i * 0.08}s` }} />)}</span>
      </div>
    </div>
  )
}

export function HudFrame() {
  return (
    <div className="hud-frame" aria-hidden="true">
      <i className="hf hf-tl" /><i className="hf hf-tr" /><i className="hf hf-bl" /><i className="hf hf-br" />
      <i className="hud-scan" />
    </div>
  )
}

export const GridFloor = () => <div className="grid-floor" aria-hidden="true"><i /></div>

// Bracket corners + one scan pass when the card scrolls in
export const Corners = () => <i className="hud-corners" aria-hidden="true" />
