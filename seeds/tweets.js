let fs = require('fs');

let readFileAndGetJSON = (file) => {
  let text = fs.readFileSync(file, { encoding: 'utf-8' });
  let tweets = [];
  text.split('\n').forEach((line) => {
    if (line.length == 0) return;
    let json = JSON.parse(line);
    tweets.push(json);
  });

  return tweets;
};

let getTweets = () => {
  let tweets = [];
  let folders = fs.readdirSync('tweets');

  folders.forEach((folder) => {
    let tweetFiles = fs.readdirSync('tweets/' + folder + '/');

    tweetFiles.forEach((fileName) => {
      tweets.push(readFileAndGetJSON('tweets/' + folder + '/' + fileName));
    });
  });

  return tweets;
}

let createRecord = (knex, data) => {
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
            let tweets = getTweets();
            return tweets;
          })
          .then((unmergedTweets) => [].concat.apply([], unmergedTweets))
          .then((allTweets) => {
            let tweetPromises = [];

            let ids = new Set();

            allTweets.forEach((tweet) => {
              let {id, user, text} = tweet;
              tweetPromises.push(createRecord(knex, {id, user, text}));
            })

            return Promise.all(tweetPromises);
          });
};
