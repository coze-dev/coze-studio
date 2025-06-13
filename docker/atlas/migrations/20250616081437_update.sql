-- Modify "model_meta" table
ALTER TABLE `opencoze`.`model_meta` ADD COLUMN `icon_url` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URL";
-- Modify "space" table
ALTER TABLE `opencoze`.`space` AUTO_INCREMENT 667;
-- Modify "space_user" table
ALTER TABLE `opencoze`.`space_user` AUTO_INCREMENT 2;
