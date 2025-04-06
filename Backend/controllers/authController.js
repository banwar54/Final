const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const logger = require("../config/loki");
const {
    createUser,
    findUserByUsername,
    findUserByEmail,
    update_log_date,
} = require("../config/db_fun");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "needs_to_be_changed";

// Signup Function
const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            logger.error("Signup attempt with incomplete details");
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser.length > 0) {
            logger.error(`Signup failed - Username already exists: ${username}`);
            return res.status(400).json({ message: "Username already exists!" });
        }
        const existingEmail = await findUserByEmail(email);
        if (existingEmail.length > 0) {
            logger.error(`Signup failed - Email already exists: ${username}`);
            return res.status(400).json({ message: "User Email already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, email, hashedPassword);

        logger.info(`User registered: [${username}, ${email}]`);
        res.status(201).json({
            message: "User registered successfully!",
            user: newUser,
        });
    } catch (error) {
        logger.error(`Signup failed: ${error.message}`);
        res.status(500).json({
            message: "Error registering user",
            error: error.message,
        });
    }
};

// Login Function
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            logger.error("Login attempt with incomplete credentials");
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await findUserByUsername(username);
        if (user.length === 0) {
            logger.error(`Login failed - User not found: ${username}`);
            return res.status(404).json({ message: "User not found!" });
        }

        const isValid = await bcrypt.compare(password, user[0].password);
        if (!isValid) {
            logger.error(`Login failed - Invalid password for user: ${username}`);
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign(
            { userId: user[0].id, username: user[0].username },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        const today = new Date().toISOString().split("T")[0];
        await update_log_date(user[0].id, today);

        logger.info(`User logged in: ${username}`);
        res.status(200).json({
            message: "Login successful!",
            token,
            user: {
                username: user[0].username,
                email: user[0].email,
            },
        });
    } catch (error) {
        logger.error(`Login failed: ${error.message}`);
        res.status(500).json({
            message: "Error logging in",
            error: error.message,
        });
    }
};

module.exports = { signup, login };
