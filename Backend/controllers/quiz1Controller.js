const { v4: uuidv4 } = require("uuid");
const { saveSinglePlayerSession } = require("../config/db_fun");
const { fetchTopicData } = require("./quesController");

const userGameMap = {}; // Maps user ID to game details

// Helper function to retrieve game details using user ID
const getGameDetailsFromUserId = (userId) => userGameMap[userId] || null;

// Save game session to the database
const saveSession = async (gameId, playerId, playerScore) => {
    if (!playerId) {
        console.error("Invalid player ID, session not saved.");
        return;
    }
    try {
        await saveSinglePlayerSession(gameId, playerId, playerScore);
        console.log(`Game session saved: GameID=${gameId}, UserId=${playerId}, Score=${playerScore}`);
    } catch (error) {
        console.error("Error saving session:", error);
    }
};

// Handle game end logic
const handleGameEnd = (userId, gameId) => {
    const gameDetails = getGameDetailsFromUserId(userId);
    if (!gameDetails || gameDetails.gameId !== gameId) return;

    saveSession(gameId, userId, gameDetails.score);
    delete userGameMap[userId];
    console.log(`Game ${gameId} ended and cleaned up.`);
};

// Start a new game session
const startGame = async (req, res) => {
    if (!req.user) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const userId = req.user.id;

    // Check if the user is already in an active game
    if (getGameDetailsFromUserId(userId)) {
        return res.status(400).json({
            error: "A game is already in progress on your account. Please wait for it to finish."
        });
    }

    const gameId = uuidv4();
    const data = await fetchTopicData();

    if (!data.success) {
        console.error("Failed to fetch questions. Aborting game start.");
        return res.status(500).json({ error: "Failed to start game due to question retrieval error." });
    }

    // Set game duration (75 seconds) to automa
    const gameDuration =  75 * 1000;

    // Store game details
    userGameMap[userId] = {
        gameId: gameId,
        score: 0,
        timer: setTimeout(() => handleGameEnd(userId, gameId), gameDuration),
    };

    res.status(201).json({
        message: "Game Started Successfully",
        gameId: gameId,
        data
    });
};

// End the game session manually
const endGame = (req, res) => {
    const { userId, gameId, score } = req.body;
    const gameDetails = getGameDetailsFromUserId(userId);

    if (!gameDetails || gameDetails.gameId !== gameId) {
        return res.status(400).json({ error: "Invalid game session." });
    }

    // Update the score before ending the game
    gameDetails.score = score;

    // Clear the timeout to prevent automatic endGame call
    clearTimeout(gameDetails.timer);

    handleGameEnd(userId, gameId);
    res.status(200).json({ message: "Game ended successfully." });
};

module.exports = { startGame, endGame };
