import { readRecords, writeRecords } from './fileManager.js';

async function exclude_filter(filterStr, data) {
    let excludedData = {};
    for (const key in data) {
        if (data[key] !== null && typeof data[key] === 'object' && !Array.isArray(data[key])) {
            excludedData[key] = await exclude_filter(filterStr, data[key]);
        } else {
            excludedData[key] = data[key];
        }
    }
    return excludedData;
}

async function format_body(type) {
    const titleSuffixOptions = {
        '86400': 'Daily',
        '604800': 'Weekly',
        '2592000': 'Monthly'
    };
    const descriptionIntroOptions = {
        '86400': 'Daily Leaderboard is here! 🏆\nHere are the results:\n\u200E',
        '604800': 'Weekly Leaderboard is here! 🏆\nHere are the results:\n\u200E',
        '2592000': 'Monthly Leaderboard is here! 🏆\nHere are the results:\n\u200E'
    };

    const titleSuffix = titleSuffixOptions[type] || 'Daily';
    const descriptionIntro = descriptionIntroOptions[type] || 'Daily Leaderboard is here! 🏆\nHere are the results:\n\u200E';
    const nextUpdateTime = new Date();
    nextUpdateTime.setDate(nextUpdateTime.getDate() + (type === 86400 ? 1 : type === 604800 ? 7 : 30));

    return { titleSuffix, descriptionIntro, nextUpdateTime };
}

async function filter_leaderboard(client, type) {
    const leaderboard = await client.getLeaderboard(type);
    if (!leaderboard) {
        console.error(`Error fetching leaderboard for type: ${type}`);
        return null;
    }

    const maptostring = {
        '86400': 'day',
        '604800': 'week',
        '2592000': 'month'
    };

    let filteredLeaderboard = await exclude_filter('ironman', leaderboard);
    let sortedLeaderboard = Object.values(filteredLeaderboard).sort((a, b) => a.overall_rank - b.overall_rank);
    let records = await readRecords();

    let topThree = sortedLeaderboard.slice(0, 3).map(async (item, index) => {
        let newRecord = false;
        const recordKey = maptostring[type];
        let record = records[recordKey];
        if (!record) {
            console.error(`Error fetching record for type: ${type}`);
            return item;
        }
    
        if (item.overall_diff > record.XP) {
            newRecord = true;
            record.username = item.username;
            record.XP = item.overall_diff;
            await writeRecords(records).catch(err => console.error(`Error writing records: ${err}`));
        }
    
        item.newRecord = newRecord;
        return item;
    })
    
    topThree = await Promise.all(topThree);

    return topThree;
}

export { format_body, filter_leaderboard };
