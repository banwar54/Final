import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Approutes from './routes/Approutes'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Approutes/>
  </StrictMode>
  // <BrowserRouter>
  //     <Admin/>
  // </BrowserRouter>
)
