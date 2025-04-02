const { getTopicById, getQuestionsById } = require("../config/db_fun");

// Generate a topic id and get corresonding data
const fetchTopicData = async (topicId) => {
    try {
        console.log(`Fetching data for Topic ID: ${topicId}`);

        const topic = await getTopicById(topicId) || [];
        const questions = await getQuestionsById(topicId) || [];

        if (topic.length === 0 || questions.length === 0) {
            return {
                success: false,
                message: "Topic or questions not found.",
                topicId,
                topic: topic,
                questions: questions,
            };
        }

        return {
            success: true,
            topicId,
            topic,
            questions,
        };
    } catch (error) {
        console.error("Error fetching data:", error);
        return { success: false, message: "Error fetching topic data.", error };
    }
};

// Express route handler for debugging can be removed
const getTopicData = async (req, res) => {
    const data = await fetchTopicData();
    if (data.success) {
        return res.status(200).json(data);
    }
    return res.status(404).json(data);
};

module.exports = { getTopicData, fetchTopicData };
