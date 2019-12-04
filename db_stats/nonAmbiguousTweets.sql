use pgodio;

select tweet_id, text from votesIsHateful join tweets on tweets.id = votesIsHateful.tweet_id where tweet_id not in (select tweet_id from votesIsHateful group by tweet_id having sum(is_hateful) > 1 and sum(is_hateful) = count(*) div 2) group by tweet_id, text;