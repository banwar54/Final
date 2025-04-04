const express = require("express");
const { authenticateUser } = require("../middleware/authMiddleware");
const {
    Get_Users,
    Send_FriendReq,
    Show_FriendReq,
    Accept_FriendReq,
    Reject_FriendReq,
    Fetch_Friends,
    Remove_Friend,
} = require("../controllers/friendsController");

const logger = require("../config/loki"); // Adjust path if needed

const router = express.Router();

router.get("/get_users", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`GET /get_users - User ${req.user?.userId}`);
        await Get_Users(req, res, next);
    } catch (error) {
        logger.error(`GET /get_users - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/send_req", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /send_req - User ${req.user?.userId}`);
        await Send_FriendReq(req, res, next);
    } catch (error) {
        logger.error(`POST /send_req - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/show_req", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`GET /show_req - User ${req.user?.userId}`);
        await Show_FriendReq(req, res, next);
    } catch (error) {
        logger.error(`GET /show_req - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/accept_req", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /accept_req - User ${req.user?.userId}`);
        await Accept_FriendReq(req, res, next);
    } catch (error) {
        logger.error(`POST /accept_req - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/reject_req", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /reject_req - User ${req.user?.userId}`);
        await Reject_FriendReq(req, res, next);
    } catch (error) {
        logger.error(`POST /reject_req - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/get_friends", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`GET /get_friends - User ${req.user?.userId}`);
        await Fetch_Friends(req, res, next);
    } catch (error) {
        logger.error(`GET /get_friends - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.post("/remove_friend", authenticateUser, async (req, res, next) => {
    try {
        logger.info(`POST /remove_friend - User ${req.user?.userId}`);
        await Remove_Friend(req, res, next);
    } catch (error) {
        logger.error(`POST /remove_friend - Error: ${error.message}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;