const db = require("../db/connection");

exports.getAll = async function(ids) {
    let result;
    if(ids) {
        result = await db.query(`SELECT tweets.id, user, text
                                FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                WHERE tweets.id IN ?
                                LIMIT ?`, [[ids], ids.length]);

        return result[0];
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

exports.getRandomNotDone = async function(limit, session_id, excluded = []) {
    const query = db.format(`SELECT * FROM tweets t LEFT JOIN (SELECT tweet_id, COUNT(*) as c FROM votesIsHateful
    GROUP BY tweet_id
    HAVING COUNT(*) < 5) b ON t.id = b.tweet_id
LEFT JOIN (SELECT * FROM votesIsHateful WHERE session_id = ?) a ON a.tweet_id = t.id
WHERE a.session_id IS NULL AND find_in_set(t.id, ?) = 0
ORDER BY c
LIMIT ?`, [session_id, excluded.join(','), limit]);
    console.log(query);
    const [tweets] = await db.query(`SELECT t.id, t.user, t.text FROM tweets t LEFT JOIN (SELECT tweet_id, COUNT(*) as c FROM votesIsHateful
                                                                        GROUP BY tweet_id
                                                                        HAVING COUNT(*) < 5) b ON t.id = b.tweet_id
                                                            LEFT JOIN (SELECT * FROM votesIsHateful WHERE session_id = ?) a ON a.tweet_id = t.id
                                    WHERE a.session_id IS NULL AND find_in_set(t.id, ?) = 0
                                    ORDER BY c, RAND()
                                    LIMIT ?`, [session_id, excluded.join(','), limit]);
    return tweets;
}

exports.getRandomClassified = async function(limit, session_id) {
    const [tweets] = await db.query(`SELECT tweets.id, tweets.user, tweets.text
                                    FROM tweets LEFT JOIN votesIsHateful ON votesIsHateful.tweet_id = tweets.id
                                                LEFT JOIN voteshatetype h ON tweets.id = h.tweet_id AND h.session_id = votesIsHateful.session_id
                                    WHERE votesIsHateful.is_hateful = 1 AND votesIsHateful.session_id = ? AND h.id IS NULL
                                    ORDER BY RAND()
                                    LIMIT ?`, [session_id, limit]);
    return tweets;
}

exports.skipTweet = async function(tweetId) {
    return await db.query(`UPDATE tweets 
                           SET tweets.skip_count = tweets.skip_count + 1 
                           WHERE tweets.id = ? `, [tweetId]);
}

exports.saveVote = async function(tweetId, isHateful, isOffensive, session_id) {
    return await db.query(`INSERT INTO votesIsHateful (is_hateful, is_offensive, tweet_id, session_id)
                            VALUES (?, ?, ?, ?)`, [isHateful, isOffensive, tweetId, session_id])
}

exports.saveHateTypeVote = async function(tweetId, hateType, other, session_id) {
    return await db.query(`INSERT INTO votesHateType (hate_type, tweet_id, other, session_id)
                            VALUES (?, ?, ?, ?)`, [hateType, tweetId, other, session_id])
}
