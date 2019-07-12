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
        if(tweets.length === 0) {
            req.session.skippedTweets = []
            tweets = await tweetsModel.getRandomNotDone(3, req.session.votedTweets);
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
        const tweet = await tweetsModel.getRandomClassified();
        debug('Selected:', tweet);
        res.send(tweet);
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

        const tweets = await tweetsModel.getRandomNotDone(1);

        res.send(tweets[0]);
    } catch(error) {
        next(error);
    }
});

module.exports = router;
