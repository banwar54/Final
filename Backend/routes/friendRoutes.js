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

const router = express.Router();

router.get("/get_users", authenticateUser, Get_Users);
router.post("/send_req", authenticateUser, Send_FriendReq);
router.get("/show_req", authenticateUser, Show_FriendReq);
router.post("/accept_req", authenticateUser, Accept_FriendReq);
router.post("/reject_req", authenticateUser, Reject_FriendReq);
router.get("/get_friends", authenticateUser, Fetch_Friends);
router.post("/remove_friend", authenticateUser, Remove_Friend);

module.exports = router;