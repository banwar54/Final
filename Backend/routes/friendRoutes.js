const express = require("express");
const { add_friend } = require("../controllers/friendsController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/display", authenticateUser, add_friend);

module.exports = router;