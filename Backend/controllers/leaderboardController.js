const { postgres } = require("../config/db");

// Function to fetch leaderboard data
const get_leaderBoard = async () => {
    try {
        const data1 = await postgres`
            SELECT uh.userid, u.username, uh.points, uh.win, uh.loss, uh.draw 
            FROM "userhistory2" uh
            JOIN "users" u ON uh.userid = u.id
            ORDER BY uh.points DESC, uh.win DESC;
        `;

        const data2=await postgres`
            SELECT uh.userid, u.username, uh.points
            FROM "userhistory1" uh
            JOIN "users" u ON uh.userid = u.id
            ORDER BY uh.points DESC;
        `;
        
        // For debugging Will remove it later
        console.log("Leaderborad1",data1);
        console.log("Leaderborad2",data2);

        return {
            leaderboard1 : data1.length>0?{status:"Success",data:data1}:{staus:"No_Data",data:[]},
            leaderboard2 : data2.length>0?{status:"Success",data:data2}:{staus:"No_Data",data:[]},
        };        
        
    } catch (error) {
        console.log("Error : ", error);
        return { error: "Database error : ",error };
    }
};

module.exports = { get_leaderBoard };
