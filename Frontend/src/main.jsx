import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home.jsx'
import { BrowserRouter } from "react-router-dom";
import Profile from './pages/Profile.jsx';
import Rules from './pages/Rules.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Leaderboard/>
  </BrowserRouter>
)
