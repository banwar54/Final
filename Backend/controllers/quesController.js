const { getTopicById, getQuestionsById } = require("../config/db_fun")

const getTopicData = async (req,res) => {
    try{
        const topicId = (Math.floor(Math.random() * 5) + 1).toString(); //Generate Random topic id

        console.log(`Fetching data for Topic ID: ${topicId}`);

        const topic = await getTopicById(topicId);
        const questions= await getQuestionsById(topicId);

        if (!topic || topic.length === 0) {
            return res.status(404).json({
                message: "No topic found for the given ID.",
                topic: null,
                questions: questions.length > 0 ? questions : null,
            });
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({
                message: "No questions found for the given topic.",
                topic: topic.length > 0 ? topic : null,
                questions: null,
            });
        }

        return res.status(200).json({
            message: "Topic and questions fetched successfully.",
            topicId: topicId,
            topic: topic,
            questions: questions,
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).json({
            message: "Server error occurred while fetching data.",
            error: error.message,
        });
    }
};

module.exports = { getTopicData };