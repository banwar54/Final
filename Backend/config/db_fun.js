const { postgres } = require("./db");

// Function to create a user
const createUser = async (username, email, hashedPassword) => {
    return postgres`
        INSERT INTO users(username, email, password)
        VALUES (${username}, ${email}, ${hashedPassword})
        RETURNING id, username, email;
    `;
};

// Function to find user by email
const findUserByUsername = async (username) => {
    return postgres`
        SELECT * FROM users
        WHERE username = ${username};
    `;
};

// Function to get Topic
const getTopicById = async (topicId) => {
    return postgres`
        SELECT * FROM topics
        WHERE id = ${topicId};
    `;
}

// Function to get Question
const getQuestionsById = async (topicId) => {
    return postgres`
        SELECT * FROM queoptn
        WHERE topic_id = ${topicId};
    `;
}

// get single Player Leaderboard
const getSinglePlayerLeaderboard =async() =>{
    return postgres`
        SELECT uh.userid, u.username, uh.points
        FROM "userhistory1" uh
        JOIN "users" u ON uh.userid = u.id
        ORDER BY uh.points DESC;
    `;
}

// get Two Player Leaderboard
const getTwoPlayerLeaderboard =async() =>{
    return postgres`
        SELECT uh.userid, u.username, uh.points, uh.win, uh.loss, uh.draw 
        FROM "userhistory2" uh
        JOIN "users" u ON uh.userid = u.id
        ORDER BY uh.points DESC, uh.win DESC;
    `;
}

// Save Single Player Data
const saveSinglePlayerSession=async (gameId, player1, result) =>{
    postgres`
            INSERT INTO sessionspec1 (game_id, user1id, result) 
            VALUES (${gameId}, ${player1}, ${result});
        `;
}

// Save Two Player Data
const saveTwoPlayerSession=async (gameId, player1, player2, result) =>{
    postgres`
    INSERT INTO sessionspec2 (game_id, user1id, user2id, result) 
            VALUES (${gameId}, ${player1}, ${player2}, ${result});
        `;
}

//saving new qestions 

const saveChallenge = async (userid,que,qo1,qo2,qo3,qo4,qans) =>{
    await postgres`INSERT INTO createchallenge (que, qo1,qo2,qo3,qo4,qans,userid) 
    VALUES (${que}, ${qo1}, ${qo2}, ${qo3} , ${qo4} , ${qans} , ${userid});`;
}

const  getChallenge = async ()=>{
    return postgres`
        SELECT * FROM createchallenge ORDER BY created_at;
    `;
}

const  getChallengebyPalyer = async (userid)=>{
    return await postgres`
        SELECT * FROM createchallenge WHERE userid=${userid};
    `;
}

module.exports = { 
    createUser,
    findUserByUsername,
    getTopicById,
    getQuestionsById,
    getSinglePlayerLeaderboard,
    getTwoPlayerLeaderboard,
    saveSinglePlayerSession,
    saveTwoPlayerSession,
    saveChallenge,
    getChallenge,
    getChallengebyPalyer
 };