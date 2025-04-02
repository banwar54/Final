const { v4: uuidv4 } = require("uuid");
const { saveTwoPlayerSession } = require("../config/db_fun");
const { fetchTopicData } = require("./quesController");

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
let gameScores ={}

const findGameBySocketId = (socketId) => {
    const userId = socketIdToUserId[socketId];
    if (userId === -1) return null;

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
    if (player1 === -1 || player2 === -1) return console.error("Invalid player IDs, session not saved.");

    // Determine winner (0 for tie, 1 if player1 wins, 2 if player2 wins)
    let result = 0; // Default to tie
    if (player1Score > player2Score) {
        result = 1; // Player 1 wins
    } else if (player2Score > player1Score) {
        result = 2; // Player 2 wins
    }

    try {
        await saveTwoPlayerSession(gameId, player1, player2, result);
        console.log(`Game session saved: GameID=${gameId}, Result=${result}`);
    } catch (error) {
        console.error("Error saving session:", error);
    }
};

// Socket event handler for game_end (receiving scores)
const setupGameEndHandler = (socket) => {
    socket.on("game_end", (data) => {
        try {
            const userId = socketIdToUserId[socket.id];
            if (userId === -1) {
                console.error(`User not found for socket ${socket.id}`);
                return;
            }
            
            const { gameId, score } = data;
            
            if (!gameScores[gameId]) {
                console.error(`Game ${gameId} not found in active games`);
                return;
            }
            
            // Determine if this is player 1 or player 2
            if (gameScores[gameId].player1.userId === userId) {
                gameScores[gameId].player1.score = score;
                gameScores[gameId].player1.submitted = true;
                console.log(`Player 1 (${userId}) submitted score: ${score}`);
            } else if (gameScores[gameId].player2.userId === userId) {
                gameScores[gameId].player2.score = score;
                gameScores[gameId].player2.submitted = true;
                console.log(`Player 2 (${userId}) submitted score: ${score}`);
            } else {
                console.error(`User ${userId} not part of game ${gameId}`);
                return;
            }
            
            // Check if both players have submitted OR if the game has timed out
            const currentTime = Date.now();
            const bothSubmitted = gameScores[gameId].player1.submitted && gameScores[gameId].player2.submitted;
            const isGameExpired = currentTime >= gameScores[gameId].endTime;
            
            if (bothSubmitted || isGameExpired) {
                finishGame(gameId);
            }
        } catch (error) {
            console.error("Error in game_end handler:", error);
        }
    });
    
    socket.on("disconnect", () => {
        try {
            console.log(`Received disconnect req from socket : ${socket.id}`)
            if (!socketIdToUserId.hasOwnProperty(socket.id)){
                console.log("Socket was already removed by game mechanism")
                return;
            }
            userId=socketIdToUserId[socket.id]
            console.log(`User ${userId} disconnected, cleaning up...`);
            
            // Check if user was in an active game
            const gameId = findGameBySocketId(socket.id);
            if (gameId) {
                console.log(`User ${userId} was in active game ${gameId}, skipping`);
            }
            
            // Remove from queue if present
            const index = waitingQueue.indexOf(socket.id);
            if (index !== -1) {
                waitingQueue.splice(index, 1);
                console.log(`Removed disconnected user ${userId} from waiting queue`);
            }
            
            // Clean up mappings
            console.log("Cleaned up respectibe mappings")
            delete UserIdToSocketId[userId];
            delete socketIdToUserId[socket.id];
        } catch (error) {
            console.error("Error handling socket disconnect:", error);
        }
    });
};

// Function to finish game and save results
const finishGame = (gameId) => {
    if (!gameScores[gameId]) {
        console.error(`Game ${gameId} not found for finishing`);
        return;
    }
    
    const { player1, player2 } = gameScores[gameId];
    
    console.log(`Game ${gameId} finished with scores: Player1=${player1.score}, Player2=${player2.score}`);
    
    // Save results to database
    saveSession(gameId, player1.userId, player2.userId, player1.score, player2.score);
    
    // Clean up game data
    delete gameScores[gameId];

    // Reset game state
    activePlayers = [];
    gameInProgress = false;
    blockNewGame = true;
    
    // Block new game for 3s
    setTimeout(() => {
        blockNewGame = false;
        console.log("Game queue open for new players.");
        startGame();
    }, 3000);
};

