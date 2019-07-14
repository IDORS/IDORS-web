const db = require("../db/connection");

exports.getAll = async function(ids) {
    let result;
    if(ids) {
        result = await db.query(`SELECT tweets.id, user, text
                                FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                WHERE tweets.id IN ?
                                LIMIT ?`, [[ids], ids.length]);
    }
    
    result = await db.query(`SELECT * FROM tweets`);
    return result[0];
}

exports.getRandom = async function(limit) {
    const [tweets] = await db.query(`SELECT * FROM tweets
                                    ORDER BY RAND() 
                                    LIMIT ?`, [limit]);
    return tweets;
}

exports.getRandomNotDone = async function(limit, tweetsSeen) {
    const [tweets] = await db.query(`SELECT tweets.id, user, text
                                FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                WHERE FIND_IN_SET(tweets.id, ?) = 0
                                GROUP BY tweets.id
                                HAVING COUNT(votesIsHateful.id) < 5
                                ORDER BY COUNT(votesIsHateful.id), RAND()
                                LIMIT ?`, [tweetsSeen.join(","), limit]);
    return tweets;
}

exports.getRandomClassified = async function(limit, tweetsSubclassified) {
    const [tweets] = await db.query(`SELECT tweets.id, user, text
                                    FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                    WHERE votesIsHateful.is_hateful = 1 AND FIND_IN_SET(tweets.id, ?) = 0
                                    ORDER BY RAND()
                                    LIMIT ?`, [tweetsSubclassified.join(","), limit]);
    return tweets;
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

exports.saveHateTypeVote = async function(tweetId, hateType) {
    return await db.query(`INSERT INTO votesHateType (hate_type, tweet_id)
                            VALUES (?, ?)`, [hateType, tweetId])
}
