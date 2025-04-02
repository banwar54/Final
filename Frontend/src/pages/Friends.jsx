import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../images/swords.jpg";
import "../styles/Friends.css"; // You'll need to create this CSS file

const Friends = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("friends"); // Default to friends list
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchFriendsData = async () => {
      try {
        setIsLoading(true);
        // Fetch friends list
        const friendsResponse = await fetch("http://localhost:5000/data/friends");
        const friendsData = await friendsResponse.json();

        // Fetch pending friend requests
        const pendingResponse = await fetch("http://localhost:5000/data/friend-requests");
        const pendingData = await pendingResponse.json();

        if (friendsData && friendsData.message && friendsData.message.friends) {
          setFriends(friendsData.message.friends);
        }

        if (pendingData && pendingData.message && pendingData.message.requests) {
          setPendingRequests(pendingData.message.requests);
        }
      } catch (err) {
        setError("Failed to fetch friends data");
        console.error("Error fetching friends:", err);
        
        // Mock data in case the endpoints don't exist
        setFriends([
          { userid: "1", username: "GameMaster", status: "online", lastActive: "Just now", points: 2450 },
          { userid: "2", username: "QuizWizard", status: "offline", lastActive: "2 hours ago", points: 1980 },
          { userid: "3", username: "BrainStorm", status: "online", lastActive: "Just now", points: 3100 },
          { userid: "4", username: "TriviaKing", status: "away", lastActive: "15 minutes ago", points: 2200 },
          { userid: "5", username: "KnowledgeSeeker", status: "offline", lastActive: "1 day ago", points: 1650 }
        ]);
        
        setPendingRequests([
          { userid: "6", username: "QuizChampion", sentAt: "2023-04-15" },
          { userid: "7", username: "MindGamer", sentAt: "2023-04-14" }
        ]);
        
        // Mock data for suggested users
        setSuggestedUsers([
          { userid: "8", username: "PuzzleMaster", points: 3200, status: "online" },
          { userid: "9", username: "QuizGenius", points: 2800, status: "offline" },
          { userid: "10", username: "BrainiacsClub", points: 3500, status: "online" },
          { userid: "11", username: "TriviaGuru", points: 2100, status: "away" },
          { userid: "12", username: "MindChallenger", points: 2700, status: "online" },
          { userid: "13", username: "KnowledgeHunter", points: 1900, status: "offline" },
          { userid: "14", username: "FactsExpert", points: 2450, status: "online" },
          { userid: "15", username: "WisdomSeeker", points: 1750, status: "offline" }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriendsData();
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const switchToFriends = () => {
    setActiveTab("friends");
  };

  const switchToPending = () => {
    setActiveTab("pending");
  };

  const switchToAdd = () => {
    setActiveTab("add");
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const acceptFriendRequest = (userId) => {
    // Implementation for accepting friend request
    console.log(`Accepted friend request from user ${userId}`);
    setPendingRequests(pendingRequests.filter(request => request.userid !== userId));
  };

  const rejectFriendRequest = (userId) => {
    // Implementation for rejecting friend request
    console.log(`Rejected friend request from user ${userId}`);
    setPendingRequests(pendingRequests.filter(request => request.userid !== userId));
  };

  const sendFriendRequest = (username = searchQuery) => {
    // Implementation for sending friend request
    console.log(`Sent friend request to ${username}`);
    alert(`Friend request sent to ${username}`);
    if (username === searchQuery) {
      setSearchQuery("");
    }
  };

  const removeFriend = (userId) => {
    // Implementation for removing friend
    console.log(`Removed friend with ID ${userId}`);
    setFriends(friends.filter(friend => friend.userid !== userId));
  };

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestedUsers = suggestedUsers.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "online": return "#2ecc71"; // Green
      case "away": return "#f39c12"; // Orange
      case "offline": return "#e74c3c"; // Red
      default: return "#95a5a6"; // Gray
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
            <Link to="/registration" className="signup-button">Log Out</Link>
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
              <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
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
          <div className="friends-container">
            <h1 className="friends-title">🤝 Friends & Connections 🤝</h1>
            
            <div className="friends-toggle">
              <button 
                className={`toggle-button ${activeTab === "friends" ? "active" : ""}`}
                onClick={switchToFriends}
              >
                My Friends ({friends.length})
              </button>
              <button 
                className={`toggle-button ${activeTab === "pending" ? "active" : ""}`}
                onClick={switchToPending}
              >
                Pending Requests ({pendingRequests.length})
              </button>
              <button 
                className={`toggle-button ${activeTab === "add" ? "active" : ""}`}
                onClick={switchToAdd}
              >
                Add Friend
              </button>
            </div>

            {isLoading ? (
              <div className="loading">Loading friends data...</div>
            ) : error && !friends.length && !pendingRequests.length ? (
              <div className="error">{error}</div>
            ) : activeTab === "friends" ? (
              <div className="friends-content">
                <div className="search-bar">
                  <input 
                    type="text" 
                    placeholder="Search friends..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                  />
                </div>
                
                <div className="table-container">
                  {filteredFriends.length > 0 ? (
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Status</th>
                          <th>Last Active</th>
                          <th>Points</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFriends.map((friend) => (
                          <tr key={friend.userid}>
                            <td className="username-cell">
                              <div className="friend-info">
                                <span className="status-dot" style={{ backgroundColor: getStatusColor(friend.status) }}></span>
                                {friend.username}
                              </div>
                            </td>
                            <td>{friend.status.charAt(0).toUpperCase() + friend.status.slice(1)}</td>
                            <td>{friend.lastActive}</td>
                            <td>{friend.points}</td>
                            <td>
                              <div className="action-buttons">
                                <button className="action-button invite">Challenge</button>
                                <button className="action-button message">Message</button>
                                <button 
                                  className="action-button remove"
                                  onClick={() => removeFriend(friend.userid)}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-results">No friends found matching "{searchQuery}"</div>
                  )}
                </div>
              </div>
            ) : activeTab === "pending" ? (
              <div className="pending-requests">
                {pendingRequests.length > 0 ? (
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Sent</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRequests.map((request) => (
                          <tr key={request.userid}>
                            <td>{request.username}</td>
                            <td>{request.sentAt}</td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="action-button accept"
                                  onClick={() => acceptFriendRequest(request.userid)}
                                >
                                  Accept
                                </button>
                                <button 
                                  className="action-button reject"
                                  onClick={() => rejectFriendRequest(request.userid)}
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-requests">No pending friend requests</div>
                )}
              </div>
            ) : (
              <div className="add-friend">
                <div className="search-container">
                  <input 
                    type="text" 
                    placeholder="Search users to add as friend..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    className="add-friend-input"
                  />
                  <button 
                    className="send-request-button"
                    onClick={() => sendFriendRequest()}
                    disabled={!searchQuery.trim()}
                  >
                    Search
                  </button>
                </div>
                
                <div className="suggested-users">
                  <h3 className="suggested-title">
                    {searchQuery ? `Search Results for "${searchQuery}"` : "Suggested Users"}
                  </h3>
                  
                  <div className="table-container">
                    {filteredSuggestedUsers.length > 0 ? (
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Username</th>
                            <th>Status</th>
                            <th>Points</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSuggestedUsers.map((user) => (
                            <tr key={user.userid}>
                              <td className="username-cell">
                                <div className="friend-info">
                                  <span className="status-dot" style={{ backgroundColor: getStatusColor(user.status) }}></span>
                                  {user.username}
                                </div>
                              </td>
                              <td>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</td>
                              <td>{user.points}</td>
                              <td>
                                <button 
                                  className="action-button add"
                                  onClick={() => sendFriendRequest(user.username)}
                                >
                                  Add Friend
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : searchQuery ? (
                      <div className="no-results">No users found matching "{searchQuery}"</div>
                    ) : (
                      <div className="no-results">No suggested users available</div>
                    )}
                  </div>
                </div>
                
                <p className="add-friend-info">
                  Search for users by username or browse the suggested users list. Send a friend request to connect with other players.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;