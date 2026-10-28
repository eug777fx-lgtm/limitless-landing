import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Search, Clock, Lightbulb } from 'lucide-react'
import { Link, SIGNUP_URL, usePageMeta, useReveal, wordSize } from '../lib/site.jsx'
import { Backdrop } from '../components/ui.jsx'
import { ARTICLES } from '../content/articles.js'

const slugify = (s) => s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
const CATEGORIES = ['All', 'Psychology', 'Performance', 'Strategy', 'Journaling', 'Funded Trading']
const wordCount = (content) => content.reduce((sum, b) => {
  let n = 0
  if (b.text) n += b.text.trim().split(/\s+/).length
  if (b.items) n += b.items.reduce((s, it) => s + it.trim().split(/\s+/).length, 0)
  return sum + n
}, 0)
export const readTime = (a) => `${Math.max(1, Math.round(wordCount(a.content) / 200))} min read`
const tocFor = (content) => content.filter((b) => b.type === 'h2').map((b) => ({ id: slugify(b.text), text: b.text }))
const related = (article, n = 3) => {
  const others = ARTICLES.filter((a) => a.slug !== article.slug)
  return [...others.filter((a) => a.category === article.category), ...others.filter((a) => a.category !== article.category)].slice(0, n)
}

// Monochrome cover: category word in glass over a soft line, unique per article
function Cover({ article, tall }) {
  const seed = article.slug.length
  const pts = Array.from({ length: 9 }, (_, i) => [i * 50, 90 - ((Math.sin(i * 1.3 + seed) + 1) * 22 + i * 6)])
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1].toFixed(1)).join(' ')
  return (
    <div className="thumb ink cover" style={{ aspectRatio: tall ? '16 / 10' : '16 / 9' }}>
      <svg viewBox="0 0 400 110" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 'auto 0 0 0', width: '100%', height: '62%' }}>
        <defs><linearGradient id={'cv' + seed} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <path d={`${d} L400 110 L0 110 Z`} fill={`url(#cv${seed})`} />
        <path d={d} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="cover-word display" aria-hidden="true">{article.category.split(' ')[0]}</span>
    </div>
  )
}

export function ArticleCard({ article, i = 0 }) {
  return (
    <Link to={`/blog/${article.slug}`} className="glass lift col article-card" data-reveal style={{ '--i': i % 3 }}>
      <Cover article={article} />
      <div className="col" style={{ gap: 10, padding: '18px 6px 6px' }}>
        <div className="row faint" style={{ gap: 10, fontSize: 12.5 }}>
          <span className="tag tag-soft" style={{ padding: '4px 10px' }}>{article.category}</span>
          <span className="row" style={{ gap: 5 }}><Clock size={12} /> {readTime(article)}</span>
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>{article.title}</h3>
        <p className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>{article.excerpt}</p>
      </div>
    </Link>
  )
}

