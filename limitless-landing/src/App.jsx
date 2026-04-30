import { useState, useEffect, useRef } from 'react'
import {
  motion, AnimatePresence, useInView,
  useScroll, useTransform, useMotionValue, useSpring,
} from 'framer-motion'
import {
  BarChart2, BookOpen, Tag, Target, Menu, X, ChevronDown,
  Check, Star, Lock
} from 'lucide-react'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const NAV_LINKS = ['Features', 'Preview', 'Early Access', 'FAQ']

const STATS = [
  { to: 500,    suffix: '+', label: 'Beta Traders' },
  { to: 10000,  suffix: '+', label: 'Trades Tracked', format: (v) => v.toLocaleString() },
  { to: 74,     suffix: '%', label: 'Avg Win Rate' },
  { to: 0,      prefix: '$', label: 'To Get Started' },
]

const TESTIMONIALS = [
  { initials: 'MR', name: 'Marcus R.', role: 'Futures Trader', quote: 'LIMITLESS helped me cut my losing trades by 40% in 3 months. The pattern recognition is insane.' },
  { initials: 'SL', name: 'Sarah L.', role: 'Forex Trader', quote: 'Finally a journal that shows me the WHY behind my results, not just the numbers.' },
  { initials: 'JK', name: 'James K.', role: 'Crypto Trader', quote: 'The setup tagging system alone is worth the price. I found my A+ setup in week 2.' },
]

const FEATURES = [
  { icon: BarChart2, title: 'See What Makes You Money', desc: 'Deep performance analytics break down your P&L by time, setup, instrument, and psychology — so you know exactly what edge you have.' },
  { icon: BookOpen, title: 'Never Repeat Mistakes', desc: 'Log trades with screenshots, notes, and emotion tags. Review your journal to spot recurring errors before they cost you again.' },
  { icon: Tag, title: 'Find Your Best Setups', desc: 'Tag every trade with custom labels. Filter and compare setups to discover which configurations produce your highest R:R.' },
  { icon: Target, title: 'Build Consistency', desc: 'Set daily rules, track compliance, and score yourself on discipline. Consistency is the only edge that compounds.' },
]

const STEPS = [
  { num: '01', title: 'Log Trades', desc: 'Import from broker or log manually in seconds' },
  { num: '02', title: 'Analyze Performance', desc: 'Instantly see stats, charts, and breakdowns' },
  { num: '03', title: 'Fix Mistakes', desc: 'Identify patterns and recurring errors' },
  { num: '04', title: 'Grow Profits', desc: 'Apply insights and watch your edge compound' },
]

const FAQS = [
  { q: 'Is this for beginners?', a: "LIMITLESS is designed for serious traders of all levels. Whether you're 6 months in or 10 years deep, the journaling system adapts to your complexity." },
  { q: 'What markets are supported?', a: 'We support Futures, Forex, Crypto, and Stocks. You can track any instrument with a price — options support is coming soon.' },
  { q: 'Can I import trades from my broker?', a: 'Yes. We support CSV imports from major brokers and platforms including Tradovate, NinjaTrader, MetaTrader, and more. Direct API connections are in beta.' },
  { q: 'Is there a free version?', a: 'Yes — the Starter plan is free forever with up to 50 trades/month. No credit card required to get started.' },
  { q: 'How is my data protected?', a: 'All data is encrypted in transit and at rest. We never sell your trading data. You can export or delete your data at any time.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. No contracts, no hidden fees. Cancel your subscription in one click and your data remains accessible for 30 days.' },
]

const APP_URL = 'https://limitless-journal.vercel.app'

const smoothScrollToId = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
const smoothScrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const S = {
  bg: '#080808',
  card: '#0d0d0d',
  border: '#1f1f1f',
  text: '#ffffff',
  muted: '#888888',
  muted2: '#444444',
  radius: '14px',
  radiusSm: '10px',
}

// ─── GRAIN OVERLAY ───────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <svg
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, opacity: 0.03 }}
      aria-hidden="true"
    >
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  )
}

// ─── AURORA BLOBS ─────────────────────────────────────────────────────────────
function AuroraBlobs() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div style={{ position: 'absolute', top: '30%', right: '-15%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,220,255,0.025) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '20%', width: '55vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.02) 0%, transparent 70%)', filter: 'blur(70px)' }} />
    </div>
  )
}

