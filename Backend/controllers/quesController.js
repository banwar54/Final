const { postgres } = require("../config/db");

// Fetch topic name and topic description
const getTopicByTopicId = async (topicId) => {
    try {
        console.log(`Fetching topic for topic ID: ${topicId}`);
        const data = await postgres`
            SELECT * FROM topics
            WHERE id = ${topicId};
        `;

        if (!data || data.length === 0) {
            console.log("No Topic Found for topic ID: ${topicId}");
            return { error: "No Topic Found"};
        }

        return data;

    } catch (error) {
        console.error("Error fetching Topic:", error);
        return { error: "Database error : "+ error };
    }
};

// Fetch question related to topicid
const  getQuestionsByTopicId = async (topicId) => {
    try {
        console.log(`Fetching questions for topic ID: ${topicId}`);
        const data = await postgres`
            SELECT * FROM queoptn
            WHERE topic_id = ${topicId};
        `;

        if (!data || data.length === 0) {
            console.log(`No questions found for topic ID: ${topicId}`);
            return { error: "No questions found" };
        }
        return data;

    } catch (error) {
        console.error("Error fetching questions:", error);
        return { error: `Database error : ${error}` };
    }
};

const getQuesData = async (topicId) => {
    try{
        if (!topicId) {
            throw new Error("Topic ID is required.");
        }

        console.log('Fetching Question Details');

        const topic = await getTopicByTopicId(topicId);
        const questions= await getQuestionsByTopicId(topicId);

        if (topic.error || questions.error) {
            return {
                error: "Failed to fetch some data",
                topic: topic.error ? null : topic,
                questions: questions.error ? null : questions,
                details: { topicError: topic.error, questionError: questions.error }
            };
        }

        return { success: true, topic: topic, questions: questions};

    } catch (error){
        console.error("Error fetching data:", error);
        return { error: "Server error", details: error};
    }
};

module.exports = { getQuesData };
