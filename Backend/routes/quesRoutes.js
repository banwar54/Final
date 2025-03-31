const express = require("express");
const { getTopicData } = require("../controllers/quesController");
const { authenticateUser } = require("../middleware/authMiddleware");

const router = express.Router();

// Check Ques Route
// router.get("/", authenticateUser, getTopicData);        //This will be main route later
router.get("/", getTopicData);                  //This is temp Route for debugging will be removed later

module.exports = router;
