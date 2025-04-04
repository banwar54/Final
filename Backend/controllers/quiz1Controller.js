const { v4: uuidv4 } = require("uuid");
const { saveSinglePlayerSession } = require("../config/db_fun");
const { fetchTopicData } = require("./quesController");
const logger = require("../config/loki");

const userGameMap = {}; // Maps user ID to game details

const saveSession = async (gameId, playerId, playerScore) => {
    if (!playerId) {
        console.error("Invalid player ID, session not saved.");
        throw new Error("Invalid player ID, Session not saved");
    }
    try {
        await saveSinglePlayerSession(gameId, playerId, playerScore);
        console.log(`Game session saved: GameID=${gameId}, UserId=${playerId}, Score=${playerScore}`);
    } catch (err) {
        console.error("Error saving session:", err);
        throw err;
    }
};

const handleGameEnd = async (userId, gameId) => {
    const gameDetails = userGameMap[userId];
    if (!gameDetails || gameDetails.gameId !== gameId) return;

    try {
        await saveSession(gameId, userId, gameDetails.score);
        logger.info(`Game ${gameId} ended and cleaned up.`);
        console.log(`Game ${gameId} ended and cleaned up.`);
    } catch (err) {
        logger.error(`Error during game cleanup for GameID ${gameId}, Error: ${err.message}`);
    }

    delete userGameMap[userId];
};

const startGame = async (req, res) => {
    try {
        const gameId = uuidv4();
        const topicId = Math.floor(Math.random() * 5) + 1;
        const data = await fetchTopicData(topicId.toString());

        if (!req.user) {
            logger.error(`Quiz1 Start Failed, Error: Invalid/expired credentials`);
            return res.status(400).json({
                error: "Invalid request",
                message: "Invalid Credentials (Logout and Try Again)"
            });
        }

        const userId = req.user.userId;

        if (userGameMap.hasOwnProperty(userId)) {
            logger.error(`Quiz1 Start Failed for user: ${userId}, Error: Ongoing Game`);
            return res.status(400).json({
                error: "Invalid request",
                message: "A game is already in progress on your account"
            });
        }

        const gameDuration = 75 * 1000;

        userGameMap[userId] = {
            gameId,
            score: 0,
            timer: setTimeout(() => handleGameEnd(userId, gameId), gameDuration),
        };

        logger.info(`Quiz1 Started Successfully for user ${userId}`);
        res.status(201).json({
            message: "Game Started Successfully",
            gameId,
            questions: data.questions,
            topic: data.topic
        });
    } catch (err) {
        logger.error(`Failed to start game: ${err.message}`);
        console.error("Failed to fetch questions. Aborting game start.");
        return res.status(500).json({
            error: "Internal Server Error",
            message: "Failed to start game due to question retrieval error."
        });
    }
};

const endGame = async (req, res) => {
    const userId = req.user.userId;
    const { gameId, score } = req.body;
    console.log("Received response:", req.body);

    const gameDetails = userGameMap[userId];

    if (!gameDetails || gameDetails.gameId !== gameId) {
        logger.error(`Game End Failed for user: ${userId}, Error: Invalid Game Session`);
        return res.status(400).json({
            error: "Invalid Request",
            message: "Invalid game session."
        });
    }

    gameDetails.score = score;
    clearTimeout(gameDetails.timer);

    await handleGameEnd(userId, gameId);
    logger.info(`Game ended successfully for user ${userId}`);
    res.status(200).json({
        message: "Game ended successfully."
    });
};

module.exports = { startGame, endGame };
