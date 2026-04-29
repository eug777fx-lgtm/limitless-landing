import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  BarChart2, BookOpen, Tag, Target, Menu, X, ChevronDown,
  Check, Star
} from 'lucide-react'

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const NAV_LINKS = ['Features', 'Preview', 'Early Access', 'Pricing', 'FAQ']

const STATS = [
  { value: '10,000+', label: 'Trades Tracked' },
  { value: '500+', label: 'Active Traders' },
  { value: '2M+', label: 'Data Points Analyzed' },
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: 12 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: 'relative', width: '100%', maxWidth: '760px' }}
    >
      {/* Ambient green glow */}
      <div style={{ position: 'absolute', top: '40%', left: '40%', transform: 'translate(-50%,-50%)', width: '110%', height: '110%', background: 'radial-gradient(ellipse at center, rgba(0,255,100,0.07) 0%, transparent 62%)', pointerEvents: 'none', zIndex: 0 }} />

      <FloatingParticles />

      {/* 3D floating window */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <div style={{
          transform: 'perspective(1200px) rotateY(-10deg) rotateX(4deg)',
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
        </div>

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
    document.getElementById(id.toLowerCase().replace(/\s+/g, '-'))?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <motion.nav
        animate={{ y: visible ? 0 : -80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.28, ease: 'easeInOut' }}
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
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
            Start Journaling
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
              <button onClick={() => window.location.href = APP_URL} style={{ flex: 1, background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '12px', borderRadius: '10px' }}>Start Journaling</button>
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
function Hero() {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 40px 80px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '420px 1fr', gap: '56px', alignItems: 'center' }} className="hero-grid">

        {/* Left text */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#111', border: `1px solid ${S.border}`, borderRadius: '100px', padding: '5px 14px 5px 8px', marginBottom: '28px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 8px #4ade80', flexShrink: 0, display: 'block' }} />
              <span style={{ fontSize: '12px', color: S.muted }}>Now in open beta — try free</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: 'clamp(38px, 4.2vw, 56px)', fontWeight: 800, lineHeight: 1.07, letterSpacing: '-2.5px', color: S.text, margin: '0 0 22px' }}
          >
            Turn Your Trades<br />Into Data. Your<br />Data Into Profit.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ fontSize: '17px', lineHeight: 1.65, color: S.muted, maxWidth: '380px', margin: '0 0 36px' }}
          >
            Track, analyze, and fix your trading mistakes with a powerful journaling system built for serious traders.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.26 }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '18px' }}
          >
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => window.location.href = APP_URL}
              style={{ background: S.text, border: 'none', color: '#000', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: '13px 28px', borderRadius: '10px', letterSpacing: '-0.2px' }}>
              Start Free Trial
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'transparent', border: `1px solid ${S.border}`, color: S.text, fontSize: '15px', fontWeight: 500, cursor: 'pointer', padding: '13px 28px', borderRadius: '10px' }}>
              See How It Works
            </motion.button>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontSize: '12px', color: S.muted2 }}>
            No credit card required · Cancel anytime
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: S.border, borderRadius: S.radius, overflow: 'hidden', marginBottom: '48px' }}>
            {STATS.map((s, i) => (
              <div key={i} style={{ background: S.bg, padding: '36px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', fontWeight: 800, color: S.text, letterSpacing: '-2px', marginBottom: '6px' }}>{s.value}</div>
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
        @media (max-width: 768px) {
          .testimonial-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
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
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <FadeIn key={i} delay={i * 0.09}>
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 12px 48px rgba(255,255,255,0.05)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: S.radius, padding: '32px 28px', height: '100%' }}
                >
                  <div style={{ width: '46px', height: '46px', borderRadius: '11px', background: '#141414', border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon size={20} color={S.text} />
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: S.text, letterSpacing: '-0.5px', marginBottom: '10px' }}>{f.title}</h3>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: S.muted, margin: 0 }}>{f.desc}</p>
                </motion.div>
              </FadeIn>
            )
          })}
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
          {/* Connector line */}
          <div style={{ position: 'absolute', top: '27px', left: 'calc(12.5% + 28px)', right: 'calc(12.5% + 28px)', height: '1px', background: `linear-gradient(90deg, transparent, ${S.border} 15%, ${S.border} 85%, transparent)` }} className="step-line" />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', position: 'relative' }} className="steps-grid">
            {STEPS.map((step, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <div style={{ textAlign: 'center', padding: '0 8px' }}>
                  <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: S.card, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '13px', fontWeight: 700, color: S.text, boxShadow: `0 0 0 8px ${S.bg}` }}>
                    {step.num}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: S.text, marginBottom: '8px', letterSpacing: '-0.3px' }}>{step.title}</h3>
                  <p style={{ fontSize: '13px', lineHeight: 1.65, color: S.muted, margin: 0 }}>{step.desc}</p>
                </div>
              </FadeIn>
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
function EarlyAccess() {
  const spotsTotal = 100
  const spotsRemaining = 67
  const spotsTaken = spotsTotal - spotsRemaining
  const percentFilled = (spotsTaken / spotsTotal) * 100

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', color: S.muted, textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>Spots remaining</span>
                  <span style={{ fontSize: '15px', color: S.text, fontWeight: 700, letterSpacing: '-0.3px' }}>
                    <span style={{ color: '#ff4d4d' }}>{spotsRemaining}</span>
                    <span style={{ color: S.muted2 }}> / {spotsTotal}</span>
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#161616', border: `1px solid ${S.border}`, borderRadius: '100px', overflow: 'hidden', marginBottom: '12px' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentFilled}%` }}
                    viewport={{ once: true, margin: '-60px' }}
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
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        <Check size={11} color={S.text} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: '14px', color: '#d0d0d0', lineHeight: 1.6 }}>{b}</span>
                    </div>
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

