import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import Logo from "../images/swords.jpg";
import "../styles/Friends.css";

const FriendManagement = ({ userId }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    const [friends, setFriends] = useState([]);
    const [searchFriends, setSearchFriends] = useState("");
    const [pendingRequests, setPendingRequests] = useState([]);
    const [possibleFriends, setPossibleFriends] = useState([]);
    const [searchUsers, setSearchUsers] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [view, setView] = useState("friends");
    
    const location = useLocation();


    useEffect(() => {
        fetchData();
    }, []);
    
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
            fetchFriends();
        } catch (error) {
            console.error("Error removing friend:", error);
        }
    };

    const acceptRequest = async (requestId) => {
        try {
            await axios.post("http://localhost:5000/friend/accept_req", { userId: requestId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchPendingRequests();
            fetchFriends();
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };

    const rejectRequest = async (requestId) => {
        try {
            await axios.post("http://localhost:5000/friend/reject_req", { userId: requestId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchPendingRequests();
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };

    const sendFriendRequest = async (userIdToAdd) => {
        try {
            await axios.post("http://localhost:5000/friend/send_req", { userId: userIdToAdd }, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            fetchUsers();
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
                <button onClick={() => setView("friends")} className={view === "friends" ? "active" : ""}>My Friends</button>
                <button onClick={() => setView("pending")} className={view === "pending" ? "active" : ""}>Pending Requests</button>
                <button onClick={() => setView("add_friend")} className={view === "add_friend" ? "active" : ""}>Add Friend</button>
            </div>
            
            {isLoading ? (
              <div className="loading">Loading friends data...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : view === "friends" ? (
                <div className="friends-content">
                    <div className="search-bar">

                    <input type="text" placeholder="Search friends" value={searchFriends} onChange={(e) => setSearchFriends(e.target.value)} />
                    <button onClick={fetchFriends}>Search</button>
                    <ul>
                        {friends.filter(friend => friend.username.toLowerCase().includes(searchFriends.toLowerCase())).map(friend => (
                            <li key={friend.id}>{friend.username} ({friend.points} points) <button onClick={() => removeFriend(friend.id)}>Remove</button></li>
                        ))}
                    </ul>
                    </div>
                </div>
            ):

            view === "pending" ? (
                <div>
                    <h2>Pending Requests</h2>
                    <ul>
                        {pendingRequests.map(req => (
                            <li key={req.id}>{req.username} 
                                <button onClick={() => acceptRequest(req.id)}>Accept</button>
                                <button onClick={() => rejectRequest(req.id)}>Reject</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ):

            (
                <div>
                    <h2>Add Friend</h2>
                    <input type="text" placeholder="Search users" value={searchUsers} onChange={(e) => setSearchUsers(e.target.value)} />
                    <button onClick={fetchUsers}>Search</button>
                    <ul>
                        {possibleFriends.filter(user => user.username.toLowerCase().includes(searchUsers.toLowerCase())).map(user => (
                            <li key={user.id}>{user.username} ({user.points} points) <button onClick={() => sendFriendRequest(user.id)}>Add Friend</button></li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
        </div>
        </div>
        </div>
    );
};

export default FriendManagement;
