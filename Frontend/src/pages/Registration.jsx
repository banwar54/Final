import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography } from "@mui/material";
import axios from "axios";

import "../styles/Registration.css";

const Registration = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add this effect to detect autofill changes
  useEffect(() => {
    const checkAutofill = () => {
      const usernameField = document.querySelector('input[name="username"]');
      const emailField = document.querySelector('input[name="email"]');
      const passwordField = document.querySelector('input[name="password"]');
      
      if (usernameField && emailField && passwordField) {
        // Update state if fields were autofilled
        const newFormData = {...formData};
        let changed = false;
        
        if (usernameField.value && usernameField.value !== formData.username) {
          newFormData.username = usernameField.value;
          changed = true;
        }
        
        if (emailField.value && emailField.value !== formData.email) {
          newFormData.email = emailField.value;
          changed = true;
        }
        
        if (passwordField.value && passwordField.value !== formData.password) {
          newFormData.password = passwordField.value;
          changed = true;
        }
        
        if (changed) {
          setFormData(newFormData);
        }
      }
    };

    // Check shortly after component mounts
    const timer = setTimeout(checkAutofill, 500);
    
    // Add animation frame check for Chrome's delayed autofill
    let frameId;
    const checkOnAnimationFrame = () => {
      checkAutofill();
      frameId = requestAnimationFrame(checkOnAnimationFrame);
    };
    
    frameId = requestAnimationFrame(checkOnAnimationFrame);
    
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("All fields are required");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/auth/signup", formData);
      setSuccessMessage(response.data.message);
      setFormData({ username: "", email: "", password: "" });

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response ? err.response.data.error : "Failed to register. Please try again.");
    }
  };

  return (
    <>
      <Box className="registration-container">
        <Box className="registration-box">
          <Typography variant="h4" className="registration-title">
            Sign Up
          </Typography>

          {error && <Typography className="registration-error">{error}</Typography>}
          {successMessage && <Typography className="registration-success">{successMessage}</Typography>}

          <Typography className="registration-label">Username</Typography>
          <TextField
            name="username"
            variant="outlined"
            fullWidth
            placeholder="Enter username"
            className="registration-input"
            value={formData.username}
            onChange={handleChange}
            inputProps={{ 
              autoComplete: "username",
            }}
          />

          <Typography className="registration-label">Email</Typography>
          <TextField
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            placeholder="Enter email"
            className="registration-input"
            value={formData.email}
            onChange={handleChange}
            inputProps={{ 
              autoComplete: "email",
            }}
          />

          <Typography className="registration-label">Password</Typography>
          <TextField
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            placeholder="Enter password"
            className="registration-input"
            value={formData.password}
            onChange={handleChange}
            inputProps={{ 
              autoComplete: "new-password",
            }}
          />

          <Button 
            variant="contained" 
            className="registration-submit-button" 
            onClick={handleSubmit}
          >
            Submit
          </Button>

          <Typography className="registration-login-text">
            Already have an account?{" "}
            <Link to="/login" className="registration-login-link">
              Login
            </Link>
          </Typography>

          
        </Box>
      </Box>
    </>
  );
};

export default Registration;