const express = require("express");
const { save_Challenge,show_challenge } = require("../controllers/challengeController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateUser, save_Challenge);
router.get("/show",authenticateUser , show_challenge)

module.exports = router;