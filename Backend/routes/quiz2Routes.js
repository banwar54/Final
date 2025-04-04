const express = require("express");
const { joinQueue, leaveQueue } = require("../controllers/quiz2Controller");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // Adjust path if necessary

const router = express.Router();

// Join queue route
router.post("/join", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /quiz2/join - User ${req.user?.userId}`);
        await joinQueue(req, res, next);
    } catch (error) {
        logger.error(`POST /quiz2/join - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Leave queue route
router.post("/leave", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /quiz2/leave - User ${req.user?.userId}`);
        await leaveQueue(req, res, next);
    } catch (error) {
        logger.error(`POST /quiz2/leave - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
