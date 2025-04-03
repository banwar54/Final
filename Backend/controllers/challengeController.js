const { saveChallenge , getChallenge , getChallengebyPalyer} = require("../config/db_fun");

const save_Challenge = async (req, res) => {
  try {
    
    const data = req.body
    if (!data) {
      return res.status(400).json({ message: 'Question and all options are required!' });
    }
    
    await saveChallenge(req.user.userId,data.que, data.qo1, data.qo2, data.qo3, data.qo4, data.qans);
    
    res.status(201).json({ message: "Challenge created successfully!"});
    
  } catch (error) {
    console.error("Error saving challenge:", error);
    res.status(500).json({ message: "Error saving challenge", error: error.message });
  }
};

const show_challenge = async (req, res) => {
  try {
      const data1 = await getChallengebyPalyer(req.user.userId);
      const data2 = await getChallenge();
      
      // console.log(data1);
      // console.log(data2);

      return res.status(200).json({
          message: "Challenges fetched successfully!",
          ChallengebyPlayer: data1.length > 0 ? data1 : [],
          Challenge: data2.length > 0 ? data2 : [],
      });

  } catch (error) {
      console.error("Database Error:", error);
      return res.status(500).json({
          message: "Database error occurred.",
          error: error.message,
      });
  }
};

module.exports = { save_Challenge, show_challenge };