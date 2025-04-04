const { getTopicById, getQuestionsById } = require("../config/db_fun");
const logger = require("../config/loki");

// Generate a topic ID and get corresponding data
const fetchTopicData = async (topicId) => {
    try {
        const topic = await getTopicById(topicId);
        const questions = await getQuestionsById(topicId);

        if (!topic?.length || !questions?.length) {
            const err = new Error("Topic or questions not found.");
            err.statusCode = 404;
            throw err;
        }

        return {
            topicId,
            topic,
            questions,
        };
    } catch (err) {
        logger.error(`Error in fetchTopicData for topic ID: ${topicId}, Error: ${err.message}`);
        throw err;
    }
};

module.exports = { fetchTopicData };
