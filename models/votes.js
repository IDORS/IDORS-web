const db = require("../db/connection");

exports.getTotalVotes = async function() {
    [result] = await db.query(`SELECT COUNT(*) as totalVotes FROM votesIsHateful`);
    return result[0];
}


exports.getVotedTweets = async function() {
    [result] = await db.query(`SELECT COUNT(DISTINCT tweet_id) as votedTweets FROM votesIsHateful`);
    return result[0];
}