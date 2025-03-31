const { v4: uuidv4 } = require("uuid");
const { postgres } = require("../config/db");
const { fetchTopicData } = require("./quesController");

let waitingQueue = [];
let activeGames = {};
const userSocketMap = {}; // Maps socket ID to user ID
const userIdToSocketMap = {}; // Maps user ID to socket ID

// Helper functions
const getUserFromSocket = (socketId) => userSocketMap[socketId] || -1;
const isUserInQueue = (userId) => userIdToSocketMap.hasOwnProperty(userId);

// Save game session to DB
const saveSession = async (gameId, player1, player2, player1Score, player2Score) => {
    if (player1 === -1 || player2 === -1) return console.error("Invalid player IDs, session not saved.");

    const result = player1Score > player2Score ? 1 : player2Score > player1Score ? 2 : 0;

    try {
        await postgres`
            INSERT INTO sessionspec (game_id, user1id, user2id, result) 
            VALUES (${gameId}, ${player1}, ${player2}, ${result});
        `;
        console.log(`Game session saved: GameID=${gameId}, Result=${result}`);
    } catch (error) {
        console.error("Error saving session:", error);
    }
};

// Function to start a new game
const startGame = async (io) => {
    if (waitingQueue.length < 2) return;

    const player1Socket = waitingQueue.shift();
    const player2Socket = waitingQueue.shift();

    const gameId = uuidv4();
    const player1Id = getUserFromSocket(player1Socket);
    const player2Id = getUserFromSocket(player2Socket);

    if (player1Id === -1 || player2Id === -1) {
        console.error("Invalid player IDs, aborting game start.");
        waitingQueue.unshift(player1Socket, player2Socket);
        return;
    }

    const data = await fetchTopicData();
    if (!data.success) {
        console.error("Failed to fetch questions. Aborting game start.");
        waitingQueue.unshift(player1Socket, player2Socket);
        return;
    }

    activeGames[gameId] = {
        player1: { socketId: player1Socket, userId: player1Id, score: 0, submitted: false },
        player2: { socketId: player2Socket, userId: player2Id, score: 0, submitted: false },
        endTime: Date.now() + 135000, // Game timeout (2m 15s)
    };

    io.to(player1Socket).emit("game_start", { gameId, questions: data.questions, topic: data.topic });
    io.to(player2Socket).emit("game_start", { gameId, questions: data.questions, topic: data.topic });

    console.log(`Game started: GameID=${gameId}, Player1=${player1Id}, Player2=${player2Id}`);
};

// Handle player joining queue
const joinQueue = (req, res) => {
    const { socketId } = req.body;
    const io = req.app.get("io");

    if (!socketId || !req.user) {
        return res.status(400).json({ error: "Invalid request" });
    }

    const userId = req.user.id;

    // Check if user is in an active game
    const activeGameId = Object.keys(activeGames).find(
        (gameId) => activeGames[gameId].player1.userId === userId || activeGames[gameId].player2.userId === userId
    );

    if (activeGameId) {
        return res.status(400).json({ error: "A game is already in progress on your account. Please wait for it to finish." });
    }

    // Remove user from queue if already present (prevents duplicate entries)
    const existingSocketIndex = waitingQueue.findIndex((id) => userSocketMap[id] === userId);
    if (existingSocketIndex !== -1) {
        waitingQueue.splice(existingSocketIndex, 1); // Remove old socket ID from queue
    }

    // Update socket mappings
    userSocketMap[socketId] = userId;
    userIdToSocketMap[userId] = socketId;
    
    waitingQueue.push(socketId);

    io.to(socketId).emit("queued", { message: "You're in the queue." });
    startGame(io);

    res.status(201).json({ message: "Added to queue", socketId });
};


// Handle player leaving queue
const leaveQueue = (req, res) => {
    const { socketId } = req.body;
    if (!socketId || !req.user) return res.status(400).json({ error: "Invalid request" });

    const userId = req.user.id;
    const index = waitingQueue.indexOf(socketId);

    if (index !== -1) {
        waitingQueue.splice(index, 1);
        delete userSocketMap[socketId];
        delete userIdToSocketMap[userId];
        return res.json({ message: "Removed from queue", success: true });
    }

    res.json({ message: "Not in queue", success: false });
};

// Handle player disconnection
const handleDisconnect = (socket, io) => {
    const userId = getUserFromSocket(socket.id);
    if (userId === -1) return;

    const gameId = Object.keys(activeGames).find(
        (id) => activeGames[id].player1.userId === userId || activeGames[id].player2.userId === userId
    );

    if (gameId) {
        io.to(socket.id).emit("game_reconnect_message", {
            message: "A game is already in progress on your account. Please wait for it to finish.",
        });
        return;
    }

    // Remove from queue
    const index = waitingQueue.indexOf(socket.id);
    if (index !== -1) {
        waitingQueue.splice(index, 1);
        console.log(`User ${userId} removed from queue due to disconnection.`);
    }

    delete userSocketMap[socket.id];
    delete userIdToSocketMap[userId];
};

// Handle game end
const handleGameEnd = (gameId, io) => {
    if (!activeGames[gameId]) return;

    const { player1, player2 } = activeGames[gameId];

    saveSession(gameId, player1.userId, player2.userId, player1.score, player2.score);

    delete activeGames[gameId];
    console.log(`Game ${gameId} ended and cleaned up.`);
};

// Handle player submitting score
const submitScore = (socket, data, io) => {
    const { gameId, score } = data;
    if (!activeGames[gameId]) return;

    const userId = getUserFromSocket(socket.id);
    if (userId === -1) return;

    const game = activeGames[gameId];

    if (game.player1.userId === userId) {
        game.player1.score = score;
        game.player1.submitted = true;
    } else if (game.player2.userId === userId) {
        game.player2.score = score;
        game.player2.submitted = true;
    } else {
        return;
    }

    console.log(`User ${userId} submitted score for game ${gameId}.`);

    if (game.player1.submitted && game.player2.submitted) {
        handleGameEnd(gameId, io);
    } else {
        setTimeout(() => {
            if (activeGames[gameId]) handleGameEnd(gameId, io);
        }, game.endTime - Date.now());
    }
};

// Setup socket events
const setupGameEvents = (io) => {
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("game_end", (data) => submitScore(socket, data, io));
        socket.on("disconnect", () => handleDisconnect(socket, io));
    });
};

module.exports = { joinQueue, leaveQueue, setupGameEvents };
