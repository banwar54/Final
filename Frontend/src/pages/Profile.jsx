import React, { useState, useEffect } from "react";
import { Slide } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// Import assets
import logo from "../images/swords.jpg";

// Import styles
import "../styles/Profile.css";

const Profile = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the authentication token
    navigate("/login"); // Redirect to the login page
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    console.log("Profile Mounted");
    const timer = setTimeout(() => setShowCharts(true), 300);
    return () => {
      console.log("Profile Unmounted");
      clearTimeout(timer);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const userDetails = {
    username: "Player123",
    points: "15",
    matchesPlayed: 50,
  };

  // Determine badge based on points
  const getBadge = (points) => {
    const pointsNum = parseInt(points);
    if (pointsNum >= 50) return { type: "Gold", color: "#FFD700" };
    if (pointsNum >= 30) return { type: "Silver", color: "#C0C0C0" };
    if (pointsNum >= 10) return { type: "Bronze", color: "#CD7F32" };
    return { type: "None", color: "transparent" };
  };

  const userBadge = getBadge(userDetails.points);

  const pieData = [
    { name: "Wins", value: 10 },
    { name: "Losses", value: 5 },
    { name: "Ties", value: 3 },
  ];

  // Updated data for solo vs multiplayer games
  const gameTypeData = [
    { name: "Solo", value: 20 },
    { name: "Multiplayer", value: 30 }
  ];

  const COLORS = ["#4caf50", "#f44336", "#ff9800"];
  const GAME_TYPE_COLORS = ["#3498db", "#9b59b6"];

  return (
    <div className="containerStyles">
      {isSidebarOpen && <div className="overlayStyles" onClick={() => setSidebarOpen(false)}></div>}

      <header className="navbarStyles">
        <button onClick={toggleSidebar} className="menuButtonStyles">☰</button>
        <img src={logo} alt="Logo" className="logoStyles" />
        <h1 className="navbarTitleStyles">QUIZENA</h1>
        <nav className="nav">
            <Link to="/login" onClick={handleLogout} className="signup-button">Log Out</Link>
        </nav>
      </header>

      <div className="sidebarStyles" style={{ transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)" }}>
        <div className="sidebarHeaderStyles">
          <img src={logo} alt="Profile" className="profileImgStyles" />
          <h3>{userDetails.username}</h3>
        </div>
        <nav>
          <ul className="nav-list">
            <li><Link to="/" className="nav-link">🏠 Home</Link></li>
            <li><Link to="/arena" className="nav-link">⚔️ Enter Arena</Link></li>
            <li><Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>👤 Profile</Link></li>
            <li><Link to="/friends" className="nav-link">🤝 Friends</Link></li>
            <li><Link to="/leaderboard" className="nav-link">🏆 Leaderboard</Link></li>
            <li><Link to="/rules" className="nav-link">📜 Rules</Link></li>
          </ul>
        </nav>
      </div>

      <div className="mainContentStyles">
        <div className="contentOverlayStyles">
          <div className="userInfoCardStyles">
            <div className="userAvatarContainerStyles">
              <img src={logo} alt="User Avatar" className="userAvatarStyles" />
            </div>
            <div className="userNameBadgeContainer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <h2 className="userNameStyles">{userDetails.username}</h2>
              {userBadge.type !== "None" && (
                <div 
                  className="badgeStyles" 
                  style={{ 
                    backgroundColor: userBadge.color,
                    color: userBadge.type === "Gold" ? "#000" : "#fff",
                    padding: "4px 8px", 
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    border: "2px solid rgba(255,255,255,0.3)"
                  }}
                >
                  {userBadge.type}
                </div>
              )}
            </div>
            <div className="userDetailsContainerStyles">
              <div className="userDetailItemStyles">
                <span className="userDetailLabelStyles">Points:</span>
                <span className="userDetailValueStyles">{userDetails.points}</span>
              </div>
              <div className="userDetailItemStyles">
                <span className="userDetailLabelStyles">Matches:</span>
                <span className="userDetailValueStyles">{userDetails.matchesPlayed}</span>
              </div>
            </div>
          </div>

          <Slide direction="up" in={showCharts} timeout={1000}>
            <div className="statsSectionStyles">
              <h2 className="sectionTitleStyles">Game Statistics</h2>
              
              <div className="chartsContainerStyles">
                <div className="chartCardStyles">
                  <h3 className="chartTitleStyles">Match Results</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} games`, null]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="chartCardStyles">
                  <h3 className="chartTitleStyles">Game Types</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={gameTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value} games`}
                      >
                        {gameTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={GAME_TYPE_COLORS[index % GAME_TYPE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} games`, null]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Slide>
        </div>
      </div>
    </div>
  );
};

export default Profile;