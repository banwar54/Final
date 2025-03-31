const { getSinglePlayerLeaderboard, getTwoPlayerLeaderboard } = require("../config/db_fun")

// Function to fetch leaderboard data
const get_leaderBoard = async (req, res) => {
    try {
        const data1 = await getSinglePlayerLeaderboard();
        const data2 = await getTwoPlayerLeaderboard();

        // Debugging logs (will be remove later)
        // console.log("Leaderboard1:", data1);
        // console.log("Leaderboard2:", data2);

        return res.status(200).json({
            message: "Leaderboard fetched successfully!",
            leaderboard1: data1.length > 0 ? data1 : [],
            leaderboard2: data2.length > 0 ? data2 : [],
        });

    } catch (error) {
        console.error("Database Error:", error);
        return res.status(500).json({
            message: "Database error occurred.",
            error: error.message,
        });
    }
};

module.exports = { get_leaderBoard };