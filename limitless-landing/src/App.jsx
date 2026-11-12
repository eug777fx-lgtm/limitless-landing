import { RouterProvider, useRouter, useGlassLight } from './lib/site.jsx'
import { SiteNav, Footer } from './components/Nav.jsx'
import { SiteScene, useSiteTheme } from './lib/theme.jsx'
import Home from './pages/Home.jsx'
import { BlogIndex, Article, NotFoundBody } from './pages/Blog.jsx'
import { Legal, PricingPage } from './pages/Legal.jsx'
import Checkout from './pages/Checkout.jsx'
import { useEffect } from 'react'
import { liveSet } from './lib/live.js'

function Page() {
  const { route } = useRouter()
  switch (route.page) {
    case 'home': return <Home />
    case 'pricing': return <PricingPage />
    case 'checkout': return <Checkout />
    case 'blog': return <BlogIndex />
    case 'article': return <Article key={route.slug} slug={route.slug} />
    case 'legal': return <Legal doc={route.doc} />
    default: return <NotFoundBody />
  }
}

function Shell() {
  const { route } = useRouter()
  useGlassLight()
  useSiteTheme()
  // Admin Live view: which page this visitor is on (starts once the page has settled)
  const livePage = route.page === 'article' ? 'blog:' + route.slug : route.page === 'legal' ? route.doc : route.page
  useEffect(() => {
    const t = setTimeout(() => liveSet(livePage), 1200)
    return () => clearTimeout(t)
  }, [livePage])
  return (
    <>
      <SiteScene />
      <a href="#main" className="skip">Skip to content</a>
      <SiteNav />
      <main id="main" key={route.page + (route.slug || route.doc || '')} className="page-in">
        <Page />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return <RouterProvider><Shell /></RouterProvider>
}
