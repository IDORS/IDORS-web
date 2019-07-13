const express = require('express');
const router = express.Router();
const debug = require('debug')('idors:router');

const tweetsModel = require('../models/tweets');

/* GET home page. */
router.get('/tweets/random', async function(req, res, next) {
    if(!req.xhr)    //Not ajax request
        next();
    
    try {
        let excluded = [];
        if(req.session.votedTweets)
            excluded = excluded.concat(req.session.votedTweets);
        if(req.session.skippedTweets)
            excluded = excluded.concat(req.session.skippedTweets);
        
        let tweets = await tweetsModel.getRandomNotDone(3, excluded);
        if(tweets.length === 0 && req.session.skippedTweets && req.session.skippedTweets.length > 0) {
            debug("Reseted skips");
            req.session.skippedTweets = []
            tweets = await tweetsModel.getRandomNotDone(3, req.session.votedTweets || []);
        }
        debug('Excluded:', excluded);
        debug('Selected:', tweets);
        
        res.send(tweets);
    } catch(error) {
        next(error);
    }
});

/* GET an already classified tweet. */
router.get('/tweets/classified/random', async function(req, res, next) {
    if(!req.xhr)    //Not ajax request
        next();
    
    try {
        const tweet = await tweetsModel.getRandomClassified(1, req.session.subclassified || []);
        debug('Selected:', tweet);
        
        const result = tweet.length === 0 ? {} : tweet[0];
        debug(result);
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.post('/vote', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.isOffensive, req.body.isHateful);

        const {tweetId, isOffensive, isHateful, skip} = req.body;

        let votedOrSkipped;
        if (skip === 'true') {
            await tweetsModel.skipTweet(tweetId);
            votedOrSkipped = 'skippedTweets';
        } else if (skip === 'false'){
            await tweetsModel.saveVote(tweetId, isHateful, isOffensive);
            debug('Inserted correctly');
            votedOrSkipped = 'votedTweets';
        } else {
            throw new Error('Skip value is invalid.')
        }
    
        if(req.session[votedOrSkipped]) {
            const votedOrSkippedSet = new Set(req.session[votedOrSkipped]);
            votedOrSkippedSet.add(tweetId);
            req.session[votedOrSkipped] = [...votedOrSkippedSet]
        } else {
            req.session[votedOrSkipped] = [tweetId];
        }

        let excluded = req.body['ignoreTweetIds[]'];
        if(req.session.votedTweets)
            excluded = excluded.concat(req.session.votedTweets);
        if(req.session.skippedTweets)
            excluded = excluded.concat(req.session.skippedTweets);

        let tweets = await tweetsModel.getRandomNotDone(1, excluded);
        if(tweets.length === 0 && req.session.skippedTweets && req.session.skippedTweets.length > 0) {
            debug("Reseted skips");
            req.session.skippedTweets = []
            excluded = req.body['ignoreTweetIds[]'];
            if(req.session.votedTweets)
                excluded.concat(req.session.votedTweets)
            tweets = await tweetsModel.getRandomNotDone(1, excluded);
        }
        debug(tweets);
        debug("ignoreTweetIds : ", req.body['ignoreTweetIds[]']);
        debug("votedTweets: ", req.session.votedTweets);
        debug("skippedTweets: ", req.session.skippedTweets);

        const result = tweets.length === 0 ? {} : tweets[0];
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.post('/vote/hateType', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.hateType);

        const {tweetId, hateType} = req.body;

        await tweetsModel.saveHateTypeVote(tweetId, hateType);
        debug('Inserted correctly');

        if(req.session.subclassified) {
            const subclassifiedSet = new Set(req.session.subclassified);
            subclassifiedSet.add(tweetId);
            req.session.subclassified = [...subclassifiedSet]
        } else {
            req.session.subclassified = [tweetId];
        }

        const tweets = tweetsModel.getRandomClassified(1);

        res.send(tweets[0]);
    } catch(error) {
        next(error);
    }
});

module.exports = router;
