import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../images/swords.jpg";
import "../styles/Leaderboard.css";
import Cookies from "js-cookie";

const Leaderboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [soloLeaderboardData, setSoloLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLeaderboard, setActiveLeaderboard] = useState("multiplayer"); // Default to multiplayer
  const location = useLocation();

    const handleLogout = () => {
      Cookies.remove("token"); // Remove the authentication cookie
      navigate("/login"); // Redirect to the login page
    };
    

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch multiplayer leaderboard
        const multiplayerResponse = await fetch("http://localhost:5000/data/leaderboard");
        const multiplayerData = await multiplayerResponse.json();

        // Fetch solo leaderboard (assuming endpoint exists, adjust as needed)
        const soloResponse = await fetch("http://localhost:5000/data/solo-leaderboard");
        const soloData = await soloResponse.json();

        if (multiplayerData && multiplayerData.message && multiplayerData.message.leaderboard) {
          const sortedMultiplayerData = [...multiplayerData.message.leaderboard].sort(
            (a, b) => parseInt(b.points) - parseInt(a.points)
          );
          setLeaderboardData(sortedMultiplayerData);
        }

        if (soloData && soloData.message && soloData.message.leaderboard) {
          const sortedSoloData = [...soloData.message.leaderboard].sort(
            (a, b) => parseInt(b.points) - parseInt(a.points)
          );
          setSoloLeaderboardData(sortedSoloData);
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

  // Mock solo leaderboard data in case the endpoint doesn't exist
  // You can remove this once you have the real endpoint
  useEffect(() => {
    if (soloLeaderboardData.length === 0 && !isLoading) {
      const mockSoloData = leaderboardData.map(player => ({
        ...player,
        gamesPlayed: player.win + player.loss + player.draw
      }));
      setSoloLeaderboardData(mockSoloData);
    }
  }, [leaderboardData, isLoading, soloLeaderboardData.length]);

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
          <h3>John Doe</h3>
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
                    {leaderboardData.map((player, index) => (
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
                    ))}
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
                    {soloLeaderboardData.map((player, index) => (
                      <tr key={player.userid} style={{
                        background: index === 0 ? 'rgba(255, 215, 0, 0.2)' : 
                                    index === 1 ? 'rgba(192, 192, 192, 0.2)' : 
                                    index === 2 ? 'rgba(205, 127, 50, 0.2)' : 'rgba(44, 62, 80, 0.2)'
                      }}>
                        <td>{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}</td>
                        <td>{player.username}</td>
                        <td>{player.gamesPlayed || (player.win + player.loss + player.draw)}</td>
                        <td>{player.points}</td>
                      </tr>
                    ))}
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