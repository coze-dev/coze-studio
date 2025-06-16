-- Modify "message" table
ALTER TABLE `opencoze`.`message` MODIFY COLUMN `user_id` varchar(60) NOT NULL DEFAULT "" COMMENT "user id";
