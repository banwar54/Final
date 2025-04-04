const express = require("express");
const { get_leaderBoard } = require("../controllers/leaderboardController");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // adjust path if necessary

const router = express.Router();

// Leaderboard route - User must be logged in
router.get("/", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`GET /leaderboard - User ${req.user?.userId}`);
        await get_leaderBoard(req, res, next);
    } catch (error) {
        logger.error(`GET /leaderboard - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
