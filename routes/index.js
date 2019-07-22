const express = require('express');
const router = express.Router();
const debug = require('debug')('idors:router');

const tweetsModel = require('../models/tweets');

/* GET home page. */
router.get('/tweets/random', async function(req, res, next) {
    if(!req.xhr)    //Not ajax request
        next();
    
    try {
        const excludedWithoutSkipped = req.session.voted || [];
        const excludedFull = req.session.skipped ? excludedWithoutSkipped.concat(req.session.skipped) : excludedWithoutSkipped;
        
        let tweets = await tweetsModel.getRandomNotDone(3, excludedFull);
        if(tweets.length === 0 && req.session.skipped && req.session.skipped.length > 0) {
            const firstThree = req.session.skipped.splice(0,3);
            tweets = await tweetsModel.getAll(firstThree);
        }
        debug('Excluded:', excludedFull);
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
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.post('/vote', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.isOffensive, req.body.isHateful);

        const {tweetId, isOffensive, isHateful, skip} = req.body;

        if (skip === 'true') {
            await tweetsModel.skipTweet(tweetId);
            req.session.skipped = addToOrCreateList(req.session.skipped, tweetId);
            if(req.session.skipped.length > 10)
                req.session.skipped.shift();
        } else if (skip === 'false'){
            await tweetsModel.saveVote(tweetId, isHateful, isOffensive);
            debug('Inserted correctly');
            req.session.voted = addToOrCreateList(req.session.voted, tweetId);
        } else {
            throw new Error('Skip value is invalid.')
        }

        const excludedWithoutSkipped = req.session.voted ? req.body['ignoreTweetIds[]'].concat(req.session.voted): req.body['ignoreTweetIds[]'];        
        const excludedFull = req.session.skipped ? excludedWithoutSkipped.concat(req.session.skipped) : excludedWithoutSkipped;

        let tweets = await tweetsModel.getRandomNotDone(1, excludedFull);
        debug(tweets);
        if(tweets.length === 0 && req.session.skipped && req.session.skipped.length > 0) {
            const first = req.session.skipped.shift();
            tweets = await tweetsModel.getAll([first]);
        }

        const result = tweets.length === 0 ? {} : tweets[0];
        res.send(result);
    } catch(error) {
        next(error);
    }
});

router.post('/vote/hateType', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.hateType);

        const {tweetId, hateType, skip, other} = req.body;

        if (skip === 'false'){
            await tweetsModel.saveHateTypeVote(tweetId, hateType, other);
            debug('Inserted correctly');

            req.session.subclassified = addToOrCreateList(req.session.subclassified, tweetId);
        } else if(skip !== 'true') {
            throw new Error('Skip value is invalid.')
        }

        const tweet = await tweetsModel.getRandomClassified(1, req.session.subclassified || []);

        const result = tweet.length === 0 ? {} : tweet[0];
        debug(tweet);
        res.send(result);
    } catch(error) {
        next(error);
    }
});

function addToOrCreateList(possibleList, tweetId) {
    if(possibleList) {
        if(!possibleList.includes(tweetId))
            possibleList.push(tweetId);
        return possibleList;
    } else {
        return [tweetId];
    }
}

module.exports = router;
