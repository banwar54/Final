import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../images/swords.jpg";
import "../styles/ChallengeDisplay.css";

const ChallengeDisplay = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answeredChallenges, setAnsweredChallenges] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Fetch challenges from API
  useEffect(() => {
    const fetchChallenges = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:5000/challenge/show', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }

        const data = await response.json();
        console.log(data);
        
        // Transform API data to match our component's expected format
        const formattedChallenges = data.Challenge.map(challenge => {
          // Create options array from qo1, qo2, qo3, qo4
          const options = [challenge.qo1, challenge.qo2, challenge.qo3, challenge.qo4];
          
          // Determine correct option index (0-based)
          // The API stores the correct answer as the value, not the index
          let correctOption = 0;
          if (challenge.qans === challenge.qo2) correctOption = 1;
          else if (challenge.qans === challenge.qo3) correctOption = 2;
          else if (challenge.qans === challenge.qo4) correctOption = 3;
          
          return {
            id: challenge.id,
            question: challenge.que,
            options: options,
            correctOption: correctOption,
            createdAt: challenge.created_at,
            // Since actual usage stats aren't in the API data, default to 0
            timesUsed: 0,
            correctAnswers: 0
          };
        });
        
        const sortedChallenges = [...formattedChallenges].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        
        setChallenges(sortedChallenges);

      } catch (error) {
        console.error("Error fetching challenges:", error);
        setError(error.message || "Failed to fetch challenges");
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleOptionClick = (challengeId, optionIndex) => {
    setAnsweredChallenges(prev => ({
      ...prev,
      [challengeId]: optionIndex
    }));
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
          <h3>{localStorage.getItem("username") || "User"}</h3>
        </div>
        <nav>
          <ul className="nav-list">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
                <span className="icon">🏠</span> Home
              </Link>
            </li>
            <li>
              <Link to="/arena" className={`nav-link ${location.pathname === "/arena" ? "active" : ""}`}>
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
              <Link to="/challenge" className={`nav-link ${location.pathname === "/challenge" ? "active" : ""}`}>
                <span className="icon">⚡</span> Challenges
              </Link>
            </li>
            <li>
              <Link to="/showchallenge" className={`nav-link ${location.pathname === "/showchallenge" ? "active" : ""}`}>
                <span className="icon">🎮</span> Play Challenges
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
          <div className="challenge-container">
            <h1 className="challenge-title">⚡ Play Challenges ⚡</h1>
            
            <div className="challenge-info">
              <p>Test your knowledge by answering these challenges! Click on an option to see if you're right.</p>
            </div>

            <div className="challenge-play-area">
              <h2>Available Challenges</h2>
              
              {isLoading ? (
                <div className="loading">Loading challenges...</div>
              ) : error ? (
                <div className="error">{error}</div>
              ) : challenges.length > 0 ? (
                <div className="challenge-play-grid">
                  {challenges.map((challenge) => (
                    <div key={challenge.id} className="challenge-play-card">
                      <div className="challenge-play-header">
                        <h3>Challenge #{challenge.id}</h3>
                        <span className="challenge-date">{new Date(challenge.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="challenge-question">{challenge.question}</p>
                      <div className="challenge-options">
                        {challenge.options.map((option, index) => (
                          <div 
                            key={index} 
                            className={`challenge-option-button 
                              ${answeredChallenges[challenge.id] === index ? 'selected-option' : ''} 
                              ${answeredChallenges[challenge.id] !== undefined && index === challenge.correctOption ? 'correct-option' : ''} 
                              ${answeredChallenges[challenge.id] === index && index !== challenge.correctOption ? 'incorrect-option' : ''}`}
                            onClick={() => handleOptionClick(challenge.id, index)}
                          >
                            {option}
                            {answeredChallenges[challenge.id] !== undefined && index === challenge.correctOption && (
                              <span className="correct-marker">✓</span>
                            )}
                            {answeredChallenges[challenge.id] === index && index !== challenge.correctOption && (
                              <span className="incorrect-marker">✗</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {answeredChallenges[challenge.id] !== undefined && (
                        <div className="answer-feedback">
                          {answeredChallenges[challenge.id] === challenge.correctOption ? (
                            <div className="correct-feedback">Correct! Well done!</div>
                          ) : (
                            <div className="incorrect-feedback">
                              Incorrect. The correct answer is: {challenge.options[challenge.correctOption]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No challenges found. Come back later when more challenges are available!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDisplay;