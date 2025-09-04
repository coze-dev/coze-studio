-- Modify "conversation" table
ALTER TABLE `opencoze`.`conversation` ADD COLUMN `name` varchar(255) NOT NULL DEFAULT "" COMMENT "conversation name" AFTER `id`;