// Function to start a new game
const startGame = async() => {
    try {
        if (waitingQueue.length < 2 || gameInProgress || blockNewGame) {
            return;
        }
        
        // Set game in progress to prevent race conditions
        gameInProgress = true;
        activePlayers = [waitingQueue.shift(), waitingQueue.shift()];

        const gameId = uuidv4(); // Generate unique game ID
        const topicId = Math.floor(Math.random() * 5) + 1; // Random topic ID (1-5)

        // Get questions for this game
        const data = await fetchTopicData(topicId.toString());

        if (!data.success) {
            console.error("Failed to fetch topic details, aborting game start");
            gameInProgress = false;
            // Return players to queue
            waitingQueue.unshift(activePlayers[1]);
            waitingQueue.unshift(activePlayers[0]);
            activePlayers = [];
            return;
        }

        players=[socketIdToUserId[activePlayers[0]],socketIdToUserId[activePlayers[1]]]
        console.log(`Game started: GameID=${gameId}, Players=[${players[0]}, ${players[1]}]`);
        
        // Initialize game scores
        gameScores[gameId] = {
            player1: { userId: players[0], score: 0, submitted: false },
            player2: { userId: players[1], score: 0, submitted: false },
            endTime: Date.now() + 135000, // 2m 15s from now (135 seconds)
            gameId: gameId
        };

        // console.log(gameScores);

        activePlayers.forEach(socketId => {
            io.to(socketId).emit("game_start", { 
                gameId: gameId,
                message: "Game started!", 
                questions: data.questions,
                topic: data.topic
            });
            console.log(`Game started for player ${socketIdToUserId[socketId]}`);
        });
    } catch (error) {
        console.error("Error in startGame:", error);
        gameInProgress = false;
        
        // Return players to queue
        if (activePlayers.length === 2) {
            waitingQueue.unshift(activePlayers[1]);
            waitingQueue.unshift(activePlayers[0]);
            activePlayers = [];
        }
    }
};


const joinQueue = async (req, res) => {
    try {
        const socketId = req.query.socketId ;
        const userId = req.user.userId;

        if (!socketId) {
            res.status(400).json({ error: "Missing socket ID" });
            return;
        }
    
        // Check if user is already in queue or active game
        if (UserIdToSocketId[userId]) {
            prev_socket_id = UserIdToSocketId[userId];
            if(waitingQueue.includes(prev_socket_id)) {
                const index = waitingQueue.indexOf(prev_socket_id);
                console.log(`Removing user ${req.user.userId} with old socketID=${prev_socket_id} from waiting queue`);
                // Clean up old socket mapping
                waitingQueue.splice(index, 1);
                delete socketIdToUserId[prev_socket_id];
                delete UserIdToSocketId[userId];
                console.log(`Removed user ${req.user.userId} with old socketID=${prev_socket_id} from waiting queue`);

            }
            else if (activePlayers.includes(prev_socket_id)) {
                // user is in active game
                res.status(400).json({ 
                    error: "Already in a match", 
                    message: "You are already in an active match from another window/device."
                });
            }
        }      

        // Map socketId to userId and vice versa
        socketIdToUserId[socketId] = userId;
        UserIdToSocketId[userId] = socketId;
        
        // Add to waiting queue with new socket ID
        waitingQueue.push(socketId);
        console.log(`User ${req.user.username} joined queue. SocketID=${socketId}`);
        console.log("Waiting Queue",waitingQueue);

        io.to(socketId).emit("queued", { message: "You're in the queue. Please wait for another player." });

        startGame();
        res.json({ message: "Added to queue", socketId });

    } catch (error) {
        console.error("Error in joinQueue:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const leaveQueue = async (req, res) => {
    try {
        const socketId = req.query.socketId ;

        if (!socketId) {
            res.status(400).json({ error: "Missing socket ID" });
            return;
        }

        if (!req.user) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }

        const userId = req.user.id;
        
        // Check if user is in waiting queue (not in active game)
        const index = waitingQueue.indexOf(socketId);
        if (index !== -1) {
            // Remove from waiting queue
            waitingQueue.splice(index, 1);
            console.log(`User ${req.user.username} left queue. SocketID=${socketId}`);
            
            // Remove mappings
            delete socketIdToUserId[socketId];
            delete UserIdToSocketId[userId];
            
            res.json({ message: "Removed from queue", success: true });
        } else if (activePlayers.includes(socketId)) {
            // User is in active game, can't leave
            res.json({ 
                message: "Cannot leave active game", 
                inActiveGame: true,
                success: false 
            });
        } else {
            // User not found in queue
            res.json({ 
                message: "Not found in queue", 
                success: true 
            });
        }
    } catch (error) {
        console.error("Error in leaveQueue:", error);
        res.status(500).json({ error: "Server error" });
    }
};

module.exports ={ setSocketIo, setupGameEndHandler, joinQueue, leaveQueue };