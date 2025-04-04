const express = require("express");
const { startGame, endGame } = require("../controllers/quiz1Controller");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // Adjust path as needed

const router = express.Router();

// Start game route
router.post("/start", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /quiz1/start - User ${req.user?.userId}`);
        await startGame(req, res, next);
    } catch (error) {
        logger.error(`POST /quiz1/start - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// End game route
router.post("/end", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /quiz1/end - User ${req.user?.userId}`);
        await endGame(req, res, next);
    } catch (error) {
        logger.error(`POST /quiz1/end - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