// ─── FADE IN ON SCROLL ────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, y = 24, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      style={style}
    >
      {children}
    </motion.div>
  )
}

// ─── ANIMATED SECTION (scroll-progress driven reveal) ────────────────────────
function AnimatedSection({ children, style = {} }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['0 1', '0.5 1'] })
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const y = useTransform(scrollYProgress, [0, 1], [40, 0])
  return (
    <motion.div ref={ref} style={{ opacity, y, ...style }}>
      {children}
    </motion.div>
  )
}

// ─── COUNT UP NUMBER ──────────────────────────────────────────────────────────
function CountUp({ to, prefix = '', suffix = '', format, duration = 1.5 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (to === 0) { setVal(0); return }
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(to * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return <span ref={ref}>{prefix}{format ? format(val) : val}{suffix}</span>
}

// ─── COUNT DOWN NUMBER ────────────────────────────────────────────────────────
function CountDown({ from, to, duration = 1.5, style = {} }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [val, setVal] = useState(from)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(from + (to - from) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, from, to, duration])

  return <span ref={ref} style={style}>{val}</span>
}

// ─── MARQUEE TICKER ───────────────────────────────────────────────────────────
function Marquee() {
  const items = ['NQ', 'ES', 'EUR/USD', 'GBP/USD', 'BTC', 'Gold', 'Silver', 'Forex', 'Futures', 'Crypto']
  const block = items.join(' · ') + ' · '

  return (
    <div style={{
      position: 'relative', zIndex: 1,
      height: '44px', display: 'flex', alignItems: 'center', overflow: 'hidden',
      borderTop: `1px solid #1f1f1f`, borderBottom: `1px solid #1f1f1f`,
      background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '120px', background: 'linear-gradient(90deg, #080808, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '120px', background: 'linear-gradient(270deg, #080808, transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', whiteSpace: 'nowrap', flexShrink: 0, willChange: 'transform' }}
      >
        {[...Array(8)].map((_, i) => (
          <span key={i} style={{ fontSize: '12px', color: '#666', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', padding: '0 18px' }}>{block}</span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── CURSOR EFFECT (desktop only) ─────────────────────────────────────────────
function CursorEffect() {
  const [enabled, setEnabled] = useState(false)
  const [hover, setHover] = useState(false)
  const dotX = useMotionValue(-100)
  const dotY = useMotionValue(-100)
  const ringX = useSpring(dotX, { damping: 22, stiffness: 240, mass: 0.5 })
  const ringY = useSpring(dotY, { damping: 22, stiffness: 240, mass: 0.5 })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isDesktop = window.matchMedia('(min-width: 900px)').matches && !('ontouchstart' in window)
    if (!isDesktop) return
    setEnabled(true)
    document.documentElement.style.cursor = 'none'

    const move = (e) => { dotX.set(e.clientX); dotY.set(e.clientY) }
    const onOver = (e) => { if (e.target.closest('button, a, [role="button"]')) setHover(true) }
    const onOut  = (e) => { if (e.target.closest('button, a, [role="button"]')) setHover(false) }

    window.addEventListener('mousemove', move, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    return () => {
      document.documentElement.style.cursor = ''
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [dotX, dotY])

  if (!enabled) return null
  return (
    <>
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, x: dotX, y: dotY,
        width: 6, height: 6, marginLeft: -3, marginTop: -3,
        borderRadius: '50%', background: '#fff',
        pointerEvents: 'none', zIndex: 99999, mixBlendMode: 'difference',
      }} />
      <motion.div
        animate={{ scale: hover ? 1.7 : 1, opacity: hover ? 0.8 : 0.5 }}
        transition={{ type: 'spring', damping: 18, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, left: 0, x: ringX, y: ringY,
          width: 36, height: 36, marginLeft: -18, marginTop: -18,
          borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.6)',
          pointerEvents: 'none', zIndex: 99998, mixBlendMode: 'difference',
        }}
      />
      <style>{`
        @media (max-width: 899px) { html { cursor: auto !important; } }
      `}</style>
    </>
  )
}

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = [
    { left: '6%',  top: '14%', size: 2,   dur: 3.5, delay: 0 },
    { left: '92%', top: '10%', size: 1.5, dur: 4.2, delay: 1.2 },
    { left: '96%', top: '58%', size: 2,   dur: 3.8, delay: 0.6 },
    { left: '2%',  top: '75%', size: 1.5, dur: 4.6, delay: 2 },
    { left: '55%', top: '97%', size: 2,   dur: 3.2, delay: 1.5 },
    { left: '78%', top: '88%', size: 1,   dur: 5.1, delay: 0.3 },
  ]
  return (
    <div style={{ position: 'absolute', inset: '-40px', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -14, 0], opacity: [0.12, 0.45, 0.12] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: '50%', background: 'rgba(255,255,255,0.85)' }}
        />
      ))}
    </div>
  )
}

// ─── DASHBOARD MOCKUP ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] })
  const rotX = useTransform(scrollYProgress, [0, 1], [8, 0])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 50, y: 60 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1.1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'relative', width: '100%', maxWidth: '760px' }}
    >
      {/* Ambient green glow */}
      <div style={{ position: 'absolute', top: '40%', left: '40%', transform: 'translate(-50%,-50%)', width: '110%', height: '110%', background: 'radial-gradient(ellipse at center, rgba(0,255,100,0.07) 0%, transparent 62%)', pointerEvents: 'none', zIndex: 0 }} />

      <FloatingParticles />

      {/* 3D floating window */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <motion.div style={{
          rotateX: rotX,
          rotateY: -10,
          transformPerspective: 1200,
          transformOrigin: 'center center',
          background: '#0b0b0b',
          border: '1px solid #272727',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 0 100px rgba(0,255,100,0.06), 0 60px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>

          {/* ── macOS title bar ── */}
          <div style={{ height: '30px', background: '#090909', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 12px', gap: '10px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c841' }} />
            </div>
            <span style={{ fontSize: '9px', color: '#2c2c2c', letterSpacing: '0.2px' }}>LIMITLESS — Private Journal</span>
          </div>

          <img src="/dashboard2.png" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '0 0 12px 12px' }} />
        </motion.div>

        {/* Floating badge */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          style={{
            position: 'absolute', bottom: '-20px', left: '32px',
            background: 'rgba(6,6,6,0.92)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: '100px', padding: '7px 18px 7px 12px',
            display: 'flex', alignItems: 'center', gap: '8px',
            backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 0 28px rgba(74,222,128,0.12), 0 6px 24px rgba(0,0,0,0.55)',
          }}
        >
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80', display: 'block', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#c8c8c8', fontWeight: 500, whiteSpace: 'nowrap' }}>Live Dashboard Preview</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 20)
      setVisible(y < lastY.current || y < 80)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setMenuOpen(false)
    smoothScrollToId(id.toLowerCase().replace(/\s+/g, '-'))
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: '64px',
          background: scrolled ? 'rgba(8,8,8,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? `1px solid ${S.border}` : '1px solid transparent',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={smoothScrollToTop}
        >
          <img src="/logo2.png" height="28" alt="Limitless logo" style={{ display: 'block' }} />
          <span style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.3px', color: S.text }}>LIMITLESS</span>
        </div>

        {/* Desktop center links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} className="nav-desktop">
          {NAV_LINKS.map(link => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              style={{ background: 'none', border: 'none', color: S.muted, fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '6px 14px', borderRadius: '8px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = S.text}
              onMouseLeave={e => e.currentTarget.style.color = S.muted}
            >
              {link}
            </button>
          ))}
        </div>

        {/* Desktop right CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="nav-desktop">
          <button
            onClick={() => window.location.href = APP_URL}
            style={{ background: 'none', border: `1px solid ${S.border}`, color: S.muted, fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '7px 18px', borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = S.text }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.muted }}
          >
            Login
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => window.location.href = APP_URL}
            style={{ background: S.text, border: 'none', color: '#000', fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '8px 20px', borderRadius: '8px' }}
          >
            Apply Now
          </motion.button>
        </div>

        {/* Hamburger (mobile) */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="nav-mobile"
          style={{ background: 'none', border: 'none', color: S.text, cursor: 'pointer', padding: '6px', display: 'none' }}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 998, background: 'rgba(8,8,8,0.97)', backdropFilter: 'blur(24px)', borderBottom: `1px solid ${S.border}`, padding: '12px 24px 24px', display: 'flex', flexDirection: 'column', gap: '2px' }}
          >
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => scrollTo(link)}
                style={{ background: 'none', border: 'none', color: S.text, fontSize: '16px', fontWeight: 500, cursor: 'pointer', padding: '14px 0', textAlign: 'left', borderBottom: `1px solid ${S.border}` }}
              >
                {link}
              </button>
            ))}
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => window.location.href = APP_URL} style={{ flex: 1, background: 'none', border: `1px solid ${S.border}`, color: S.text, fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: '12px', borderRadius: '10px' }}>Login</button>
              <button onClick={() => window.location.href = APP_URL} style={{ flex: 1, background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '12px', borderRadius: '10px' }}>Apply Now</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
