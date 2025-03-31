const express = require("express");
const { signup, login } = require("../controllers/authController");

const router = express.Router();

// Check Auth Route
router.get("/", (req, res) => {
    res.send("Welcome to Auth Page");
});

// Check /signup Route          for debugging (optional to remove)
router.get("/signup", (req, res) => {
    res.send("Welcome to Signup Page");
});
// Register User
router.post("/signup", signup);

// Check /login Route           for debugging (optional to remove)
router.get("/login", (req, res) => {
    res.send("Welcome to Login Page");
});
// Login User
router.post("/login", login);

module.exports = router;
