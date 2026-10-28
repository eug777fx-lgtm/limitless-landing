import { useEffect, useState } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import { Link, useRouter, SIGNUP_URL, LOGIN_URL } from '../lib/site.jsx'
import { Logo } from './ui.jsx'

const LINKS = [
  { label: 'Features', to: '/', hash: 'features' },
  { label: 'Rules', to: '/', hash: 'rules' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Blog', to: '/blog' },
  { label: 'FAQ', to: '/', hash: 'faq' },
]

export function SiteNav() {
  const { route } = useRouter()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  // Tuck the capsule away while scrolling down, bring it back on the way up
  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      setHidden(y > 260 && y > last + 4)
      if (y < last - 4 || y < 260) setHidden(false)
      last = y
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => { setOpen(false) }, [route])
  useEffect(() => {
    if (!open) return
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  const current = (l) => (l.to === '/pricing' && route.page === 'pricing') || (l.to === '/blog' && (route.page === 'blog' || route.page === 'article'))

  return (
    <div className={'topnav' + (hidden && !open ? ' hide' : '')}>
      <nav aria-label="Main" className="capsule glass" style={{ '--fill': 0.09, '--blur': 30 + 'px' }}>
        <Link to="/" className="logo-dot ink" aria-label="LIMITLESS home"><Logo /></Link>
        <span className="hide-md" style={{ display: 'contents' }}>
          {LINKS.map((l) => <Link key={l.label} to={l.to} hash={l.hash} className="nav-link" aria-current={current(l) ? 'page' : undefined}>{l.label}</Link>)}
          <a href={LOGIN_URL} className="nav-link">Log in</a>
        </span>
        <a href={SIGNUP_URL} className="btn btn-primary" style={{ minHeight: 44, marginLeft: 4 }}>Start for $15</a>
        <button type="button" className="icon-btn show-md" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)} style={{ marginLeft: 2 }}>
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>
      {open && (
        <div className="menu-sheet glass show-md" role="dialog" aria-label="Menu">
          {LINKS.map((l) => <Link key={l.label} to={l.to} hash={l.hash} onClick={() => setOpen(false)}>{l.label}</Link>)}
          <a href={LOGIN_URL}>Log in</a>
          <a href={SIGNUP_URL} className="btn btn-primary btn-lg" style={{ justifyContent: 'center', marginTop: 8, borderRadius: 99, fontSize: 15 }}>Start for $15 a month <ArrowRight size={16} /></a>
        </div>
      )}
    </div>
  )
}

export function Footer() {
  return (
    <footer style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--line)' }}>
      <div className="wrap" style={{ paddingBlock: '56px 0' }}>
        <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
          <div className="col" style={{ gap: 12, maxWidth: 320 }}>
            <div className="row" style={{ gap: 10 }}><Logo size={28} /><span className="display" style={{ fontWeight: 600, letterSpacing: '0.22em' }}>LIMITLESS</span></div>
            <p className="faint" style={{ fontSize: 13 }}>The trading journal for funded futures traders.</p>
            <a href={SIGNUP_URL} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>Start for $15</a>
          </div>
          <div className="row" style={{ gap: 56, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="col" style={{ gap: 10, fontSize: 13.5 }}>
              <span className="faint">Product</span>
              <Link to="/" hash="features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <a href={LOGIN_URL}>Log in</a>
            </div>
            <div className="col" style={{ gap: 10, fontSize: 13.5 }}>
              <span className="faint">Learn</span>
              <Link to="/blog">Blog</Link>
              <Link to="/" hash="faq">FAQ</Link>
              <a href="mailto:support@limitless-journal.com">Support</a>
            </div>
            <div className="col" style={{ gap: 10, fontSize: 13.5 }}>
              <span className="faint">Legal</span>
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/refunds">Refunds</Link>
            </div>
          </div>
        </div>
        <p className="faint" style={{ fontSize: 11.5, marginTop: 40, maxWidth: 760, lineHeight: 1.6 }}>LIMITLESS is a journaling and analytics tool, not financial advice. Trading futures and forex carries substantial risk of loss. Sample figures on this site are illustrative. © 2026 LIMITLESS Journal.</p>
      </div>
      <div aria-hidden="true" className="footer-word">LIMITLESS</div>
    </footer>
  )
}
