const express = require("express");
const { save_Challenge, show_challenge } = require("../controllers/challengeController");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // Adjust the path if needed

const router = express.Router();

// Save Challenge Route
router.post("/", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /challenge - User ${req.user?.userId} is attempting to save a challenge`);
        await save_Challenge(req, res, next);
    } catch (error) {
        logger.error(`POST /challenge - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Show Challenge Route
router.get("/show", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`GET /challenge/show - User ${req.user?.userId} is requesting challenge data`);
        await show_challenge(req, res, next);
    } catch (error) {
        logger.error(`GET /challenge/show - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;