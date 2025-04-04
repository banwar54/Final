const { v4: uuidv4 } = require("uuid");
const { saveTwoPlayerSession } = require("../config/db_fun");
const { fetchTopicData } = require("./quesController");
const logger = require("../config/loki");

let io;

const setSocketIo = (socketIoInstance) => {
    io = socketIoInstance;
};

let waitingQueue = [];
let activePlayers = [];
let gameInProgress = false;
let blockNewGame = false;
const socketIdToUserId = {}; // Maps socket ID to user ID
const UserIdToSocketId = {}; // Maps user ID to socket ID
let gameScores = {};

const findGameBySocketId = (socketId) => {
    const userId = socketIdToUserId[socketId];
    if (!userId) return null;

    for (const gameId in gameScores) {
        if (gameScores[gameId].player1.userId === userId || 
            gameScores[gameId].player2.userId === userId) {
            return gameId;
        }
    }
    return null;
};

// Save game session to DB
const saveSession = async (gameId, player1, player2, player1Score, player2Score) => {
    if (!player1 || !player2) {
        throw new Error("Invalid player IDs, session not saved.");
    }

    let result = 0; 
    if (player1Score > player2Score) {
        result = 1; 
    } else if (player2Score > player1Score) {
        result = 2; 
    }

    try {
        await saveTwoPlayerSession(gameId, player1, player2, result);
        logger.info(`Game session saved: GameID=${gameId}, Result=${result}`);
    } catch (err) {
        logger.error(`Error saving game session: ${err.message}`);
        throw err;
    }
};

// Socket event handler for game_end (receiving scores)
const setupGameEndHandler = (socket) => {
    socket.on("game_end", async (data) => {
        try {
            const userId = socketIdToUserId[socket.id];
            if (!userId) {
                throw new Error(`User Not found for Socket ${socket.id}`);
            }

            const { gameId, score } = data;

            if (!gameScores[gameId]) {
                throw new Error(`Game ${gameId} not found in active games`);
            }

            // Determine if this is player 1 or player 2
            if (gameScores[gameId].player1.userId === userId) {
                gameScores[gameId].player1.score = score;
                gameScores[gameId].player1.submitted = true;
                logger.info(`Player 1 (${userId}) submitted score: ${score}`);
            } else if (gameScores[gameId].player2.userId === userId) {
                gameScores[gameId].player2.score = score;
                gameScores[gameId].player2.submitted = true;
                logger.info(`Player 2 (${userId}) submitted score: ${score}`);
            } else {
                logger.error(`User ${userId} not part of game ${gameId}`);
                return;
            }

            const currentTime = Date.now();
            const bothSubmitted = gameScores[gameId].player1.submitted && gameScores[gameId].player2.submitted;
            const isGameExpired = currentTime >= gameScores[gameId].endTime;

            if (bothSubmitted || isGameExpired) {
                await finishGame(gameId);
                logger.info(`Quiz2 Finished with Gameid: ${gameId}`);
            }
        } catch (err) {
            logger.error(`Failed to end game, Error: ${err.message}`);
        }
    });

    socket.on("disconnect", () => {
        try {
            logger.info(`Received disconnect req from socket : ${socket.id}`);
            if (!socketIdToUserId.hasOwnProperty(socket.id)) {
                logger.info("Socket was already removed by game mechanism");
                return;
            }
            const userId = socketIdToUserId[socket.id];
            logger.info(`User ${userId} disconnected, cleaning up...`);

            const gameId = findGameBySocketId(socket.id);
            if (gameId) {
                logger.info(`User ${userId} was in active game ${gameId}, skipping`);
            }

            const index = waitingQueue.indexOf(socket.id);
            if (index !== -1) {
                waitingQueue.splice(index, 1);
                logger.info(`User${userId} left waiting queue`);
                logger.info(`Removed disconnected user ${userId} from waiting queue`);
            }

            logger.info("Cleaned up respective mappings");
            delete UserIdToSocketId[userId];
            delete socketIdToUserId[socket.id];
        } catch (err) {
            if (!socket.id) socket.id = "undefined socket id";
            logger.error(`Error Disconnecting user(${socket.id}), Error: ${err.message}`);
        }
    });
};

const finishGame = async (gameId) => {
    try {
        if (!gameScores[gameId]) {
            throw new Error(`Game end failed : ${gameId} not Found`);
        }

        const { player1, player2 } = gameScores[gameId];

        logger.info(`Game ${gameId} finished with scores: Player1=${player1.score}, Player2=${player2.score}`);

        await saveSession(gameId, player1.userId, player2.userId, player1.score, player2.score);

        delete gameScores[gameId];

        activePlayers = [];
        gameInProgress = false;
        blockNewGame = true;

        setTimeout(() => {
            blockNewGame = false;
            logger.info("Game queue open for new players.");
            startGame().catch(err => logger.error(`startGame error: ${err.message}`));
        }, 3000);
    } catch (err) {
        logger.error(`Error finishing game ${gameId}: ${err.message}`);
    }
};

