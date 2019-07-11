const db = require("../db/connection");

exports.getAll = async function() {
    const [tweets] = await db.query(`SELECT * FROM tweets`);
    return tweets;
}

exports.getRandom = async function(limit) {
    const [tweets] = await db.query(`SELECT * FROM tweets
                                    ORDER BY RAND() 
                                    LIMIT ?`, [limit]);
    return tweets;
}

exports.getRandomNotDone = async function(limit) {
    const [tweets] = await db.query(`SELECT tweets.id, user, text
                                    FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                    GROUP BY tweets.id
                                    HAVING COUNT(votesIsHateful.id) < 5
                                    ORDER BY COUNT(votesIsHateful.id), RAND()
                                    LIMIT ?`, [limit]);
    return tweets;
}

exports.getRandomClassified = async function(limit) {
    const [tweet] = await db.query(`SELECT tweets.id, user, text
                                    FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                    WHERE votesIsHateful.is_hateful = 1
                                    ORDER BY RAND()
                                    LIMIT 1`);
    return tweet;
}

exports.skipTweet = async function(tweetId) {
    return await db.query(`UPDATE tweets 
                           SET tweets.skip_count = tweets.skip_count + 1 
                           WHERE tweets.id = ? `, [tweetId]);
}

exports.saveVote = async function(tweetId, isHateful, isOffensive) {
    return await db.query(`INSERT INTO votesIsHateful (is_hateful, is_offensive, tweet_id)
                            VALUES (?, ?, ?)`, [isHateful, isOffensive, tweetId])
}

