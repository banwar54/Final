const express = require("express");
const { getProfile } = require("../controllers/profileController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateUser, getProfile);

module.exports = router;
