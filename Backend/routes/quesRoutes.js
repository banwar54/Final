const express = require("express");
const { getQuesData } = require("../controllers/quesController");

const router = express.Router();

// Check Ques Route
router.get("/", async (req, res) => {
    res.send("Welcome to Ques Page");
    const data = await getQuesData("9");
    console.log(data);
});

module.exports = router;
