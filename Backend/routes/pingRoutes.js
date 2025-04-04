const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const logger = require("../config/loki"); // adjust path if necessary

const router = express.Router();

// Ping route - Validate Token
router.get("/", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`Token ping successful for userId=${req.user.userId}`);
        res.status(200).json({
            message: "Token is valid",
            user: req.user
        });
    } catch (error) {
        logger.error(`Ping route failed: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
