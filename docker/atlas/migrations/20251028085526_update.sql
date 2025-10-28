-- Modify "conversation" table
ALTER TABLE `opencoze`.`conversation` ADD COLUMN `user_id` varchar(255) NOT NULL DEFAULT "" COMMENT "user id with runtime";
