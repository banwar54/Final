const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

const authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"];
    
    if (!token) {
        return res.status(403).json({ message: "Access denied! No token provided." });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token!" });
    }
};

module.exports = { authenticateToken };
