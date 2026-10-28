import { RouterProvider, useRouter, useGlassLight } from './lib/site.jsx'
import { SiteNav, Footer } from './components/Nav.jsx'
import CursorTrail from './components/CursorTrail.jsx'
import Home from './pages/Home.jsx'
import { BlogIndex, Article, NotFoundBody } from './pages/Blog.jsx'
import { Legal, PricingPage } from './pages/Legal.jsx'

function Page() {
  const { route } = useRouter()
  switch (route.page) {
    case 'home': return <Home />
    case 'pricing': return <PricingPage />
    case 'blog': return <BlogIndex />
    case 'article': return <Article key={route.slug} slug={route.slug} />
    case 'legal': return <Legal doc={route.doc} />
    default: return <NotFoundBody />
  }
}

function Shell() {
  const { route } = useRouter()
  useGlassLight()
  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      <SiteNav />
      <main id="main" key={route.page + (route.slug || route.doc || '')} className="page-in">
        <Page />
      </main>
      <Footer />
      <CursorTrail />
    </>
  )
}

export default function App() {
  return <RouterProvider><Shell /></RouterProvider>
}
