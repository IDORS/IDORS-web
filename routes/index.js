const express = require('express');
const router = express.Router();
const debug = require('debug')('idors:router');

const tweetsModel = require('../models/tweets');
const votesModel = require('../models/votes');

/* GET home page. */
router.get('/tweets/random', async function(req, res, next) {
    if(!req.xhr)    //Not ajax request
        next();
    
    try {
        let excluded;
        if(req.session.skipped)
            excluded = req.session.skipped;
        else {
            excluded = [];
            req.session.skipped = [];
        }
        
        let tweets = await tweetsModel.getRandomNotDone(3, req.session.id, excluded);
        if(tweets.length === 0 && req.session.skipped && req.session.skipped.length > 0) {
            const firstThree = req.session.skipped.splice(0,3);
            tweets = await tweetsModel.getAll(firstThree);
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
        const tweet = await tweetsModel.getRandomClassified(1, req.session.id);
        debug('Selected:', tweet);
        
        const result = tweet.length === 0 ? {} : tweet[0];
        res.send(result);
    } catch(error) {
        next(error);
    }
});

/* Add an "isHateful" and "isOffensive" vote for a tweet */
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
            await tweetsModel.saveVote(tweetId, isHateful, isOffensive, req.session.id);
            debug('Inserted correctly');
        } else {
            throw new Error('Skip value is invalid.')
        }

        const excluded = req.session.skipped ? req.body['ignoreTweetIds[]'].concat(req.session.skipped) : req.body['ignoreTweetIds[]'];

        let tweets = await tweetsModel.getRandomNotDone(1, req.session.id, excluded);
        debug("con excluded", tweets);
        if(tweets.length === 0 && req.session.skipped && req.session.skipped.length > 0) {
            const first = req.session.skipped.shift();
            tweets = await tweetsModel.getAll([first]);
            debug("first", tweets);
        }

        const result = tweets.length === 0 ? {} : tweets[0];
        res.send(result);
    } catch(error) {
        next(error);
    }
});

/* Add "hateType" vote for a tweet */
router.post('/vote/hateType', async function(req, res, next) {
    try {
        debug(req.body.tweetId, req.body.hateType);

        const {tweetId, hateType, skip, other} = req.body;

        if (skip === 'false'){
            if(hateType === 'notHate') {
                await tweetsModel.correctVote(tweetId, req.session.id);
                debug('Corrected correctly (?');
            }
            else {
                await tweetsModel.saveHateTypeVote(tweetId, hateType, other, req.session.id);
                debug('Inserted correctly');
            }
        } else if(skip !== 'true') {
            throw new Error('Skip value is invalid.')
        }

        const tweet = await tweetsModel.getRandomClassified(1, req.session.id);

        const result = tweet.length === 0 ? {} : tweet[0];
        debug(tweet);
        res.send(result);
    } catch(error) {
        next(error);
    }
});

/* Get total number of votes */
router.get('/votes/totalCount', async function(req, res, next) {
    try {
        const totalCount = await votesModel.getTotalVotes();
        res.send(totalCount);
    } catch(error) {
        next(error);
    }
});


/* Get total number of voted tweets */
router.get('/votes/tweetCount', async function(req, res, next) {
    try {
        const tweetCount = await votesModel.getVotedTweets();
        res.send(tweetCount);
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
