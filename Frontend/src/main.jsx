import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Home from './pages/Home.jsx'
import { BrowserRouter } from "react-router-dom";
import Profile from './pages/Profile.jsx';
import Rules from './pages/Rules.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Friends from './pages/Friends.jsx';
import Arena from './pages/Arena.jsx';
import Login from './pages/Login.jsx';
import Registration from './pages/Registration.jsx';
import Queue from './pages/Queue.jsx';
import Quiz from './pages/Quiz.jsx';
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Quiz/>
  </BrowserRouter>
)
