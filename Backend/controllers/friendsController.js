const { findUsers } = require("../config/db_fun");

const add_friend = async (req,res) => {
    try {
        const data = await findUsers();
        if (data) {
            return res.status(200).json(data);
        }
    } 
        catch (error) {
        console.error("Error finding users:", error);
        res.status(500).json({ message: "Error fetching users", error: error.message });
        }
  };


module.exports = {add_friend}