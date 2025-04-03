const { giveFeedback} = require("../config/db_fun");

const save_feedback= async (req, res) => {
  try {
    
    const data = req.body
    if (!data) {
      return res.status(400).json({ message: 'Please enter feedback' });
    }
    
    await giveFeedback(data.fedbck);
    
    res.status(201).json({ message: "Feedback submitted successfully!"});
    
  } catch (error) {
    console.error("Error sending Feedback:", error);
    res.status(500).json({ message: "Error sending Feedback:", error: error.message });
  }
};



module.exports = { save_feedback};
