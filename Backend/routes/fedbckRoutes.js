const express = require("express");
const { save_feedback} = require("../controllers/fedbckController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateUser, save_feedback);


module.exports = router;