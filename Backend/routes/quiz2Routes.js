const express = require("express");
const { joinQueue, leaveQueue } = require("../controllers/quiz2Controller");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/join", authenticateUser, joinQueue);
router.post("/leave", authenticateUser, leaveQueue);

module.exports = router;
