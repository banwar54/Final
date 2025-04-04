const express = require("express");
const { getProfile } = require("../controllers/profileController");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // Adjust the path if needed

const router = express.Router();

// Profile route - User must be logged in
router.get("/", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`GET /profile - User ${req.user?.userId}`);
        await getProfile(req, res, next);
    } catch (error) {
        logger.error(`GET /profile - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
