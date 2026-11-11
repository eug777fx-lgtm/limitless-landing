// Site theme: light (default) or dark, matching the journal. Live liquid paint behind every page.
import React from 'react'
import { Sun, Moon } from 'lucide-react'
import Ink from '../components/Ink.jsx'

const KEY = 'ltj_site_theme'
const read = () => { try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' } }
let theme = typeof window !== 'undefined' ? read() : 'light'
const subs = new Set()
export const setSiteTheme = (t) => { theme = t; try { localStorage.setItem(KEY, t) } catch { /* ignore */ } subs.forEach((f) => f()) }
export const useTheme = () => React.useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f) }, () => theme, () => 'light')

export function useSiteTheme() {
  const t = useTheme()
  React.useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', t)
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', t === 'light' ? '#F1F2F3' : '#000000')
  }, [t])
}

export function SiteScene() {
  const t = useTheme()
  const light = t === 'light'
  return (
    <div className="site-scene" aria-hidden="true">
      <Ink key={t} range={light ? [0.865, 0.985] : [0.012, 0.13]} highlight={light ? 0.07 : 0.16} zoom={1.25} scale={0.42} phoneFps={15} phoneScale={0.45} />
    </div>
  )
}

export function ThemeToggle() {
  const t = useTheme()
  return (
    <button type="button" className="icon-btn theme-btn" aria-label={t === 'light' ? 'Dark mode' : 'Light mode'} onClick={() => setSiteTheme(t === 'light' ? 'dark' : 'light')}>
      {t === 'light' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}

// A real screenshot of the journal that follows the site theme
export function Shot({ name, alt = '' }) {
  const t = useTheme()
  return <img className="shot-img" src={`/shots/${name}-${t}.webp`} alt={alt} loading="lazy" decoding="async" />
}
