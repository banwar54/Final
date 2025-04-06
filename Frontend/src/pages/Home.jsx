import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Slide } from "@mui/material";
import swordsLogo from "@images/swords.jpg";
import loginImage from "@images/Login.jpg";
import "../styles/Home.css";

const Home = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const navigate = useNavigate();
  const [showTitle, setShowTitle] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);


  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token){
      navigate("/login");
      return;
    }
    try {
      const response = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        console.log("Logout logged successfully");
      } else if (response.status === 401 || response.status === 403) {
        console.warn("Token expired or invalid, still clearing localStorage");
      } else {
        console.warn("Unexpected logout response:", response.status);
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear the token in all cases
      localStorage.removeItem("token");
      navigate("/login"); 
    }
  };
  
  // Animation effects for homepage
  useEffect(() => {
    if (isHomePage) {
      setTimeout(() => setShowTitle(true), 500);
      setTimeout(() => setShowButtons(true), 1200);
    }
  }, [isHomePage]);
  
  // Close sidebar when location changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };
  
  // Handle overflow only when component mounts and unmounts
  useEffect(() => {
    const originalOverflowX = document.documentElement.style.overflowX;
    const originalOverflowY = document.documentElement.style.overflowY;
    document.documentElement.style.overflowX = "hidden";
    document.documentElement.style.overflowY = "hidden";
    
    return () => {
      document.documentElement.style.overflowX = originalOverflowX;
      document.documentElement.style.overflowY = originalOverflowY;
    };
  }, []);
  
  return (
    <div className="container">
      {isHomePage && (
        <>
          {isSidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
          <header className="header">
            <button onClick={toggleSidebar} className="menu-button">☰</button>
            <div className="header-content">
              <img src={swordsLogo} alt="Swords Logo" className="logo" />
              <div className="title-logo">QUIZENA</div>
            </div>
            <nav className="nav">
              <button className="signup-button" onClick={handleLogout} title="">Log Out</button>
            </nav>
          </header>
          
          <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
            <div className="sidebar-header">
              <img src={swordsLogo} alt="Profile" className="profile-img" />
              <h3>{localStorage.getItem("username")}</h3>
            </div>
            <nav>
              <ul className="nav-list">
                <li><Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`} title="">🏠 Home</Link></li>
                <li><Link to="/arena" className="nav-link" title="">⚔️ Enter Arena</Link></li>
                <li><Link to="/profile" className="nav-link" title="">👤 Profile</Link></li>
                <li><Link to="/friends" className="nav-link" title="">🤝 Friends</Link></li>
                <li><Link to="/leaderboard" className="nav-link" title="">🏆 Leaderboard</Link></li>
                <li><Link to="/rules" className="nav-link" title="">📜 Rules</Link></li>
                <li><Link to="/feedback" className="nav-link text-truncate" title="">📝 Feedback</Link></li>
              </ul>
            </nav>
          </div>
          
          <div className="background" style={{ backgroundImage: `url(${loginImage})` }}>
            <Slide direction="up" in={showTitle} mountOnEnter unmountOnExit>
              <div className="title">WELCOME "{localStorage.getItem("username").toUpperCase()}" TO THE BATTLES OF THE QUIZ LORDS</div>
            </Slide>
            <Slide direction="up" in={showButtons} timeout={1000}>
              <div className="button-container">
                <HoverButton to="/challenge">CREATE CHALLENGE</HoverButton>
                <HoverButton to="/showchallenge">SHOW CHALLENGES</HoverButton>
              </div>
            </Slide>
          </div>
        </>
      )}
    </div>
  );
};

const HoverButton = ({ to, children }) => {
  const [hover, setHover] = useState(false);
  
  return (
    <Link
      to={to}
      className={`button ${hover ? "hover" : ""}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title=""
    >
      {children}
    </Link>
  );
};

export default Home;