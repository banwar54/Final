const { postgres } = require("../config/db");

// Fetch all questions related to a topic
const  getQuestionsByTopicId = async (topicId) => {
    try {
        console.log(`Fetching questions for topic ID: ${topicId}`);
        const data = await sql`SELECT * FROM queoptn WHERE topic_id = ${topicId};`;
        if (data.length === 0) {
            console.log("No questions found for this topic");
            return { error: "No questions found" };
        }
        return data;
    } catch (error) {
        console.error("Error fetching questions:", error);
        return { error: "Database error" };
    }
};

const getTopicByTopicId = async (topicId) => {
    try {
        console.log(`Fetching topic for topic ID: ${topicId}`);
        const data = await sql`SELECT * FROM topics WHERE id = ${topicId};`;
        if (data.length === 0) {
            console.log("No Topic Found");
            return { error: "No Topic Found" };
        }
        return data;
    } catch (error) {
        console.error("Error fetching Topics:", error);
        return { error: "Database error" };
    }
};

const getQuesData = async(topicId) => {
    try{
        console.log('Fetching Question Details');
        const topic = await getTopicByTopicId(topicId);
        const questions= await getQuestionsByTopicId(topicId);
        return [topic, questions];
    } catch (error){
        console.log("Error fetching data : ",error);
        return [];
    }
};

export  { getQuesData};