export function BlogIndex() {
  usePageMeta('Blog | LIMITLESS Trading Journal', 'Guides on trading psychology, journaling, risk and passing funded challenges, from the LIMITLESS team.')
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const list = useMemo(() => ARTICLES.filter((a) => (cat === 'All' || a.category === cat) && (!q || (a.title + ' ' + a.excerpt).toLowerCase().includes(q.toLowerCase()))), [q, cat])
  useReveal()
  const [first, ...rest] = list
  const ws = wordSize('BLOG', 300)
  const filtered = q || cat !== 'All'
  return (
    <div className="stage">
      <Backdrop word="BLOG" top={100} size={300} orbs={[{ right: '6%', top: 700, width: 380, height: 380 }]} />
      <header className="wrap" style={{ paddingTop: `calc(${ws} * 0.84 + 130px)`, textAlign: 'center' }}>
        <div className="col enter" style={{ alignItems: 'center', gap: 18 }}>
          <h1 className="h-lg" style={{ '--i': 0 }}>Trade better. Read better.</h1>
          <p className="lead" style={{ '--i': 1, textAlign: 'center' }}>Psychology, risk and journaling guides for traders working toward a funded account.</p>
          <div className="glass row search" style={{ '--i': 2 }}>
            <Search size={17} className="faint" style={{ flexShrink: 0 }} />
            <label htmlFor="blog-q" className="sr">Search articles</label>
            <input id="blog-q" className="input" placeholder="Search articles" value={q} onChange={(e) => setQ(e.target.value)} style={{ background: 'transparent', boxShadow: 'none', height: 48, padding: '0 6px' }} />
          </div>
          <div className="chips" style={{ '--i': 3 }} role="group" aria-label="Category">
            {CATEGORIES.map((c) => <button key={c} type="button" aria-pressed={cat === c} className={cat === c ? 'chip on' : 'chip'} onClick={() => setCat(c)}>{c}</button>)}
          </div>
        </div>
      </header>
      <section className="wrap" style={{ paddingBlock: '56px 110px' }}>
        {!list.length && <div className="well" style={{ borderRadius: 26, padding: 40, textAlign: 'center' }}><p className="muted">No articles match that search.</p></div>}
        {first && !filtered && (
          <Link to={`/blog/${first.slug}`} className="glass lift featured" data-reveal>
            <Cover article={first} tall />
            <div className="col" style={{ gap: 14, justifyContent: 'center', padding: '8px 10px' }}>
              <div className="row faint" style={{ gap: 10, fontSize: 12.5 }}><span className="tag tag-solid">Featured</span><span>{first.category}</span><span>·</span><span>{readTime(first)}</span></div>
              <h2 className="h-md" style={{ fontSize: 'clamp(24px, 3vw, 34px)', lineHeight: 1.15 }}>{first.title}</h2>
              <p className="muted" style={{ fontSize: 15, lineHeight: 1.65 }}>{first.excerpt}</p>
              <span className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Read article <ArrowRight size={15} /></span>
            </div>
          </Link>
        )}
        <div className="blog-grid" style={{ marginTop: filtered ? 0 : 18 }}>
          {(filtered ? list : rest).map((a, i) => <ArticleCard key={a.slug} article={a} i={i} />)}
        </div>
      </section>
    </div>
  )
}

function Block({ b, bySlug }) {
  switch (b.type) {
    case 'h2': return <h2 id={slugify(b.text)}>{b.text}</h2>
    case 'h3': return <h3 id={slugify(b.text)}>{b.text}</h3>
    case 'p': return <p>{b.text}</p>
    case 'ul': return <ul>{b.items.map((t, i) => <li key={i}><span className="dot" aria-hidden="true" />{t}</li>)}</ul>
    case 'ol': return <ol>{b.items.map((t, i) => <li key={i}><span className="n num" aria-hidden="true">{i + 1}</span>{t}</li>)}</ol>
    case 'callout': return <div className="glass callout"><Lightbulb size={18} style={{ flexShrink: 0, marginTop: 3 }} /><p>{b.text}</p></div>
    case 'related': {
      const a = bySlug[b.slug]
      return a ? <Link to={`/blog/${a.slug}`} className="well related"><span className="faint" style={{ fontSize: 12.5 }}>Related</span><span style={{ fontWeight: 500 }}>{b.label || a.title}</span><ArrowRight size={16} style={{ marginLeft: 'auto', flexShrink: 0 }} /></Link> : null
    }
    case 'cta': return (
      <div className="glass inline-cta">
        <p style={{ margin: 0, color: '#fff', fontSize: 17 }}>{b.text}</p>
        <a href={SIGNUP_URL} className="btn btn-primary">Start for $15 a month <ArrowRight size={15} /></a>
      </div>
    )
    default: return null
  }
}

