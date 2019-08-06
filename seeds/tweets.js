const fs = require('fs');
const tweetsPerType = 12500;

const readFileAndGetJSON = function(file) {
  const text = fs.readFileSync(file, { encoding: 'utf-8' });
  var tweets = [];
  text.split('\n').forEach((line) => {
    if (line.length == 0) return;
    const tweet = JSON.parse(line);
    const {id, user, text} = tweet;
    tweets.push({id, user, text});
  });

  return tweets;
};

const createRecords = async function (knex, data) {
  return await knex.raw(
                knex('tweets')
                  .insert(data)
                  .toString()
                  .replace('insert', 'INSERT IGNORE'))
              .catch((error) => {
                if (error.code == 'ER_LOCK_DEADLOCK') return createRecords(knex, data);
                else console.log(error.code);
              });
};

exports.seed = async function(knex) {
  return knex('tweets')
          .then(() => {
            const folders = fs.readdirSync('tweets');
            const insertionPromises = [];
            const includedTweets = new Set([]);

            folders.forEach((folder) => {
              const tweetsInFolder = []; //Tweets from the folder that will be inserted
              const tweetsInEachFile = []; //Tweets in each file of the folder
              var totalInFolder = 0; //Total number of tweets in this folder
              const tweetFiles = fs.readdirSync('tweets/' + folder + '/');

              tweetFiles.forEach((fileName) => {
                const tweetsInFile = readFileAndGetJSON('tweets/' + folder + '/' + fileName);
                tweetsInEachFile.push(tweetsInFile);
                totalInFolder += tweetsInFile.length;
              });

              tweetsInEachFile.forEach((tweets) => {
                const neededLength = tweetsPerType * ( tweets.length/totalInFolder );
                var actualLength = 0;

                while (actualLength < neededLength && tweets.length != 0) {
                  var removedIndex = Math.floor( Math.random()*tweets.length );
                  const tweet = tweets.splice(removedIndex, 1)[0];
                  if (!includedTweets.has(tweet.id)) {
                    includedTweets.add(tweet.id);
                    tweetsInFolder.push(tweet);
                    actualLength++;
                  }
                }
              });
              insertionPromises.push(createRecords(knex, tweetsInFolder));
            });

            return Promise.all(insertionPromises);
          });
};
