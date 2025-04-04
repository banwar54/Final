import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../images/swords.jpg";
import "../styles/Leaderboard.css";

const Leaderboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [soloLeaderboardData, setSoloLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLeaderboard, setActiveLeaderboard] = useState("multiplayer"); // Default to multiplayer
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the authentication token
  };

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch leaderboard data from API
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/leaderboard",{
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data && data.message === "Leaderboard fetched successfully!") {
          // Process multiplayer leaderboard data
          if (data.leaderboard2 && data.leaderboard2.length > 0) {
            const sortedMultiplayerData = [...data.leaderboard2].sort(
              (a, b) => parseInt(b.points) - parseInt(a.points)
            );
            setLeaderboardData(sortedMultiplayerData);
          }

          // Process solo leaderboard data
          if (data.leaderboard1 && data.leaderboard1.length > 0) {
            const sortedSoloData = [...data.leaderboard1].sort(
              (a, b) => parseInt(b.points) - parseInt(a.points)
            );
            setSoloLeaderboardData(sortedSoloData);
          } else {
            // If solo leaderboard is empty, we'll show a message instead of using mock data
            setSoloLeaderboardData([]);
          }
        }
      } catch (err) {
        setError("Failed to fetch leaderboard data");
        console.error("Error fetching leaderboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const switchToMultiplayer = () => {
    setActiveLeaderboard("multiplayer");
  };

  const switchToSolo = () => {
    setActiveLeaderboard("solo");
  };

  return (
    <div className="container">
      {isSidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      <header className="navbar">
        <button onClick={toggleSidebar} className="menu-button">☰</button>
        <img src={Logo} alt="Logo" className="logo" />
        <h1 className="navbar-title">QUIZENA</h1>
        <nav className="nav">
            <Link to="/login" onClick={handleLogout} className="signup-button">Log Out</Link>
        </nav>
      </header>

      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <img src={Logo} alt="Profile" className="profile-img" />
          <h3>{localStorage.getItem("username")}</h3>
        </div>
        <nav>
          <ul className="nav-list">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                <span className="icon">🏠</span> Home
              </Link>
            </li>
            <li>
              <Link to="/arena" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
                <span className="icon">⚔️</span> Enter Arena
              </Link>
            </li>
            <li>
              <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`}>
                <span className="icon">👤</span> Profile
              </Link>
            </li>
            <li>
              <Link to="/friends" className={`nav-link ${location.pathname === "/friends" ? "active" : ""}`}>
                <span className="icon">🤝</span> Friends
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className={`nav-link ${location.pathname === "/leaderboard" ? "active" : ""}`}>
                <span className="icon">🏆</span> Leaderboard
              </Link>
            </li>
            <li>
              <Link to="/rules" className={`nav-link ${location.pathname === "/rules" ? "active" : ""}`}>
                <span className="icon">📜</span> Rules
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="content">
          <div className="leaderboard-container">
            <h1 className="leaderboard-title">🏆 Global Leaderboard 🏆</h1>
            
            <div className="leaderboard-toggle">
              <button 
                className={`toggle-button ${activeLeaderboard === "multiplayer" ? "active" : ""}`}
                onClick={switchToMultiplayer}
              >
                Multiplayer Leaderboard
              </button>
              <button 
                className={`toggle-button ${activeLeaderboard === "solo" ? "active" : ""}`}
                onClick={switchToSolo}
              >
                Solo Player Leaderboard
              </button>
            </div>

            {isLoading ? (
              <div className="loading">Loading leaderboard data...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : activeLeaderboard === "multiplayer" ? (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Username</th>
                      <th>Points</th>
                      <th>W</th>
                      <th>L</th>
                      <th>D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.length > 0 ? (
                      leaderboardData.map((player, index) => (
                        <tr key={player.userid} style={{
                          background: index === 0 ? 'rgba(255, 215, 0, 0.2)' : 
                                      index === 1 ? 'rgba(192, 192, 192, 0.2)' : 
                                      index === 2 ? 'rgba(205, 127, 50, 0.2)' : 'rgba(44, 62, 80, 0.2)'
                        }}>
                          <td>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}</td>
                          <td>{player.username}</td>
                          <td>{player.points}</td>
                          <td>{player.win}</td>
                          <td>{player.loss}</td>
                          <td>{player.draw}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">No multiplayer leaderboard data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Username</th>
                      <th>Games Played</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {soloLeaderboardData.length > 0 ? (
                      soloLeaderboardData.map((player, index) => (
                        <tr key={player.userid} style={{
                          background: index === 0 ? 'rgba(255, 215, 0, 0.2)' : 
                                      index === 1 ? 'rgba(192, 192, 192, 0.2)' : 
                                      index === 2 ? 'rgba(205, 127, 50, 0.2)' : 'rgba(44, 62, 80, 0.2)'
                        }}>
                          <td>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}</td>
                          <td>{player.username}</td>
                          <td>{player.total}</td>
                          <td>{player.points}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="no-data">No solo leaderboard data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;