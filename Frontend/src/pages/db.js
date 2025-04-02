const PiechartResult = async (userid) => {
    await postgres`
        Select * from resultsummary where userid = ${userid}
    `;
}



const CountMatch = async (userid) => {
    await postgres`
        Select * from matchcount where userid = ${userid}
    `;
}


const basicinfo = async (userid) => {
    await postgres`
        Select * from basicprofile where userid = ${userid}
    `;
}

const dailystreak = async (userid) => {
    await postgres`
        Select * from dailystreak where userid = ${userid}
    `;
}

const longeststreak = async (userid) => {
    await postgres`
        Select * from longeststreak where userid = ${userid}
    `;
}