const fs = require('fs');

const readFileAndGetJSON = (file) => {
  const text = fs.readFileSync(file, { encoding: 'utf-8' });
  const tweets = [];
  text.split('\n').forEach((line) => {
    if (line.length == 0) return;
    const json = JSON.parse(line);
    tweets.push(json);
  });

  return tweets;
};

const getTweets = () => {
  const tweets = [];
  const folders = fs.readdirSync('tweets');

  folders.forEach((folder) => {
    const tweetFiles = fs.readdirSync('tweets/' + folder + '/');

    tweetFiles.forEach((fileName) => {
      tweets.push(readFileAndGetJSON('tweets/' + folder + '/' + fileName));
    });
  });

  return tweets;
}

const createRecord = (knex, data) => {
  return knex('tweets')
          .insert({
            id   : data.id,
            user : data.user,
            text : data.text,
          })
          .whereNotExists(
            knex('tweets')
              .select('*')
              .where('id', data.id));
};

exports.seed = function(knex) {
  return knex('tweets')
          .del()
          .then(() => {
            const tweets = getTweets();
            return tweets;
          })
          .then((unmergedTweets) => [].concat.apply([], unmergedTweets))
          .then((allTweets) => {
            const tweetPromises = [];

            allTweets.forEach((tweet) => {
              const {id, user, text} = tweet;
              tweetPromises.push(createRecord(knex, {id, user, text}));
            })

            return Promise.all(tweetPromises);
          });
};
