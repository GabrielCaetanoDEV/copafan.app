import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CopaProvider } from './context/CopaContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CopaProvider>
      <App />
    </CopaProvider>
  </StrictMode>,
)
