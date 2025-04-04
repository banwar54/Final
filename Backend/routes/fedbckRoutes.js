const express = require("express");
const { save_feedback } = require("../controllers/fedbckController");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // Adjust path if needed

const router = express.Router();

router.post("/", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /feedback - User ${req.user?.userId} is submitting feedback`);
        await save_feedback(req, res, next);
    } catch (error) {
        logger.error(`POST /feedback - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;