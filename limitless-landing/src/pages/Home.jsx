import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Zap, Target, Brain, ShieldCheck, CalendarDays, Upload, Plus, Minus, Lock, Sparkles } from 'lucide-react'
import { Link, SIGNUP_URL, usePageMeta, useReveal, wordSize } from '../lib/site.jsx'
import { Backdrop, Bar, PillBars, Snap } from '../components/ui.jsx'
import HeroDevices from '../components/Devices.jsx'
import { PricingSection } from '../components/Pricing.jsx'
import { ArticleCard } from './Blog.jsx'
import { ARTICLES } from '../content/articles.js'
import { SAMPLE, money, pct } from '../lib/sample.js'

function Marquee() {
  const t = ['NQ', 'ES', 'YM', 'GC', 'CL', 'EUR/USD', 'XAU/USD', 'FUNDED TRADING', 'PROP FIRMS', 'FUTURES', 'FOREX', 'APEX', 'TOPSTEP']
  return (
    <div className="marquee" aria-hidden="true">
      <div className="display">{[...t, ...t].map((x, i) => <span key={i}>{x}</span>)}</div>
    </div>
  )
}

// Statement that lights up word by word as you scroll
function LitStatement() {
  const ref = useRef(null)
  const words = 'Most traders fail funded challenges not from bad trading, but from poor risk management and emotional decisions.'.split(' ')
  const [lit, setLit] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setLit(words.length); return }
    let raf = 0
    const calc = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)))
      setLit(Math.round(p * words.length))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(calc) }
    calc()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [words.length])
  return (
    <section className="wrap section" style={{ maxWidth: 1040 }}>
      <p ref={ref} className="lit display" style={{ fontSize: 'clamp(28px, 4.6vw, 56px)', fontWeight: 600, lineHeight: 1.14, letterSpacing: '-0.03em', textAlign: 'center' }}>
        {words.map((w, i) => <span key={i} className={i < lit ? 'on' : ''}>{w} </span>)}
      </p>
    </section>
  )
}

const FEATURES = [
  { icon: Zap, title: 'Log a trade in seconds', body: 'Symbol, side, entry, stop, exit. P&L and R calculate themselves, and screenshots paste straight in.', big: true },
  { icon: Target, title: 'Find your A+ setup', body: 'Every setup gets a grade from its own results, so you know which to size up and which to cut.' },
  { icon: Brain, title: 'See what your mood costs', body: 'Tag how you felt before entry. LIMITLESS shows the dollar cost of FOMO, revenge and hesitation.' },
  { icon: ShieldCheck, title: 'Score your discipline', body: 'Write your own rules, tick them on each trade, and watch the score that predicts your month.' },
  { icon: CalendarDays, title: 'Know your hours', body: 'Net by weekday and hour shows exactly when you make money and when you give it back.' },
  { icon: Upload, title: 'Bring your history', body: 'Import past trades from a CSV export and get a full review on day one.' },
]

function Features() {
  return (
    <section id="features" className="wrap section" style={{ scrollMarginTop: 40 }}>
      <div className="col" style={{ gap: 14, maxWidth: 640, marginBottom: 44 }} data-reveal>
        <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}><Sparkles size={12} /> Features</span>
        <h2 className="h-lg">Your edge lives in the data.</h2>
        <p className="lead">A spreadsheet stores what happened. LIMITLESS tells you why it happened, and what it cost.</p>
      </div>
      <Snap className="grid g3 features-grid">
        {FEATURES.map((f, i) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="glass lift panel feature" data-reveal style={{ "--i": i % 3 }}>
              <span className="ink" style={{ width: 50, height: 50, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} /></span>
              <h3 style={{ fontSize: 19, fontWeight: 600, marginTop: 'auto' }}>{f.title}</h3>
              <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{f.body}</p>
            </div>
          )
        })}
      </Snap>
    </section>
  )
}