export function Article({ slug }) {
  const article = ARTICLES.find((a) => a.slug === slug)
  const bySlug = useMemo(() => Object.fromEntries(ARTICLES.map((a) => [a.slug, a])), [])
  const [prog, setProg] = useState(0)
  const [active, setActive] = useState(null)
  usePageMeta(article ? `${article.title} | LIMITLESS` : 'Article not found | LIMITLESS', article ? article.excerpt : undefined)
  useReveal()
  useEffect(() => {
    if (!article) return
    const ids = tocFor(article.content).map((t) => t.id)
    const on = () => {
      const h = document.documentElement
      setProg(Math.min(1, h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)))
      let cur = null
      ids.forEach((id) => { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top < 160) cur = id })
      setActive(cur)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [article])
  if (!article) return <NotFoundBody />
  const toc = tocFor(article.content)
  return (
    <div className="stage">
      <div className="progress" style={{ transform: `scaleX(${prog})`, width: '100%' }} aria-hidden="true" />
      <Backdrop orbs={[{ left: '8%', top: 120, width: 420, height: 420 }]} />
      <article>
        <header className="wrap" style={{ maxWidth: 900, paddingTop: 150, textAlign: 'center' }}>
          <div className="col enter" style={{ alignItems: 'center', gap: 18 }}>
            <Link to="/blog" className="btn btn-ghost btn-sm" style={{ '--i': 0 }}><ArrowLeft size={14} /> All articles</Link>
            <div className="row faint" style={{ '--i': 1, gap: 10, fontSize: 13, flexWrap: 'wrap', justifyContent: 'center' }}><span className="tag tag-soft">{article.category}</span><span>{article.date}</span><span>·</span><span>{readTime(article)}</span></div>
            <h1 className="h-lg" style={{ '--i': 2, fontSize: 'clamp(32px, 5vw, 54px)' }}>{article.title}</h1>
            <p className="lead" style={{ '--i': 3, textAlign: 'center' }}>{article.excerpt}</p>
          </div>
        </header>
        <div className="wrap article-layout">
          <aside className="toc hide-md" aria-label="On this page">
            <span className="faint" style={{ fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>On this page</span>
            {toc.map((t) => <a key={t.id} href={'#' + t.id} className={active === t.id ? 'on' : ''} onClick={(e) => { e.preventDefault(); document.getElementById(t.id).scrollIntoView({ behavior: 'smooth' }) }}>{t.text}</a>)}
          </aside>
          <div className="prose">
            {article.content.map((b, i) => <Block key={i} b={b} bySlug={bySlug} />)}
          </div>
        </div>
      </article>
      <section className="wrap" style={{ paddingBlock: '40px 110px' }}>
        <div className="glass cta" data-reveal style={{ marginBottom: 70 }}>
          <h2 className="h-lg" style={{ fontSize: 'clamp(28px, 4vw, 44px)', maxWidth: 680 }}>Put this into practice tonight.</h2>
          <p className="lead" style={{ textAlign: 'center' }}>LIMITLESS turns every trade into a lesson you can measure.</p>
          <a href={SIGNUP_URL} className="btn btn-primary btn-lg">Start for $15 a month <ArrowRight size={16} /></a>
        </div>
        <h2 className="h-md" style={{ marginBottom: 22 }} data-reveal>Keep reading</h2>
        <div className="blog-grid">{related(article).map((a, i) => <ArticleCard key={a.slug} article={a} i={i} />)}</div>
      </section>
    </div>
  )
}

export function NotFoundBody() {
  usePageMeta('Page not found | LIMITLESS')
  return (
    <div className="stage" style={{ minHeight: '78vh', display: 'flex', alignItems: 'center' }}>
      <Backdrop word="404" top={130} size={320} />
      <div className="wrap col enter" style={{ alignItems: 'center', textAlign: 'center', gap: 18, paddingTop: 160, width: '100%' }}>
        <div className="glass panel" style={{ '--i': 0, alignItems: 'center', maxWidth: 480, padding: 36 }}>
          <h1 className="h-md">This page took a stop loss.</h1>
          <p className="muted">The link may be old, or the page moved.</p>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-primary">Back home</Link>
            <Link to="/blog" className="btn btn-ghost">Read the blog</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
