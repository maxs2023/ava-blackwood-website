import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// --- MODIFICATION: Import HelmetProvider ---
import { HelmetProvider } from 'react-helmet-async';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* --- MODIFICATION: Wrap App with HelmetProvider --- */}
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)