function Rules() {
  const rows = [
    { label: 'Profit target', value: `${money(SAMPLE.net, false)} of ${money(SAMPLE.target, false)}`, p: SAMPLE.net / SAMPLE.target },
    { label: 'Trailing drawdown', value: `${money(SAMPLE.trailing, false)} left`, p: 1 },
    { label: 'Your daily stop', value: `$0 of ${money(SAMPLE.dailyStop, false)}`, p: 0.03 },
    { label: 'Consistency, 30% max', value: pct(SAMPLE.consistency), p: SAMPLE.consistency / 0.3, warn: true },
  ]
  return (
    <section id="rules" className="wrap section" style={{ scrollMarginTop: 40 }}>
      <div className="grid g2" style={{ alignItems: 'center', gap: 48 }}>
        <div className="col" style={{ gap: 16 }} data-reveal>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}><ShieldCheck size={12} /> For funded traders</span>
          <h2 className="h-lg">See the breach before it happens.</h2>
          <p className="lead">LIMITLESS keeps your account rules on screen while you trade: distance to target, drawdown headroom, your own daily stop and the consistency rule.</p>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}><Lock size={11} /> Prop firm presets and payouts come with Pro</span>
        </div>
        <div className="glass panel" style={{ gap: 20, padding: 30, '--i': 1 }} data-reveal>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Account rules</h3>
            <span className="tag tag-solid"><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1a9f53' }} /> Safe to trade</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.label} className="col" style={{ gap: 8 }}>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 14 }}><span>{r.label}</span><span className="num" style={{ fontWeight: 600 }}>{r.value}</span></div>
              <Bar pct={r.p} fill={r.warn ? 'linear-gradient(90deg,#fff,#FFC98A)' : '#fff'} delay={0.2 + i * 0.1} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Psychology() {
  const items = [
    { label: 'Focused', value: '+$1,840', pct: 0.92, peak: true },
    { label: 'Patient', value: '+$960', pct: 0.55 },
    { label: 'Calm', value: '+$410', pct: 0.3 },
    { label: 'Hesitant', value: '-$220', pct: 0.16, fill: 'rgba(255,255,255,0.45)' },
    { label: 'FOMO', value: '-$480', pct: 0.28, fill: 'rgba(255,169,161,0.85)' },
    { label: 'Revenge', value: '-$370', pct: 0.22, fill: 'rgba(255,169,161,0.85)' },
  ]
  return (
    <section className="wrap section">
      <div className="grid g2" style={{ alignItems: 'center', gap: 48 }}>
        <div className="glass panel psych" style={{ padding: 30, gap: 24 }} data-reveal>
          <div className="row" style={{ justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600 }}>Net by state of mind</h3>
            <span className="faint" style={{ fontSize: 12.5 }}>Sample month</span>
          </div>
          <PillBars items={items} height={150} width={14} />
          <div className="well row" style={{ gap: 12, borderRadius: 18, padding: '14px 16px', fontSize: 13.5 }}>
            <Brain size={16} style={{ flexShrink: 0 }} />
            <span>FOMO and revenge trades cost <b className="neg">$850</b> this month. That is 40% of your net.</span>
          </div>
        </div>
        <div className="col" style={{ gap: 16, '--i': 1 }} data-reveal>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}><Brain size={12} /> Psychology</span>
          <h2 className="h-lg">Put a dollar figure on your emotions.</h2>
          <p className="lead">Tag your state before every entry. After a few weeks you stop guessing what tilt costs you, because the number is right there.</p>
        </div>
      </div>
    </section>
  )
}

