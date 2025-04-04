const { giveFeedback } = require("../config/db_fun");
const logger = require("../config/loki");

const save_feedback = async (req, res) => {
  try {
    const { fedbck } = req.body;

    if (!fedbck || fedbck.trim() === "") {
      logger.warn(`User [${req.user.userId}] tried submitting empty feedback.`);
      return res.status(400).json({
        message: "Please enter feedback.",
      });
    }

    await giveFeedback(fedbck.trim());

    logger.info(`Feedback submitted successfully by user: ${req.user.userId}`);
    return res.status(201).json({
      message: "Feedback submitted successfully!",
    });

  } catch (error) {
    logger.error(`Feedback submission failed for user [${req.user.userId}]: ${error.message}`);
    return res.status(500).json({
      message: "Error sending feedback.",
      error: error.message,
    });
  }
};

module.exports = { save_feedback };
