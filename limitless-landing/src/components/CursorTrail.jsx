import { useEffect, useRef } from 'react'

// Soft white light trail that follows the mouse. Desktop only, off for reduced motion.
export default function CursorTrail() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas || !matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = canvas.getContext('2d')
    const LIFE = 420 // ms a point stays on screen
    let pts = [], raf = 0, running = false, dpr = 1
    const mouse = { x: -100, y: -100 }, head = { x: -100, y: -100 }
    let seen = false

    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const frame = (now) => {
      // the head eases toward the pointer so the line feels liquid
      head.x += (mouse.x - head.x) * 0.42
      head.y += (mouse.y - head.y) * 0.42
      const last = pts[pts.length - 1]
      if (!last || Math.hypot(last.x - head.x, last.y - head.y) > 0.6) pts.push({ x: head.x, y: head.y, t: now })
      pts = pts.filter((p) => now - p.t < LIFE)
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      if (pts.length > 2) {
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 16
        for (let i = 1; i < pts.length - 1; i++) {
          const a = pts[i - 1], b = pts[i], c = pts[i + 1]
          const k = i / (pts.length - 1) // 0 at the tail, 1 at the head
          const fade = 1 - (now - b.t) / LIFE
          ctx.strokeStyle = `rgba(255,255,255,${(0.9 * k * fade).toFixed(3)})`
          ctx.lineWidth = 0.8 + 3.4 * k
          ctx.beginPath()
          ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2)
          ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2)
          ctx.stroke()
        }
      }
      const still = Math.hypot(mouse.x - head.x, mouse.y - head.y) < 0.5
      if (pts.length === 0 && still) { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); return }
      raf = requestAnimationFrame(frame)
    }
    const move = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      mouse.x = e.clientX; mouse.y = e.clientY
      if (!seen) { head.x = mouse.x; head.y = mouse.y; seen = true }
      if (!running) { running = true; raf = requestAnimationFrame(frame) }
    }
    const leave = () => { seen = false; pts = [] }
    size()
    window.addEventListener('resize', size)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
    }
  }, [])
  return <canvas ref={ref} className="cursor-trail" aria-hidden="true" />
}
