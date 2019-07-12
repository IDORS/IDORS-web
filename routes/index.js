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
        const tweet = await tweetsModel.getRandomClassified(1);
        debug('Selected:', tweet);
        res.send(tweet[0]);
    } catch(error) {
        next(error);
    }
});

router.post('/vote', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.isOffensive, req.body.isHateful);

        const {tweetId, isOffensive, isHateful} = req.body;

        /* if (typeof tweetId !== 'string' || typeof isOffensive !== 'boolean' || typeof isHateful !== 'number')
            throw Error('Invalid input'); */

        await tweetsModel.saveVote(tweetId, isHateful, isOffensive);
        debug('Inserted correctly');

        const tweets = await tweetsModel.getRandomNotDone(1);

        res.send(tweets[0]);
    } catch(error) {
        next(error);
    }
});

router.post('/vote/hateType', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.hateType);

        const {tweetId, hateType} = req.body;

        /* if (typeof tweetId !== 'string' || typeof isOffensive !== 'boolean' || typeof isHateful !== 'number')
            throw Error('Invalid input'); */

        await tweetsModel.saveHateTypeVote(tweetId, hateType);
        debug('Inserted correctly');

        const tweets = tweetsModel.getRandomClassified(1);

        res.send(tweets[0]);
    } catch(error) {
        next(error);
    }
});

module.exports = router;
