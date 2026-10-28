import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

document.documentElement.classList.add('js')
createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)

// Deep links like /#pricing land on the section once the page has rendered
if (window.location.hash) {
  setTimeout(() => {
    const el = document.getElementById(window.location.hash.slice(1))
    if (el) el.scrollIntoView({ block: 'start' })
  }, 300)
}
