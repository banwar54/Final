const { getSinglePlayerLeaderboard, getTwoPlayerLeaderboard } = require("../config/db_fun");
const logger = require("../config/loki");

// Function to fetch leaderboard data
const get_leaderBoard = async (req, res) => {
    try {
        const leaderboardSingle = await getSinglePlayerLeaderboard() || [];
        const leaderboardTwoPlayer = await getTwoPlayerLeaderboard() || [];

        logger.info("Leaderboard fetched successfully.");

        return res.status(200).json({
            message: "Leaderboard fetched successfully!",
            leaderboard1: leaderboardSingle,
            leaderboard2: leaderboardTwoPlayer,
        });
    } catch (error) {
        logger.error(`Failed to fetch leaderboard: ${error.message}`);
        return res.status(500).json({
            message: "An error occurred while fetching leaderboard data.",
            error: error.message,
        });
    }
};

module.exports = { get_leaderBoard };
