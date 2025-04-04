import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Logo from "../images/swords.jpg";
import "../styles/Friends.css";

const Friends = ({ userId }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    const [friends, setFriends] = useState([]);
    const [searchFriends, setSearchFriends] = useState("");
    const [pendingRequests, setPendingRequests] = useState([]);
    const [possibleFriends, setPossibleFriends] = useState([]);
    const [searchUsers, setSearchUsers] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [view, setView] = useState("friends");
    
    // Add a state to track when a friend is removed
    const [friendRemoved, setFriendRemoved] = useState(false);
    
    const location = useLocation();

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = () => {
      localStorage.removeItem("token");
    };
    
    // Add useEffect to refresh possibleFriends when a friend is removed
    useEffect(() => {
        if (friendRemoved) {
            fetchUsers();
            setFriendRemoved(false);
        }
    }, [friendRemoved]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            await Promise.all([
                fetchFriends(),
                fetchPendingRequests(),
                fetchUsers()
            ]);
        } catch (err) {
            setError("Failed to fetch data: " + err.message);
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };
    
    const switchToFriends = () => {
      setView("friends");
      setSearchFriends("");
    };

    const switchToPending = () => {
      setView("pending");
    };

    const switchToAdd = () => {
      setView("add_friend");
      setSearchUsers("");
      // Refresh the users list when switching to Add Friend view
      fetchUsers();
    };

    const fetchFriends = async () => {
        try {
            const response = await axios.get("http://localhost:5000/friend/get_friends", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setFriends(response.data);
        } catch (error) {
            console.error("Error fetching friends:", error);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get("http://localhost:5000/friend/show_req", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setPendingRequests(response.data);
        } catch (error) {
            console.error("Error fetching pending requests:", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5000/friend/get_users", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            setPossibleFriends(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const removeFriend = async (friendId) => {
        try {
            await axios.post("http://localhost:5000/friend/remove_friend", { userId: friendId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            await fetchFriends();
            // Set friendRemoved to true to trigger useEffect to update possibleFriends
            setFriendRemoved(true);
            
            // Show removed friend in Add Friend section right away
            if (view === "friends") {
                await fetchUsers();
            }
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await axios.post("http://localhost:5000/friend/accept_req", { userId: requestId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            await fetchPendingRequests();
            await fetchFriends();
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await axios.post("http://localhost:5000/friend/reject_req", { userId: requestId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            await fetchPendingRequests();
            await fetchUsers(); // Also refresh the users list when rejecting a request
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const sendFriendRequest = async (userIdToAdd) => {
        try {
            await axios.post("http://localhost:5000/friend/send_req", { userId: userIdToAdd }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            await fetchUsers();
        } catch (error) {
            console.error("Error sending friend request:", error);
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
                                onClick={switchToFriends} 
                                className={`toggle-button ${view === "friends" ? "active" : ""}`}
                            >
                                My Friends {friends.length > 0 && `(${friends.length})`}
                            </button>
                            <button 
                                onClick={switchToPending} 
                                className={`toggle-button ${view === "pending" ? "active" : ""}`}
                            >
                                Pending Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
                            </button>
                            <button 
                                onClick={switchToAdd} 
                                className={`toggle-button ${view === "add_friend" ? "active" : ""}`}
                            >
                                Add Friend
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="loading">Loading friends data...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : view === "friends" ? (
                            <div className="friends-content">
                                <div className="search-bar">
                                    <input 
                                        type="text" 
                                        placeholder="Search friends" 
                                        value={searchFriends} 
                                        onChange={(e) => setSearchFriends(e.target.value)}
                                        className="search-input" 
                                    />
                                </div>
                                
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Friend</th>
                                                <th>Points</th>
                                                <th></th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {friends.filter(friend => 
                                                friend.username.toLowerCase().includes(searchFriends.toLowerCase())
                                            ).length > 0 ? (
                                                friends.filter(friend => 
                                                    friend.username.toLowerCase().includes(searchFriends.toLowerCase())
                                                ).map(friend => (
                                                    <tr key={friend.id}>
                                                        <td className="username-cell">
                                                            <div className="friend-info">
                                                                <span className="status-dot" style={{ backgroundColor: "#2ecc71" }}></span>
                                                                {friend.username}
                                                            </div>
                                                        </td>
                                                        <td>{friend.points}</td>
                                                        <td></td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    className="action-button remove"
                                                                    onClick={() => removeFriend(friend.id)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="no-results">No friends found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : view === "pending" ? (
                            <div className="friends-content">
                                <h2 className="section-header">Friend Requests</h2>
                                
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingRequests.length > 0 ? (
                                                pendingRequests.map(req => (
                                                    <tr key={req.id}>
                                                        <td className="username-cell">{req.username}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    className="action-button accept"
                                                                    onClick={() => acceptRequest(req.id)}
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button 
                                                                    className="action-button reject"
                                                                    onClick={() => rejectRequest(req.id)}
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="2" className="no-requests">No pending requests</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="friends-content">
                                <h2 className="section-header">Find New Friends</h2>
                                
                                <div className="search-container">
                                    <input 
                                        type="text" 
                                        placeholder="Search users" 
                                        value={searchUsers} 
                                        onChange={(e) => setSearchUsers(e.target.value)}
                                        className="add-friend-input" 
                                    />
                                    <button onClick={fetchUsers} className="send-request-button">
                                        Search
                                    </button>
                                </div>
                                
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Username</th>
                                                <th>Points</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {possibleFriends.filter(user => 
                                                user.username.toLowerCase().includes(searchUsers.toLowerCase())
                                            ).length > 0 ? (
                                                possibleFriends.filter(user => 
                                                    user.username.toLowerCase().includes(searchUsers.toLowerCase())
                                                ).map(user => (
                                                    <tr key={user.id}>
                                                        <td className="username-cell">{user.username}</td>
                                                        <td>{user.points}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    className="action-button invite"
                                                                    onClick={() => sendFriendRequest(user.id)}
                                                                >
                                                                    Add Friend
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="no-results">No users found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="add-friend-info">
                                    <p>Find and connect with other players to challenge them to quiz battles!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Friends;