const express = require('express');
const router = express.Router();
const debug = require('debug')('idors:router');

const tweetsModel = require('../models/tweets');

/* GET home page. */
router.get('/tweets/random', async function(req, res, next) {
    if(!req.xhr)    //Not ajax request
        next();
    
    try {
        const tweets = await tweetsModel.getRandomNotDone(3);
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

        /* if (typeof tweetId !== 'string' || typeof isOffensive !== 'boolean' || typeof isHateful !== 'number')
            throw Error('Invalid input'); */

        if (skip == 'true') {
            await tweetsModel.skipTweet(tweetId);
        } else if (skip == 'false'){
            await tweetsModel.saveVote(tweetId, isHateful, isOffensive);
            debug('Inserted correctly');
        } else {
            throw Error('Skip value is invalid.')
        } 

        const tweets = await tweetsModel.getRandomNotDone(1);

        res.send(tweets[0]);
    } catch(error) {
        next(error);
    }
});

module.exports = router;
