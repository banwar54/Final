const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");

const { checkConnection } = require("../config/db");

dotenv.config();

// Server setup
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Base Route
app.get("/", (req, res) => {
    res.send("Welcome to QUIZ");
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