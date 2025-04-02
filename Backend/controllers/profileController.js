const { 
    PiechartResult,
    basicinfo,
    CountMatch,
    dailystreak,
    longeststreak
} = require("../config/profile_fun");

const getProfile = async (req, res) => {
    const userId = req.user.userId;
    let data = {
        PiechartResult_data: [],
        CountMatch_data: [],
        basicinfo_data: [],
        dailystreak_data: 1,
        longeststreak_data: 1
    };

    try {
        // Run all async calls in parallel
        const [
            piechartResult,
            countMatch,
            basicInfo,
            dailyStreak,
            longestStreak
        ] = await Promise.all([
            PiechartResult(userId).catch(error => { throw { source: "PiechartResult", error }; }),
            CountMatch(userId).catch(error => { throw { source: "CountMatch", error }; }),
            basicinfo(userId).catch(error => { throw { source: "basicinfo", error }; }),
            dailystreak(userId).catch(error => { throw { source: "dailystreak", error }; }),
            longeststreak(userId).catch(error => { throw { source: "longeststreak", error }; })
        ]);

        // Assign fetched data
        data.PiechartResult_data = piechartResult;
        data.CountMatch_data = countMatch;
        data.basicinfo_data = basicInfo;
        data.dailystreak_data = dailyStreak;
        data.longeststreak_data = longestStreak;

        console.log(`All profile data successfully fetched for ${userId}`);

        return res.status(200).json(data);
        
    } catch (error) {
        console.error(`Error fetching ${error.source} data for ${userId}:`, error.error);
        return res.status(500).json({
            message: `Error fetching ${error.source} data`,
            error: error.error.message || error.error
        });
    }
};

module.exports = { getProfile };