const startGame = async () => {
    try {
        if (waitingQueue.length < 2 || gameInProgress || blockNewGame) {
            return;
        }

        gameInProgress = true;
        activePlayers = [waitingQueue.shift(), waitingQueue.shift()];

        const gameId = uuidv4();
        const topicId = Math.floor(Math.random() * 5) + 1;

        const data = await fetchTopicData(topicId.toString());

        if (!data) {
            logger.error("Failed to fetch topic details, aborting game start");
            gameInProgress = false;
            waitingQueue.unshift(activePlayers[1]);
            waitingQueue.unshift(activePlayers[0]);
            activePlayers = [];
            return;
        }

        const players = [socketIdToUserId[activePlayers[0]], socketIdToUserId[activePlayers[1]]];
        logger.info(`Game started: GameID=${gameId}, Players=[${players[0]}, ${players[1]}]`);

        gameScores[gameId] = {
            player1: { userId: players[0], score: 0, submitted: false },
            player2: { userId: players[1], score: 0, submitted: false },
            endTime: Date.now() + 135000,
            gameId: gameId
        };

        activePlayers.forEach(socketId => {
            io.to(socketId).emit("game_start", {
                gameId: gameId,
                message: "Game started!",
                questions: data.questions,
                topic: data.topic
            });
            logger.info(`Game started for player ${socketIdToUserId[socketId]}`);
        });
    } catch (err) {
        logger.error(`Error in startGame: ${err.message}`);
        gameInProgress = false;

        if (activePlayers.length === 2) {
            waitingQueue.unshift(activePlayers[1]);
            waitingQueue.unshift(activePlayers[0]);
            activePlayers = [];
        }
    }
};

const joinQueue = async (req, res) => {
    try {
        const socketId = req.query.socketId;
        const userId = req.user.userId;

        if (!socketId) {
            res.status(400).json({ error: "Missing socket ID" });
            return;
        }

        if (UserIdToSocketId[userId]) {
            const prev_socket_id = UserIdToSocketId[userId];
            if (waitingQueue.includes(prev_socket_id)) {
                const index = waitingQueue.indexOf(prev_socket_id);
                logger.info(`Removing user ${req.user.userId} with old socketID=${prev_socket_id} from waiting queue`);
                waitingQueue.splice(index, 1);
                delete socketIdToUserId[prev_socket_id];
                delete UserIdToSocketId[userId];
                logger.info(`Removed user ${req.user.userId} with old socketID=${prev_socket_id} from waiting queue`);
            } else if (activePlayers.includes(prev_socket_id)) {
                res.status(400).json({
                    error: "Already in a match",
                    message: "You are already in an active match from another window/device."
                });
                return;
            }
        }

        socketIdToUserId[socketId] = userId;
        UserIdToSocketId[userId] = socketId;

        waitingQueue.push(socketId);
        logger.info(`User ${req.user.username} joined queue. SocketID=${socketId}`);
        logger.info("Waiting Queue", waitingQueue);

        io.to(socketId).emit("queued", { message: "You're in the queue. Please wait for another player." });

        await startGame();
        res.json({ message: "Added to queue", socketId });

    } catch (err) {
        logger.error(`Error in joinQueue: ${err.message}`);
        res.status(500).json({ error: "Server error" });
    }
};

const leaveQueue = async (req, res) => {
    try {
        const socketId = req.query.socketId;

        if (!socketId) {
            res.status(400).json({ error: "Missing socket ID" });
            return;
        }

        if (!req.user) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        const userId = req.user.id;

        const index = waitingQueue.indexOf(socketId);
        if (index !== -1) {
            waitingQueue.splice(index, 1);
            logger.info(`User ${req.user.username} left queue. SocketID=${socketId}`);

            delete socketIdToUserId[socketId];
            delete UserIdToSocketId[userId];

            res.json({ message: "Removed from queue", success: true });
        } else if (activePlayers.includes(socketId)) {
            res.json({
                message: "Cannot leave active game",
                inActiveGame: true,
                success: false
            });
        } else {
            res.json({
                message: "Not found in queue",
                success: true
            });
        }
    } catch (err) {
        logger.error(`Error in leaveQueue: ${err.message}`);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports = { setSocketIo, setupGameEndHandler, joinQueue, leaveQueue };
