import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/config/i18n' // Initialize i18next
import 'leaflet/dist/leaflet.css' // Leaflet CSS
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
