import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { pingBackend } from './services/api'

// ─── Backend Wake-up ──────────────────────────────────────────────────────────
// Frontend load hote hi Render backend ko ping karo
// Fire and forget — rendering block nahi hogi
// Jab tak user login form bharta hai, backend warm ho jaata hai
pingBackend();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
) 