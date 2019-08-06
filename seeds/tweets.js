const fs = require('fs');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const readFileAndInsert = async function(file, knex) {
  const text = fs.readFileSync(file, { encoding: 'utf-8' });
  const tweetPromises = [];
  var count = 0;
  text.split('\n').forEach((line) => {
    if (line.length == 0) { 
      console.log(file, 'aca', count); 
      return;
    }
    count++;
    const tweet = JSON.parse(line);
    const {id, user, text} = tweet;
    tweetPromises.push(createRecord(knex, {id, user, text}));
    tweetPromises.push(sleep(2000));
  });
  
  return Promise.all(tweetPromises)
};

const createRecord = async function (knex, data) {
  return await knex('tweets')
          .insert({
            id   : data.id,
            user : data.user,
            text : data.text,
          })
          .catch((error) => {
            if (error.code != 'ER_DUP_ENTRY') {
              return createRecord(knex, data);
            } else {
              console.log(data.id, erroc.code);
            }
          })
};

exports.seed = function(knex) {
  return knex('tweets')
          .then(() => {
            const folders = fs.readdirSync('tweets');
            const insertedTweets = [];

            folders.forEach((folder) => {
              const tweetFiles = fs.readdirSync('tweets/' + folder + '/');

              tweetFiles.forEach((fileName) => {
                insertedTweets.push(readFileAndInsert('tweets/' + folder + '/' + fileName, knex));
              });
            });
            
            return Promise.all(insertedTweets)
          });
};
