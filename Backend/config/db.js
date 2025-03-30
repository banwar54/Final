const pg = require("postgres");
const dotenv = require("dotenv");

dotenv.config();

// Validate DATABASE_URL 
if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in .env file.");
    process.exit(1); 
}

// Establish connection to postgres
const postgres = pg(process.env.DATABASE_URL, {
    ssl: "require", 
});

//Check Connection
const checkConnection = async () => {
    try {
        await postgres`SELECT 1`;
        console.log("Database connection successful");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
};

module.exports = { postgres, checkConnection };