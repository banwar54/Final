import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import "../styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      console.log("Login Successful:", data);
      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        #root {
          width: 100%;
          height: 100%;
        }
      `}</style>

      <Box className="login-container">
        <Box className="login-box">
          <Typography variant="h4" className="login-title">
            Login
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit} className="login-form">
            <Typography className="login-label">Email</Typography>
            <TextField
              type="email"
              variant="outlined"
              fullWidth
              placeholder="Enter your email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="login-input"
            />

            <Typography className="login-label">Password</Typography>
            <TextField
              type="password"
              variant="outlined"
              fullWidth
              placeholder="Enter your password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="login-input"
            />

            <Button type="submit" variant="contained" className="login-submit-button">
              Submit
            </Button>
          </form>

          <Typography className="login-register-text">
            Don't have an account?{" "}
            <Link to="/registration" className="login-register-link">
              Register
            </Link>
          </Typography>

          <Button component={Link} to="/" variant="contained" className="login-submit-button">
            Move to Home Page
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Login;
