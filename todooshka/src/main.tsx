import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@monorepo/ui-kit/styles'
import '@monorepo/ui-kit/style'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
