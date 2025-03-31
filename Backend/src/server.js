const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");

const authRoutes = require("../routes/authRoutes")
const leaderboardRoutes = require("../routes/leaderboardRoutes")
const questionRoutes = require("../routes/quesRoutes")                   // will be remove after /queue is created
const { checkConnection } = require("../config/db");

dotenv.config();

// Server setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/auth", authRoutes);
app.use("/leaderboard",leaderboardRoutes)
app.use("/question",questionRoutes)         // will be remove after /queue is created

// Base Route
app.get("/", (req, res) => {
    res.send("Welcome to QUIZ Backend");
});

// Check database connection before starting the server
checkConnection()
    .then(() => {
        // Start the server only if the database is connected
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        // Log error if the database connection fails
        console.error("Failed to connect to DB. Server not started.", err);
    });