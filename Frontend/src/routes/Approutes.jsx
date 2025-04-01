import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import Profile from '../pages/Profile.jsx';
import Rules from '../pages/Rules.jsx';
import Leaderboard from '../pages/Leaderboard.jsx';
import Friends from '../pages/Friends.jsx';
import Arena from '../pages/Arena.jsx';
import Login from '../pages/Login.jsx';
import Registration from '../pages/Registration.jsx';
import Queue from '../pages/Queue.jsx';
import Quiz from '../pages/Quiz.jsx';
import Challenges from '../pages/Challenges.jsx';
import ChallengeDisplay from '../pages/ChallengeDisplay.jsx';

// Authentication check function
const getCookie = (name) => {
  return localStorage.getItem("token");
};

const isAuthenticated = () => {
  return getCookie() !== null;
};

const PublicRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function Approutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication Routes */}
        <Route path="/login" element={<PublicRoute><Login /> </PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Registration /> </PublicRoute>} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
        <Route path="/arena" element={<ProtectedRoute><Arena /></ProtectedRoute>} />
        <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
        <Route path="/challenge" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
        <Route path="/showchallenge" element={<ProtectedRoute><ChallengeDisplay /></ProtectedRoute>} />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Approutes;