function Steps() {
  const steps = [
    ['Log', 'Every trade, with your setup, your state and the rules you kept. Ten seconds on desktop or phone.'],
    ['Review', 'Daily and weekly reviews show what worked, what leaked and which rule broke the most.'],
    ['Improve', 'Cut the setups that lose, size the ones that win, and trade fewer, better hours.'],
  ]
  return (
    <section className="wrap" style={{ paddingBlock: '40px 20px' }}>
      <div className="grid g3 steps">
        {steps.map(([t, b], i) => (
          <div key={t} className="col step" style={{ gap: 12, '--i': i }} data-reveal>
            <span className="step-n display">{String(i + 1).padStart(2, '0')}</span>
            <h3 style={{ fontSize: 30, fontWeight: 600 }}>{t}</h3>
            <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.6 }}>{b}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function BlogPreview() {
  const latest = ARTICLES.slice(0, 3)
  return (
    <section className="wrap section">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap', marginBottom: 34 }} data-reveal>
        <div className="col" style={{ gap: 14 }}>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}>From the blog</span>
          <h2 className="h-lg">Read like a funded trader.</h2>
        </div>
        <Link to="/blog" className="btn btn-ghost">All articles <ArrowRight size={15} /></Link>
      </div>
      <Snap className="blog-grid">
        {latest.map((a, i) => <ArticleCard key={a.slug} article={a} i={i} />)}
      </Snap>
    </section>
  )
}

const FAQ = [
  ['What does it cost?', 'Lite is $15 a month and includes the full journal. Pro, with prop firm rule engines and payout tracking, is coming later and Lite members hear about it first.'],
  ['Can I import trades from my broker?', 'Yes, from a CSV file exported from your platform. Direct broker sync is on the roadmap and is not live yet.'],
  ['Can I cancel?', 'Anytime, from your account. You keep access until the end of the period you paid for, and your trade history stays saved.'],
  ['Who can see my trades?', 'Only you. Your journal is private to your account.'],
  ['Does it work on my phone?', 'Yes. The journal works on phone and desktop, so you can log a trade the moment you close it.'],
  ['Is this financial advice?', 'No. LIMITLESS is a journal and analytics tool. It never tells you what to trade.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="wrap section" style={{ maxWidth: 1040, scrollMarginTop: 40 }}>
      <div className="grid g2" style={{ gap: 44, alignItems: 'start' }}>
        <div className="col" style={{ gap: 14 }} data-reveal>
          <span className="tag tag-soft" style={{ alignSelf: 'flex-start' }}>FAQ</span>
          <h2 className="h-lg">Your questions, answered.</h2>
          <p className="muted" style={{ fontSize: 15 }}>Anything else, write to <a href="mailto:support@limitless-journal.com" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>support@limitless-journal.com</a>.</p>
        </div>
        <div className="col" style={{ gap: 10, '--i': 1 }} data-reveal>
          {FAQ.map(([q, a], i) => {
            const on = open === i
            return (
              <div key={q} className={on ? 'glass' : 'well'} style={{ borderRadius: 22 }}>
                <button type="button" aria-expanded={on} onClick={() => setOpen(on ? -1 : i)} className="faq-q">
                  <span style={{ flex: 1 }}>{q}</span>
                  <span className={on ? 'check' : 'check off'} style={{ transition: 'transform .4s var(--spring)', transform: on ? 'rotate(180deg)' : 'none' }}>{on ? <Minus size={13} /> : <Plus size={13} />}</span>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: on ? '1fr' : '0fr', transition: 'grid-template-rows .45s var(--ease)' }}>
                  <div style={{ overflow: 'hidden' }}><p className="muted" style={{ padding: '0 20px 20px', fontSize: 14, lineHeight: 1.65 }}>{a}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="wrap" style={{ paddingBlock: '20px 110px' }}>
      <div className="glass cta" data-reveal>
        <h2 className="h-lg" style={{ maxWidth: 760 }}>Unlogged trades are missed lessons.</h2>
        <p className="lead" style={{ textAlign: 'center' }}>Start journaling today. Your first real review is ready after your first week.</p>
        <a href={SIGNUP_URL} className="btn btn-primary btn-lg">Start for $15 a month <ArrowRight size={16} /></a>
      </div>
    </section>
  )
}

// Intro: the crown drops in and flashes, LIMITLESS opens out under it, then the word
// sinks behind the headline as a soft blur while the headline pops forward.
function HeroMark({ ws }) {
  const letters = 'LIMITLESS'.split('')
  return (
    <div className="mark" aria-hidden="true">
      <div className="mark-inner">
        <span className="crown-wrap">
          <span className="crown-burst" />
          <span className="crown" />
        </span>
        <span className="mark-word" style={{ fontSize: ws }}>
          {letters.map((c, i) => {
            const d = i - (letters.length - 1) / 2
            return <span key={i} style={{ '--dx': d, animationDelay: `${0.55 + Math.abs(d) * 0.06}s` }}>{c}</span>
          })}
        </span>
      </div>
    </div>
  )
}

export default function Home() {
  usePageMeta('LIMITLESS | The trading journal for funded traders', 'The trading journal for funded futures and forex traders. Log trades in seconds, see why your results happen, and track your prop firm rules. $15 a month.')
  useReveal()
  const ws = wordSize('LIMITLESS', 230)
  return (
    <div className="stage">
      <Backdrop orbs={[{ left: '2%', top: 820, width: 380, height: 380 }, { right: '3%', top: 1300, width: 440, height: 440 }]} />
      <HeroMark ws={ws} />
      <header className="wrap hero-head" style={{ paddingTop: `calc(${ws} * 0.42 + 190px)`, textAlign: 'center' }}>
        <div className="col hero-enter" style={{ alignItems: 'center', gap: 20 }}>
          <span className="tag glass" style={{ '--i': 0, padding: '8px 15px', '--fill': 0.08 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pos)', animation: 'pulse 2s infinite' }} /> Now open · $15 a month</span>
          <h1 className="h-xl hero-pop" style={{ '--i': 1, maxWidth: 1120, fontSize: 'clamp(38px, 5.4vw, 74px)' }}>Turn your trades into data. <span className="h1-2">Your data into profit.</span></h1>
          <p className="lead" style={{ '--i': 2, textAlign: 'center', maxWidth: 620 }}>The trading journal for funded futures traders. Log in seconds, see why your results happen, and know how close you are to breaking a rule.</p>
          <div className="row hero-ctas" style={{ '--i': 3, gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href={SIGNUP_URL} className="btn btn-primary btn-lg">Start for $15 a month <ArrowRight size={16} /></a>
            <Link to="/" hash="features" className="btn btn-ghost btn-lg">See what it does</Link>
          </div>
        </div>
      </header>
      <div className="wrap" style={{ maxWidth: 1240 }}><HeroDevices /></div>
      <Marquee />
      <LitStatement />
      <Features />
      <Rules />
      <Psychology />
      <Steps />
      <PricingSection />
      <BlogPreview />
      <Faq />
      <FinalCta />
    </div>
  )
}
