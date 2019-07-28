CREATE DATABASE IF NOT EXISTS pgodio DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE pgodio;

CREATE TABLE IF NOT EXISTS `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) unsigned NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  PRIMARY KEY (`session_id`)
);

CREATE TABLE IF NOT EXISTS `pgodio`.`tweets` (
  `id` VARCHAR(21) NOT NULL,
  `user` VARCHAR(45) NOT NULL,
  `text` VARCHAR(1120) NOT NULL,
  `skip_count` INT DEFAULT 0,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `pgodio`.`votesIsHateful` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `is_hateful` TINYINT(1) NOT NULL,
  `is_offensive` TINYINT(1) NOT NULL,
  `tweet_id` VARCHAR(21) NOT NULL,
  `session_id`  VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `tweet_id_idx` (`tweet_id` ASC),
  FOREIGN KEY (`tweet_id`) REFERENCES `pgodio`.`tweets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `pgodio`.`sessions` (`session_id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `pgodio`.`votesHateType` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hate_type` ENUM('misoginy', 'other', 'homophobia', 'racism', 'political') NOT NULL,
  `tweet_id` VARCHAR(21) NOT NULL,
  `session_id`  VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `other` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `tweet_id_idx` (`tweet_id` ASC),
  FOREIGN KEY (`tweet_id`) REFERENCES `pgodio`.`tweets` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `pgodio`.`sessions` (`session_id`) ON DELETE CASCADE
);
