const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const logger = require("../config/loki"); // Adjust path if different

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "needs_to_be_changed";

// Middleware to check authentication
const authenticateUser = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            logger.warn("Authentication failed: No Authorization header provided");
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

        if (!token) {
            logger.warn("Authentication failed: Token not found in Authorization header");
            return res.status(401).json({ message: "Unauthorized: Token missing" });
        }

        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;

        // logger.info(`User authenticated successfully. UserID=${decoded.userId}`);
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            logger.warn(`Authentication failed: Token expired`);
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        }

        logger.error(`Authentication failed: Invalid token - ${error.message}`);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

module.exports = { authenticateUser };
