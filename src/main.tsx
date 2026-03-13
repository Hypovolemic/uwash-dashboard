import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize Telegram Mini App (but don't block rendering if it fails)
try {
  const tg = (window as any).Telegram?.WebApp
  if (tg) {
    tg.ready()
    tg.expand()
    
    // Optional: Match Telegram theme colors
    if (tg.themeParams?.bg_color) {
      document.body.style.backgroundColor = tg.themeParams.bg_color
    }
  }
} catch (error) {
  console.log('Telegram WebApp not available:', error)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
