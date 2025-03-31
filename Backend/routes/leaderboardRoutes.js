const express = require("express");
const { get_leaderBoard } = require("../controllers/leaderboardController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Leaderboard route - User must be logged in
router.get("/", authenticateUser, get_leaderBoard);

module.exports = router;