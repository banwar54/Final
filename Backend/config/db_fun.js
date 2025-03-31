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

const getTopic = async (topicId) => {
    return postgres`
        SELECT * FROM topics
        WHERE id = ${topicId};
    `;
}

const getQuestions = async (topicId) => {
    return postgres`
        SELECT * FROM queoptn
        WHERE topic_id = ${topicId};
    `;
}

module.exports = { createUser, findUserByUsername, getTopic, getQuestions };