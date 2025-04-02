const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const authRoutes = require("../routes/authRoutes")
const leaderboardRoutes = require("../routes/leaderboardRoutes")
const questionRoutes = require("../routes/quesRoutes")                   // will be remove after /queue is created
const quiz2Routes = require("../routes/quiz2Routes");
const challengeRoutes = require("../routes/challengeRoutes");
const friendRoutes = require("../routes/friendRoutes");
const { setupGameEvents } = require("../controllers/quiz2Controller");
const { checkConnection } = require("../config/db");

dotenv.config();

// Server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: "*",
        credentials: true,
    },
});
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));

// Store io instance in app for controllers to use
app.set("io", io);

// Import game events
setupGameEvents(io);

// Routes
app.use("/auth", authRoutes);
app.use("/leaderboard",leaderboardRoutes)
app.use("/question",questionRoutes)         // will be remove after /queue is created
app.use("/quiz2",quiz2Routes)
app.use("/challenge",challengeRoutes)
app.use("/friend",friendRoutes)
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
        // If the database connection fails
        console.error("Failed to connect to DB. Server not started.", err);
        process.exit(1);
    });

// Shutdown handling
process.on("SIGINT", () => {
    console.log("Shutting down server...");
    server.close(() => {
        console.log("Server closed.");
        process.exit(0);
    });
});