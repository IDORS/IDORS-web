use pgodio;

select tweet_id, sum(is_hateful), count(*), text from votesIsHateful join tweets on tweets.id = votesIsHateful.tweet_id group by tweet_id, text having sum(is_hateful) > 1 && sum(is_hateful) = count(*) div 2;