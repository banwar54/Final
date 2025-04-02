const { postgres } = require("./db");

const PiechartResult = async (userid) => {
    return await postgres`
        Select * from resultsummary where userid = ${userid}
    `;
}

const CountMatch = async (userid) => {
    return await postgres`
        Select * from matchcount where userid = ${userid}
    `;
}

const basicinfo = async (userid) => {
    return await postgres`
        Select * from basicprofile where userid = ${userid}
    `;
}

const dailystreak = async (userid) => {
    return await postgres`
        Select * from dailystreak where userid = ${userid}
    `;
}

const longeststreak = async (userid) => {
    return await postgres`
        Select * from longeststreak where userid = ${userid}
    `;
}

module.exports = {
    PiechartResult,
    CountMatch,
    basicinfo,
    dailystreak,
    longeststreak,
}