// ─── PRICING ──────────────────────────────────────────────────────────────────
function Pricing() {
  const [yearly, setYearly] = useState(false)

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      sub: '',
      note: 'No credit card required',
      desc: 'For traders getting started',
      features: ['Up to 50 trades/month', 'Basic performance stats', 'Trade log & notes', 'CSV export', 'Community access'],
      cta: 'Get Started Free',
      pop: false,
    },
    {
      name: 'Pro',
      price: yearly ? '$7' : '$10',
      sub: '/month',
      note: yearly ? 'Billed $84/year' : 'Billed monthly',
      desc: 'For active, serious traders',
      features: ['Unlimited trades', 'Full analytics suite', 'Screenshot attachments', 'Setup tagging & filters', 'Discipline tracking', 'Priority support', 'API access (beta)'],
      cta: 'Start Free Trial',
      pop: true,
      badge: 'Most Popular',
    },
    {
      name: 'Lifetime',
      price: '$200',
      sub: ' one-time',
      note: 'Pay once, own forever',
      desc: 'Everything, forever',
      features: ['Everything in Pro', 'Lifetime updates', 'Priority support', 'Early feature access', 'Founding member badge', 'Private community'],
      cta: 'Get Lifetime Access',
      pop: false,
    },
  ]

  return (
    <section id="pricing" style={{ position: 'relative', zIndex: 1, padding: '100px 40px', borderTop: `1px solid ${S.border}` }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', color: S.muted2, textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '16px' }}>Pricing</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 46px)', fontWeight: 800, color: S.text, letterSpacing: '-2px', margin: '0 0 36px' }}>
              Simple, Transparent Pricing
            </h2>

            {/* Billing toggle */}
            <div style={{ display: 'inline-flex', alignItems: 'center', background: '#0f0f0f', border: `1px solid ${S.border}`, borderRadius: '100px', padding: '4px' }}>
              {[['Monthly', false], ['Yearly', true]].map(([label, val]) => (
                <button
                  key={label}
                  onClick={() => setYearly(val)}
                  style={{
                    background: yearly === val ? S.text : 'transparent',
                    color: yearly === val ? '#000' : S.muted,
                    border: 'none', cursor: 'pointer', padding: '8px 22px', borderRadius: '100px',
                    fontSize: '13px', fontWeight: 600, transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '7px',
                  }}
                >
                  {label}
                  {val && (
                    <span style={{ fontSize: '10px', background: yearly ? 'rgba(0,0,0,0.15)' : '#161616', color: yearly ? '#000' : '#4ade80', padding: '2px 7px', borderRadius: '100px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      2 months free
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }} className="pricing-grid">
          {plans.map((plan, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  background: plan.pop ? '#0f0f0f' : S.card,
                  border: plan.pop ? '1px solid rgba(255,255,255,0.18)' : `1px solid ${S.border}`,
                  borderRadius: '16px',
                  padding: plan.pop ? '36px 30px' : '30px',
                  position: 'relative',
                  boxShadow: plan.pop ? '0 0 80px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.07)' : 'none',
                }}
              >
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: S.text, color: '#000', fontSize: '11px', fontWeight: 700, padding: '4px 16px', borderRadius: '100px', whiteSpace: 'nowrap', letterSpacing: '0.3px' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: '28px' }}>
                  <div style={{ fontSize: '12px', color: S.muted, marginBottom: '8px', fontWeight: 500 }}>{plan.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '44px', fontWeight: 800, color: S.text, letterSpacing: '-2.5px', lineHeight: 1 }}>{plan.price}</span>
                    {plan.sub && <span style={{ fontSize: '14px', color: S.muted }}>{plan.sub}</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: S.muted2, marginBottom: '10px' }}>{plan.note}</div>
                  <div style={{ fontSize: '13px', color: S.muted }}>{plan.desc}</div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => window.location.href = APP_URL}
                  style={{
                    width: '100%', background: plan.pop ? S.text : 'transparent',
                    border: plan.pop ? 'none' : `1px solid ${S.border}`,
                    color: plan.pop ? '#000' : S.text,
                    fontSize: '14px', fontWeight: 700, cursor: 'pointer', padding: '13px', borderRadius: '10px', marginBottom: '24px',
                  }}
                >
                  {plan.cta}
                </motion.button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                  {plan.features.map((feat, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: plan.pop ? 'rgba(255,255,255,0.1)' : '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={10} color={S.text} strokeWidth={2.5} />
                      </div>
                      <span style={{ fontSize: '13px', color: S.muted }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .pricing-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ background: S.card, border: `1px solid ${open === i ? '#2e2e2e' : S.border}`, borderRadius: S.radiusSm, overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <button
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
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 24px 20px', borderTop: `1px solid ${S.border}` }}>
                        <p style={{ fontSize: '14px', lineHeight: 1.72, color: S.muted, paddingTop: '16px', margin: 0 }}>{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
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
            Start Free Trial
          </motion.button>
          <p style={{ fontSize: '13px', color: S.muted2, marginTop: '18px' }}>No credit card required · Cancel anytime</p>
        </div>
      </FadeIn>
    </section>
  )
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

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
          {[['Features', 'features'], ['Pricing', 'pricing'], ['FAQ', 'faq'], ['Login', null]].map(([label, id]) => (
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
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <EarlyAccess />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  )
}
