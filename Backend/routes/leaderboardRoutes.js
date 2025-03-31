const express = require("express");
const { get_leaderBoard } = require("../controllers/leaderboardController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Leaderboard route - User must be logged in
// router.get("/", authenticateUser, get_leaderBoard);         //this will be main call after authentication
router.get("/", get_leaderBoard);         //this is temp route for debugging will be removed later

module.exports = router;