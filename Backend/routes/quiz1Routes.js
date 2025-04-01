const express = require("express");
const { startGame, endGame } = require("../controllers/quiz1Controller");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/start", authenticateUser, startGame);
router.post("/end", authenticateUser, endGame);

module.exports = router;
