import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'

export const APP_URL = 'https://app.limitless-journal.com'
export const SIGNUP_URL = APP_URL
export const LOGIN_URL = APP_URL
export const PRICE = 15

// Public Supabase client key (same one the app ships). Only used for the Pro early list.
export const SUPABASE_URL = 'https://fngdbdcpfamcoctmdhyc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZ2RiZGNwZmFtY29jdG1kaHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzg1NjAsImV4cCI6MjA5MDgxNDU2MH0.WfHTTFZqBGXOTll3qcr9OOa5w2vXdurtYW-LL4tqhYY'
export const SUPABASE_HEADERS = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }

// ── Routing: real paths (/, /pricing, /blog, /blog/:slug, /terms …) with history ──
export function parseRoute(pathname) {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (p === '/') return { page: 'home' }
  if (p === '/pricing') return { page: 'pricing' }
  if (p === '/blog') return { page: 'blog' }
  const m = p.match(/^\/blog\/([^/]+)$/)
  if (m) return { page: 'article', slug: decodeURIComponent(m[1]) }
  if (['/terms', '/privacy', '/refunds'].includes(p)) return { page: 'legal', doc: p.slice(1) }
  return { page: 'notfound' }
}

const RouterContext = createContext({ route: { page: 'home' }, navigate: () => {} })
export const useRouter = () => useContext(RouterContext)

export function RouterProvider({ children }) {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname))
  useEffect(() => {
    const onPop = () => setRoute(parseRoute(window.location.pathname))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const navigate = useCallback((path, hash) => {
    const go = () => {
      if (hash) {
        const el = document.getElementById(hash)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    if (path === window.location.pathname) {
      if (hash) go(); else window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.history.pushState({}, '', path)
    setRoute(parseRoute(path))
    window.scrollTo({ top: 0 })
    if (hash) setTimeout(go, 120)
  }, [])
  return <RouterContext.Provider value={{ route, navigate }}>{children}</RouterContext.Provider>
}

// Link that uses client routing for internal paths
export function Link({ to, hash, children, className, style, onClick, ...rest }) {
  const { navigate } = useRouter()
  const href = to + (hash ? '#' + hash : '')
  return (
    <a href={href} className={className} style={style} {...rest}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault(); onClick && onClick(e); navigate(to, hash)
      }}>{children}</a>
  )
}

export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag) }
      tag.setAttribute('content', description)
    }
  }, [title, description])
}

// Adds .in to elements as they enter the viewport (content is visible without it)
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]:not(.in)')
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  })
}

// Pointer-following light on glass + gentle 3D tilt on [data-tilt]
export function useGlassLight() {
  useEffect(() => {
    let last = null
    const on = (e) => {
      const el = e.target.closest && e.target.closest('.glass')
      if (last && last !== el) { last.style.removeProperty('--mx'); last.style.removeProperty('--my') }
      if (!el) { last = null; return }
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - r.left}px`)
      el.style.setProperty('--my', `${e.clientY - r.top}px`)
      last = el
    }
    document.addEventListener('pointermove', on, { passive: true })
    return () => document.removeEventListener('pointermove', on)
  }, [])
}

export function useTilt(max = 6) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches) return
    let raf = 0
    const move = (e) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => { el.style.transform = `perspective(1400px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)` })
    }
    const leave = () => { cancelAnimationFrame(raf); el.style.transform = 'perspective(1400px) rotateX(0) rotateY(0)' }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave) }
  }, [max])
  return ref
}

export const wordSize = (word, size) => `min(${size}px, ${(94 / (Math.max(4, word.length) * 0.66)).toFixed(1)}vw)`
