const { saveChallenge, getChallenge, getChallengebyPlayer } = require("../config/db_fun");
const logger = require("../config/loki");

const save_Challenge = async (req, res) => {
  try {
    const { que, qo1, qo2, qo3, qo4, qans } = req.body;

    if (!que || !qo1 || !qo2 || !qo3 || !qo4 || !qans) {
      logger.warn(`User [${req.user.userId}] tried saving a challenge with incomplete data.`);
      return res.status(400).json({
        message: "Question and all options are required!",
      });
    }

    await saveChallenge(req.user.userId, que, qo1, qo2, qo3, qo4, qans);

    logger.info(`User [${req.user.userId}] created a new challenge: "${que}"`);
    return res.status(201).json({
      message: "Challenge created successfully!",
    });

  } catch (error) {
    logger.error(`Error saving challenge for user [${req.user.userId}]: ${error.message}`);
    return res.status(500).json({
      message: "Error saving challenge",
      error: error.message,
    });
  }
};

const show_challenge = async (req, res) => {
  try {
    const [playerChallenges, allChallenges] = await Promise.all([
      getChallengebyPlayer(req.user.userId),
      getChallenge(),
    ]);

    logger.info(`Challenges fetched successfully for user [${req.user.userId}]`);

    return res.status(200).json({
      message: "Challenges fetched successfully!",
      ChallengebyPlayer: playerChallenges || [],
      Challenge: allChallenges || [],
    });

  } catch (error) {
    logger.error(`Error fetching challenges for user [${req.user.userId}]: ${error.message}`);
    return res.status(500).json({
      message: "Database error occurred.",
      error: error.message,
    });
  }
};

module.exports = { save_Challenge, show_challenge };