const logger = require("../config/loki");
const { 
    PiechartResult,
    basicinfo,
    CountMatch,
    dailystreak,
    longeststreak
} = require("../config/profile_fun");

const getProfile = async (req, res) => {
    const userId = req.user.userId;

    const profileData = {
        PiechartResult_data: [],
        CountMatch_data: [],
        basicinfo_data: [],
        dailystreak_data: 1,
        longeststreak_data: 1
    };

    try {
        const [
            piechartResult,
            countMatch,
            basicInfo,
            dailyStreak,
            longestStreak
        ] = await Promise.all([
            PiechartResult(userId).catch(error => { throw { source: "PiechartResult", error }; }),
            CountMatch(userId).catch(error => { throw { source: "CountMatch", error }; }),
            basicinfo(userId).catch(error => { throw { source: "basicInfo", error }; }),
            dailystreak(userId).catch(error => { throw { source: "dailyStreak", error }; }),
            longeststreak(userId).catch(error => { throw { source: "longestStreak", error }; })
        ]);

        profileData.PiechartResult_data = piechartResult || [];
        profileData.CountMatch_data = countMatch || [];
        profileData.basicinfo_data = basicInfo || [];
        profileData.dailystreak_data = dailyStreak || 1;
        profileData.longeststreak_data = longestStreak || 1;

        logger.info(`Profile data fetched for user: ${userId}`);
        console.log(`All profile data successfully fetched for user: ${userId}`);

        return res.status(200).json(profileData);
        
    } catch (err) {
        const source = err?.source || "Unknown";
        const errorMessage = err?.error?.message || "Unexpected error";

        logger.error(`Error fetching ${source} for user ${userId}: ${errorMessage}`);
        console.error(`Error fetching ${source} for user ${userId}: ${errorMessage}`);

        return res.status(500).json({
            message: `Error fetching ${source} data`,
            error: errorMessage
        });
    }
};

module.exports = { getProfile };
