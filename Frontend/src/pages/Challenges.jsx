import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../images/swords.jpg";
import "../styles/Challenge.css";

const Challenges = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    question: "",
    options: ["", "", "", ""],
    correctOption: 0
  });
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
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
        const formattedChallenges = data.ChallengebyPlayer.map(challenge => {
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
        
        setChallenges(formattedChallenges);
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

  const toggleCreateForm = () => {
    const newState = !showCreateForm;
    setShowCreateForm(newState);
    
    // If opening the form, scroll down to make it visible
    if (newState) {
      setTimeout(() => {
        // This will scroll to the form when it appears
        const formElement = document.querySelector('.challenge-form-container');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small timeout to ensure the form is rendered
    }
  };

  const handleQuestionChange = (e) => {
    setNewChallenge({
      ...newChallenge,
      question: e.target.value
    });
  };

  const handleOptionChange = (index, e) => {
    const updatedOptions = [...newChallenge.options];
    updatedOptions[index] = e.target.value;
    setNewChallenge({
      ...newChallenge,
      options: updatedOptions
    });
  };

  const handleCorrectOptionChange = (e) => {
    setNewChallenge({
      ...newChallenge,
      correctOption: parseInt(e.target.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the correct answer value from the selected option
      const correctAnswerIndex = newChallenge.correctOption;
      const correctAnswerValue = newChallenge.options[correctAnswerIndex];
      
      // Prepare the data according to your backend API requirements
      const challengeData = {
        que: newChallenge.question,
        qo1: newChallenge.options[0],
        qo2: newChallenge.options[1],
        qo3: newChallenge.options[2],
        qo4: newChallenge.options[3],
        qans: correctAnswerValue // API expects the actual value, not the index
      };
      
      // Make the API call to save the challenge
      const response = await fetch('http://localhost:5000/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(challengeData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create challenge');
      }
      
      const data = await response.json();
      
      // Add the new challenge to the list
      const newChallengeItem = {
        id: String(challenges.length + 1), // This will be replaced when we refresh
        question: newChallenge.question,
        options: [...newChallenge.options],
        correctOption: newChallenge.correctOption,
        createdAt: new Date().toISOString(),
        timesUsed: 0,
        correctAnswers: 0
      };
      
      // Add the new challenge to the list
      setChallenges([newChallengeItem, ...challenges]);
      
      // Reset form
      setNewChallenge({
        question: "",
        options: ["", "", "", ""],
        correctOption: 0
      });
      setShowCreateForm(false);
      
      // Show success message
      alert("Challenge created successfully!");
      
      // Optional: Refresh challenges from server to get the new ID
      // fetchChallenges();
      
    } catch (error) {
      setError(error.message || "Failed to create challenge");
      console.error("Error creating challenge:", error);
    } finally {
      setIsLoading(false);
    }
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
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <div className="content">
          <div className="challenge-container">
            <h1 className="challenge-title">⚡ Challenge Arena ⚡</h1>
            
            <div className="challenge-toggle">
              <button 
                className="create-challenge-btn"
                onClick={toggleCreateForm}
              >
                {showCreateForm ? "Cancel" : "Create New Challenge"}
              </button>
            </div>

            {showCreateForm && (
              <div className="challenge-form-container">
                <h2>Create New Challenge</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="question">Question:</label>
                    <textarea 
                      id="question" 
                      value={newChallenge.question}
                      onChange={handleQuestionChange}
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>
                  
                  <div className="options-container">
                    <h3>Options:</h3>
                    {newChallenge.options.map((option, index) => (
                      <div key={index} className="form-group option-group">
                        <label htmlFor={`option${index}`}>Option {index + 1}:</label>
                        <input 
                          type="text" 
                          id={`option${index}`} 
                          value={option}
                          onChange={(e) => handleOptionChange(index, e)}
                          placeholder={`Enter option ${index + 1}`}
                          required
                        />
                        <label className="radio-label">
                          <input 
                            type="radio" 
                            name="correctOption" 
                            value={index}
                            checked={newChallenge.correctOption === index}
                            onChange={handleCorrectOptionChange}
                            required
                          />
                          Correct Answer
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Create Challenge"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="challenge-history">
              <h2>Challenge History</h2>
              
              {isLoading && !showCreateForm ? (
                <div className="loading">Loading challenge history...</div>
              ) : error && !showCreateForm ? (
                <div className="error">{error}</div>
              ) : challenges.length > 0 ? (
                <div className="table-container">
                  <div className="challenges-grid">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="challenge-card">
                        <div className="challenge-header">
                          <span className="challenge-date">{new Date(challenge.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="challenge-question">{challenge.question}</p>
                        <div className="challenge-options">
                          {challenge.options.map((option, index) => (
                            <div 
                              key={index} 
                              className={`challenge-option ${index === challenge.correctOption ? 'correct-option' : ''}`}
                            >
                              {index === challenge.correctOption && <span className="correct-marker">✓</span>}
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-data">No challenges found. Create your first challenge now!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenges;