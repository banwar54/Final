const express = require("express");
const { signup, login } = require("../controllers/authController");
const logger = require("../config/loki");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Check Auth Route
router.get("/", (req, res) => {
    logger.info("GET /auth - Accessed Auth Home");
    res.send("Welcome to Auth Page");
});

// Check /signup Route (for debugging)
router.get("/signup", (req, res) => {
    logger.info("GET /auth/signup - Accessed Signup Page");
    res.send("Welcome to Signup Page");
});

// Register User
router.post("/signup", async (req, res, next) => {
    try {
        logger.info("POST /auth/signup - Attempt to register");
        await signup(req, res, next);
    } catch (error) {
        logger.error(`POST /auth/signup - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Check /login Route (for debugging)
router.get("/login", (req, res) => {
    logger.info("GET /auth/login - Accessed Login Page");
    res.send("Welcome to Login Page");
});

// Login User
router.post("/login", async (req, res, next) => {
    try {
        logger.info("POST /auth/login - Attempt to login");
        await login(req, res, next);
    } catch (error) {
        logger.error(`POST /auth/login - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Log Logout
router.post("/logout", authenticateUser, (req, res) => {
    const userId = req.user?.userId;
    logger.info(`User logged out. UserID=${userId}`);
    return res.status(200).json({ message: "User logged out" });
});

module.exports = router;