const HEADLINE_LINES = [
  ['Turn', 'Your', 'Trades'],
  ['Into', 'Data.', 'Your'],
  ['Data', 'Into', 'Profit.'],
]

function Hero() {
  let wordIdx = 0

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 40px 80px',
      position: 'relative', zIndex: 1,
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '40px 40px',
    }}>
      {/* Hero edge fade so dot grid feathers into surrounding bg */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, #080808 85%)', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '420px 1fr', gap: '56px', alignItems: 'center', position: 'relative', zIndex: 2 }} className="hero-grid">

        {/* Left text */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}>
            <motion.div
              animate={{ boxShadow: ['0 0 0 1px rgba(255,255,255,0.10), 0 0 18px rgba(255,255,255,0.06)', '0 0 0 1px rgba(255,255,255,0.22), 0 0 32px rgba(255,255,255,0.16)', '0 0 0 1px rgba(255,255,255,0.10), 0 0 18px rgba(255,255,255,0.06)'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '100px', padding: '6px 16px', marginBottom: '28px' }}
            >
              <Lock size={12} color="#e5e5e5" style={{ display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#e5e5e5', fontWeight: 600, letterSpacing: '-0.1px' }}>
                Early Access — <span style={{ color: S.muted, fontWeight: 500 }}>First 100 traders get priority approval</span>
              </span>
            </motion.div>
          </motion.div>

          <h1 style={{ fontSize: 'clamp(38px, 4.2vw, 56px)', fontWeight: 800, lineHeight: 1.07, letterSpacing: '-2.5px', color: S.text, margin: '0 0 22px' }}>
            {HEADLINE_LINES.map((line, li) => (
              <span key={li} style={{ display: 'block' }}>
                {line.map((word) => {
                  const i = wordIdx++
                  return (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
                      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.08 }}
                      style={{ display: 'inline-block', marginRight: '0.25em', willChange: 'transform, filter, opacity' }}
                    >
                      {word}
                    </motion.span>
                  )
                })}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ fontSize: '17px', lineHeight: 1.65, color: S.muted, maxWidth: '380px', margin: '0 0 36px' }}
          >
            Join the early access waitlist for LIMITLESS — a private trading journal built for serious traders. Limited spots available.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}
          >
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = APP_URL}
              style={{ background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '13px 28px', borderRadius: '10px', letterSpacing: '-0.2px' }}>
              Apply for Early Access →
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => smoothScrollToId('early-access')}
              style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.text, fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: '13px 28px', borderRadius: '10px' }}>
              See Preview
            </motion.button>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.5 }}
            style={{ fontSize: '12px', color: S.muted2 }}>
            No payment required · Limited approvals only · Serious traders only
          </motion.p>
        </div>

        {/* Right mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 0, position: 'relative', zIndex: 1, overflow: 'visible' }} className="hero-mockup">
          <div style={{ transform: 'scale(1.15)', transformOrigin: 'center center' }}>
            <DashboardMockup />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .hero-grid { grid-template-columns: 380px 1fr !important; gap: 32px !important; }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-mockup { display: none !important; }
        }
      `}</style>
    </section>
  )
}

// ─── SOCIAL PROOF ─────────────────────────────────────────────────────────────
function SocialProof() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '72px 40px', borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <p style={{ textAlign: 'center', fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '44px' }}>
            Trusted by serious traders worldwide
          </p>
        </FadeIn>

        {/* Stats bar */}
        <FadeIn delay={0.08}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: S.border, borderRadius: S.radius, overflow: 'hidden', marginBottom: '48px' }} className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{ background: S.bg, padding: '36px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', fontWeight: 800, color: S.text, letterSpacing: '-2px', marginBottom: '6px' }}>
                  <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} format={s.format} />
                </div>
                <div style={{ fontSize: '13px', color: S.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Testimonials */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }} className="testimonial-grid">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: S.radius, padding: '24px', height: '100%' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#1a1a1a', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: S.text, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: S.text }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: S.muted }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '12px' }}>
                  {[...Array(5)].map((_, j) => <Star key={j} size={12} fill={S.text} color={S.text} />)}
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.65, color: S.muted }}>"{t.quote}"</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── FEATURE CARD (with mouse spotlight) ──────────────────────────────────────
function FeatureCard({ feature, index }) {
  const Icon = feature.icon
  const ref = useRef(null)
  const mouseX = useMotionValue(-200)
  const mouseY = useMotionValue(-200)
  const [active, setActive] = useState(false)

  const onMouseMove = (e) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    mouseX.set(e.clientX - r.left)
    mouseY.set(e.clientY - r.top)
  }

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(260px circle at ${x}px ${y}px, rgba(255,255,255,0.08), transparent 60%)`
  )

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      style={{ position: 'relative', background: S.card, border: `1px solid ${S.border}`, borderRadius: S.radius, padding: '32px 28px', height: '100%', overflow: 'hidden' }}
    >
      <motion.div
        aria-hidden="true"
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ position: 'absolute', inset: 0, background, pointerEvents: 'none', zIndex: 0 }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: '#141414', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <Icon size={20} color={S.text} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: S.text, letterSpacing: '-0.5px', marginBottom: '10px' }}>{feature.title}</h3>
        <p style={{ fontSize: '14px', lineHeight: 1.7, color: S.muted, margin: 0 }}>{feature.desc}</p>
      </div>
    </motion.div>
  )
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" style={{ position: 'relative', zIndex: 1, padding: '100px 40px' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>Features</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', lineHeight: 1.1, margin: 0 }}>
              Everything You Need to<br />Improve Your Trading
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }} className="features-grid">
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section id="preview" style={{ position: 'relative', zIndex: 1, padding: '80px 40px 100px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '72px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>How It Works</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', margin: 0 }}>
              Simple. Powerful. Effective.
            </h2>
          </div>
        </FadeIn>

        <div style={{ position: 'relative' }}>
          {/* Connector line — draws itself */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            style={{ transformOrigin: 'left center', position: 'absolute', top: '27px', left: 'calc(12.5% + 28px)', right: 'calc(12.5% + 28px)', height: '1px', background: `linear-gradient(90deg, transparent, ${S.border} 15%, ${S.border} 85%, transparent)` }}
            className="step-line"
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative' }} className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 8px' }}>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.3 + i * 0.12 }}
                  style={{ width: '54px', height: '54px', borderRadius: '50%', background: S.card, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '13px', fontWeight: 700, color: S.text, boxShadow: `0 0 0 8px ${S.bg}` }}
                >
                  {step.num}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.12 }}
                >
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: S.text, marginBottom: '8px', letterSpacing: '-0.3px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.65, color: S.muted, margin: 0 }}>{step.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .step-line { display: none !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── EARLY ACCESS ─────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://fngdbdcpfamcoctmdhyc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZ2RiZGNwZmFtY29jdG1kaHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzg1NjAsImV4cCI6MjA5MDgxNDU2MH0.WfHTTFZqBGXOTll3qcr9OOa5w2vXdurtYW-LL4tqhYY'

function EarlyAccess() {
  const spotsTotal = 100
  const [approvedCount, setApprovedCount] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?status=eq.approved&select=id`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
        })
        const data = await response.json()
        if (!cancelled && Array.isArray(data)) setApprovedCount(data.length)
      } catch {
        if (!cancelled) setApprovedCount(0)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const taken = approvedCount ?? 0
  const remaining = Math.max(0, spotsTotal - taken)
  const percentFilled = Math.min(100, (taken / spotsTotal) * 100)
  const isFull = taken >= spotsTotal

  const bullets = [
    'Full access to every feature — no limits, no paywalls',
    'Your feedback shapes the product directly',
    'Lock in the lowest price before public launch',
    'Private community of serious traders',
    'Direct access to the founder',
  ]

  const steps = [
    { num: '1', title: 'Apply', desc: 'Click the button and submit your email' },
    { num: '2', title: 'Get Approved', desc: 'We review and approve serious traders only' },
    { num: '3', title: 'Start Journaling', desc: 'Full access, free, immediately' },
  ]

  return (
    <section id="early-access" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{
            position: 'relative',
            background: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '20px',
            padding: '64px 56px',
            boxShadow: '0 0 90px rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.06)',
            overflow: 'hidden',
          }} className="ea-card">
            {/* Soft inner glow */}
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>Early Access</p>
                <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', lineHeight: 1.1, margin: '0 0 18px' }}>
                  Only 100 Traders Get In First.
                </h2>
                <p style={{ fontSize: '16px', color: S.muted, lineHeight: 1.65, maxWidth: '600px', margin: '0 auto' }}>
                  We're opening early access to a small group of serious traders. Free. In exchange for real feedback.
                </p>
              </div>

              {/* Spots counter */}
              <div style={{ maxWidth: '520px', margin: '0 auto 56px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: S.muted, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                    {isFull
                      ? 'All spots taken — join waitlist'
                      : approvedCount === null
                        ? `${spotsTotal} spots remaining`
                        : <><CountDown key={`rem-${remaining}`} from={spotsTotal} to={remaining} /> spots remaining</>}
                  </span>
                  <span style={{ fontSize: '15px', color: S.text, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    <span style={{ color: '#ff4d4d' }}>
                      <CountUp key={`take-${taken}`} to={taken} />
                    </span>
                    <span style={{ color: S.muted2 }}> / {spotsTotal} spots taken</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#161616', border: `1px solid ${S.border}`, borderRadius: '100px', overflow: 'hidden', marginBottom: '12px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentFilled}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #ff3d3d 0%, #ff6b4d 100%)', borderRadius: '100px', boxShadow: '0 0 14px rgba(255,77,77,0.55)' }}
                  />
                </div>
                <p style={{ fontSize: '12px', color: S.muted2, textAlign: 'center', margin: 0 }}>
                  Spots are approved manually — not first come first served
                </p>
              </div>

              {/* Bullets */}
              <div style={{ marginBottom: '52px' }}>
                <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '24px', fontWeight: 600, textAlign: 'center' }}>What you get</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', columnGap: '40px', rowGap: '14px', maxWidth: '760px', margin: '0 auto' }} className="ea-bullets">
                  {bullets.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-60px' }}
                      transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                    >
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={11} color={S.text} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#d0d0d0', lineHeight: 1.6 }}>{b}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* How it works — 3 horizontal steps */}
              <div style={{ marginBottom: '48px' }}>
                <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '28px', fontWeight: 600, textAlign: 'center' }}>How it works</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="ea-steps">
                  {steps.map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid ${S.border}`, borderRadius: '12px', padding: '24px 20px', textAlign: 'center' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#141414', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: S.text, margin: '0 auto 14px' }}>
                        {s.num}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: S.text, marginBottom: '6px', letterSpacing: '-0.2px' }}>{s.title}</div>
                      <div style={{ fontSize: '13px', color: S.muted, lineHeight: 1.55 }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div style={{ textAlign: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(255,255,255,0.22)' }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => window.location.href = APP_URL}
                  style={{ background: S.text, border: 'none', color: '#000', fontSize: '16px', fontWeight: 700, cursor: 'pointer', padding: '16px 36px', borderRadius: '12px', letterSpacing: '-0.2px', boxShadow: '0 0 40px rgba(255,255,255,0.12)', transition: 'box-shadow 0.3s' }}
                >
                  Apply for Early Access →
                </motion.button>
                <p style={{ fontSize: '12px', color: S.muted2, lineHeight: 1.55, maxWidth: '440px', margin: '20px auto 0' }}>
                  This is for active traders only. Not for beginners looking for signals.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .ea-card { padding: 44px 24px !important; }
          .ea-bullets { grid-template-columns: 1fr !important; }
          .ea-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>FAQ</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: 'rgba(13,13,13,0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: `1px solid ${open === i ? 'rgba(255,255,255,0.18)' : S.border}`,
                borderRadius: S.radiusSm,
                overflow: 'hidden',
                transition: 'border-color 0.2s, background 0.2s',
              }}
            >
              <motion.button
                layout="position"
                onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left', gap: '16px' }}
              >
                <span style={{ fontSize: '15px', fontWeight: 600, color: S.text, letterSpacing: '-0.2px' }}>{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                  style={{ color: S.muted, flexShrink: 0, display: 'flex' }}
                >
                  <ChevronDown size={18} />
                </motion.span>
              </motion.button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0 24px 20px', borderTop: `1px solid ${S.border}` }}>
                      <p style={{ fontSize: '14px', lineHeight: 1.72, color: S.muted, paddingTop: '16px', margin: 0 }}>{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FINAL CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ position: 'relative', zIndex: 1, padding: '120px 40px', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: `linear-gradient(90deg, transparent, ${S.border} 30%, ${S.border} 70%, transparent)` }} />

      <FadeIn>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800, color: S.text, letterSpacing: '-2.5px', lineHeight: 1.08, margin: '0 0 20px' }}>
            Start Taking Your Trading<br />Seriously Today
          </h2>
          <p style={{ fontSize: '17px', color: S.muted, lineHeight: 1.6, margin: '0 0 44px' }}>
            Join hundreds of traders already improving with LIMITLESS
          </p>
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.href = APP_URL}
            style={{ background: S.text, border: 'none', color: '#000', fontSize: '17px', fontWeight: 700, cursor: 'pointer', padding: '17px 44px', borderRadius: '13px', letterSpacing: '-0.3px', boxShadow: '0 0 40px rgba(255,255,255,0.12)', transition: 'box-shadow 0.3s' }}
          >
            Apply for Early Access →
          </motion.button>
          <p style={{ fontSize: '13px', color: S.muted2, marginTop: '18px' }}>No payment required · Limited approvals only · Serious traders only</p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id) => smoothScrollToId(id)

  return (
    <footer style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${S.border}`, padding: '48px 40px 40px' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '28px' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <img src="/logo2.png" height="24" alt="Limitless logo" style={{ display: 'block' }} />
            <span style={{ fontWeight: 700, fontSize: '15px', color: S.text, letterSpacing: '-0.2px' }}>LIMITLESS</span>
          </div>
          <p style={{ fontSize: '13px', color: S.muted2, margin: 0 }}>Built for serious traders</p>
        </div>

        {/* Links */}
        <nav style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {[['Features', 'features'], ['Early Access', 'early-access'], ['FAQ', 'faq'], ['Login', null]].map(([label, id]) => (
            <button
              key={label}
              onClick={() => id ? scrollTo(id) : window.location.href = APP_URL}
              style={{ background: 'none', border: 'none', color: S.muted, fontSize: '13px', cursor: 'pointer', padding: '6px 12px', borderRadius: '6px', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = S.text}
              onMouseLeave={e => e.currentTarget.style.color = S.muted}
            >
              {label}
            </button>
          ))}
        </nav>

        <p style={{ fontSize: '13px', color: S.muted2, margin: 0 }}>© 2026 LIMITLESS. All rights reserved.</p>
      </div>
    </footer>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div style={{ background: S.bg, minHeight: '100vh', position: 'relative' }}>
      <GrainOverlay />
      <AuroraBlobs />
      <CursorEffect />
      <Navbar />
      <Hero />
      <Marquee />
      <AnimatedSection><SocialProof /></AnimatedSection>
      <AnimatedSection><Features /></AnimatedSection>
      <AnimatedSection><HowItWorks /></AnimatedSection>
      <AnimatedSection><EarlyAccess /></AnimatedSection>
      <AnimatedSection><FAQ /></AnimatedSection>
      <AnimatedSection><FinalCTA /></AnimatedSection>
      <Footer />
    </div>
  )
}
