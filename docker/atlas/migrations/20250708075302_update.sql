-- Modify "api_key" table
ALTER TABLE `opencoze`.`api_key` CHANGE COLUMN `key` `api_key` varchar(255) NOT NULL DEFAULT "";
-- Modify "app_draft" table
ALTER TABLE `opencoze`.`app_draft` CHANGE COLUMN `desc` `description` text NULL;
-- Modify "app_release_record" table
ALTER TABLE `opencoze`.`app_release_record` CHANGE COLUMN `desc` `description` text NULL;
-- Modify "single_agent_draft" table
ALTER TABLE `opencoze`.`single_agent_draft` CHANGE COLUMN `desc` `description` text NOT NULL;
ALTER TABLE `opencoze`.`single_agent_draft` CHANGE COLUMN `database` `database_config` json NULL;
-- Modify "single_agent_version" table
ALTER TABLE `opencoze`.`single_agent_version` CHANGE COLUMN `desc` `description` text NOT NULL;
ALTER TABLE `opencoze`.`single_agent_version` CHANGE COLUMN `database` `database_config` json NULL;
