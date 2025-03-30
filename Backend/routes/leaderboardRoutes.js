const express = require("express");
const { get_leaderBoard } = require("../controllers/leaderboardController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Leaderboard route - User must be logged in
router.get("/", authenticateUser, async (req, res) => {
    const result = await get_leaderBoard();

    if (result.error) {
        return res.status(404).json(result);
    }

    res.json(result);
});

module.exports = router;