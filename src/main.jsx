import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// TEMP DEBUG: eruda mobile console for on-device inspection
import eruda from 'eruda'
import './index.css'
import App from './App.jsx'

// TEMP DEBUG: eruda mobile console for on-device inspection
eruda.init()

// TEMP DEBUG: kill switch — unregister all service workers and clear all caches
navigator.serviceWorker?.getRegistrations().then(rs => rs.forEach(r => r.unregister()))
caches?.keys().then(keys => keys.forEach(k => caches.delete(k)))

// TEMP DEBUG: SW registration disabled while diagnosing the icon issue
// registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
