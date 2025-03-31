const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { createUser, findUserByUsername } = require("../config/db_fun");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET || "needs_to_be_changed";

// Signup Fucntion
const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return { error: "All fields are required" };
        }

        // Check if user already exists
        const existingUser = await findUserByUsername(username);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists!" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(username, email, hashedPassword);
        res.status(201).json({ message: "User registered successfully!", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

// Login Function
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const user = await findUserByUsername(username);
        if (user.length === 0) {
            return res.status(400).json({ message: "User not found!" });
        }

        // Validate password
        const isValid = await bcrypt.compare(password, user[0].password);
        if (!isValid) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user[0].id, username: user[0].username }, SECRET_KEY, { expiresIn: "1h" });

        // res.status(200).json({ message: "Login successful!", token, user: { username: user[0].username, email: user[0].email }});

        res.cookie('token',token,{
            // httpOnly: true,  // Prevents JavaScript access (for security)
            // secure: true,    // Ensures it's only sent over HTTPS (set to false for local testing)
            // sameSite: 'Lax', // Adjust this if frontend and backend are on different domains
            maxAge: 24 * 60 * 60 * 1000 // Expires in 1 day (adjust as needed)
        });
        res.status(200).json({ message: "Login successful!", user: { username: user[0].username, email: user[0].email}});
            
    } catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
};

module.exports = { signup, login };
