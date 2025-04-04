const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { monitorMiddleware} = require("../middleware/monitorMiddleware");
const authRoutes = require("../routes/authRoutes")
const leaderboardRoutes = require("../routes/leaderboardRoutes")
const quiz1Routes = require("../routes/quiz1Routes");
const quiz2Routes = require("../routes/quiz2Routes");
const challengeRoutes = require("../routes/challengeRoutes");
const friendRoutes = require("../routes/friendRoutes");
const profileRoutes = require("../routes/profileRouter");
const fedbckRoutes = require("../routes/fedbckRoutes");
const pingRoutes = require("../routes/pingRoutes")
const metricsRoutes = require("../routes/promRoutes");

const logger = require("../config/loki");
const { setSocketIo, setupGameEndHandler } = require("../controllers/quiz2Controller");
const { checkConnection } = require("../config/db");

dotenv.config();

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

// Attach socket.io instance to app
app.set("io", io);

//Monitoring via middleware
app.use(monitorMiddleware);

// Routes
app.use("/auth", authRoutes);
app.use("/leaderboard", leaderboardRoutes);
app.use("/quiz1", quiz1Routes);
app.use("/quiz2", quiz2Routes);
app.use("/challenge", challengeRoutes);
app.use("/friend", friendRoutes);
app.use("/profile", profileRoutes);
app.use("/feedback", fedbckRoutes);
app.use("/ping",pingRoutes);
app.use("/metrics",metricsRoutes);

// Base Route
app.get("/", (req, res) => {
    logger.info("GET / - Health Check");
    res.send("Welcome to QUIZ Backend");
});

// Initialize socket instance
setSocketIo(io);

// Handle WebSocket connections
io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    console.log(`Socket connected: ${socket.id}`);
    setupGameEndHandler(socket);
});

// Start server only if DB connection succeeds
checkConnection()
    .then(() => {
        server.listen(PORT, () => {
            logger.info(`Server started on port ${PORT}`);
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        logger.error(`Failed to connect to database: ${err.message}`);
        console.error("Failed to connect to DB. Server not started.", err);
        process.exit(1);
    });

// Graceful shutdown
process.on("SIGINT", () => {
    logger.info("SIGINT received: Shutting down server...");
    console.log("Shutting down server...");
    server.close(() => {
        logger.info("Server closed.");
        console.log("Server closed.");
        process.exit(0);
    });
});
