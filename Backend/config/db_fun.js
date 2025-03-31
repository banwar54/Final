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

module.exports = { createUser, findUserByUsername, getTopicById, getQuestionsById, getSinglePlayerLeaderboard, getTwoPlayerLeaderboard };