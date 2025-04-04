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
        piechartResult: [],
        countMatch: [],
        basicInfo: [],
        dailyStreak: 1,
        longestStreak: 1
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

        profileData.piechartResult = piechartResult || [];
        profileData.countMatch = countMatch || [];
        profileData.basicInfo = basicInfo || [];
        profileData.dailyStreak = dailyStreak || 1;
        profileData.longestStreak = longestStreak || 1;

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
