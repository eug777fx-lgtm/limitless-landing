// Live presence for the admin Live view: this tab says which page it is on, over the
// Supabase Realtime presence channel the app also uses. Nothing is stored, no personal data:
// page, phone or desktop, time zone, where the visit came from, and when it started.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './site.jsx'

const TOPIC = 'realtime:ltj-live'
const KEY = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
let ws = null, joined = false, ref = 0, beat = 0, retry = 0, sent = '', leaving = false
let state = null

function source() {
  try {
    const q = new URLSearchParams(location.search)
    const utm = q.get('utm_source') || q.get('ref')
    if (utm) return utm.slice(0, 40)
    if (!document.referrer) return ''
    const h = new URL(document.referrer).hostname.replace(/^www\./, '')
    return /limitless-journal\.com$/.test(h) ? '' : h.slice(0, 60)
  } catch { return '' }
}

function base() {
  let z = ''
  try { z = Intl.DateTimeFormat().resolvedOptions().timeZone || '' } catch { /* old browser */ }
  const phone = matchMedia('(pointer: coarse)').matches || matchMedia('(max-width: 760px)').matches
  let r = ''
  try { r = sessionStorage.getItem('ltj_src') || source(); sessionStorage.setItem('ltj_src', r) } catch { r = source() }
  return { k: 'site', p: 'home', d: phone ? 'm' : 'd', z, r, s: Date.now() }
}

const send = (m) => { if (ws && ws.readyState === 1) ws.send(JSON.stringify(m)) }
function track() {
  if (!joined || !state) return
  const next = JSON.stringify(state)
  if (next === sent) return
  sent = next
  send({ topic: TOPIC, event: 'presence', payload: { type: 'presence', event: 'track', payload: state }, ref: String(++ref), join_ref: '1' })
}

function connect() {
  if (ws || typeof WebSocket === 'undefined') return
  const host = SUPABASE_URL.replace(/^https/, 'wss')
  try { ws = new WebSocket(`${host}/realtime/v1/websocket?apikey=${SUPABASE_ANON_KEY}&vsn=1.0.0`) } catch { ws = null; return }
  ws.onopen = () => {
    retry = 0
    send({ topic: TOPIC, event: 'phx_join', payload: { config: { broadcast: { ack: false, self: false }, presence: { key: KEY }, postgres_changes: [], private: false }, access_token: SUPABASE_ANON_KEY }, ref: '1', join_ref: '1' })
    clearInterval(beat)
    beat = setInterval(() => send({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(++ref) }), 25000)
  }
  ws.onmessage = (e) => {
    let m = null
    try { m = JSON.parse(e.data) } catch { return }
    if (m.topic === TOPIC && m.event === 'phx_reply' && m.ref === '1') {
      joined = m.payload && m.payload.status === 'ok'
      sent = ''
      track()
    }
  }
  ws.onclose = () => {
    clearInterval(beat); ws = null; joined = false; sent = ''
    // come back after a drop, slower each time; stop retrying while the tab is hidden
    const wait = Math.min(30000, 2000 * 2 ** retry++)
    if (leaving) return
    setTimeout(() => { if (!document.hidden && !leaving) connect() }, wait)
  }
  ws.onerror = () => { try { ws && ws.close() } catch { /* already closed */ } }
}

export function liveSet(page) {
  if (typeof window === 'undefined') return
  if (!state) state = base()
  state = { ...state, p: page }
  if (!ws) connect()
  else track()
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (!document.hidden && !ws && state) connect() })
  // leaving or reloading: close now so the admin sees the visitor go at once, not a minute later
  window.addEventListener('pagehide', () => { leaving = true; try { ws && ws.close() } catch { /* already closed */ } })
  window.addEventListener('pageshow', (e) => { if (e.persisted) { leaving = false; if (!ws && state) connect() } })
}
