-- Modify "api_key" table
ALTER TABLE `opencoze`.`api_key` RENAME COLUMN `key` TO `api_key`;
-- Modify "app_draft" table
ALTER TABLE `opencoze`.`app_draft` RENAME COLUMN `desc` TO `description`;
-- Modify "app_release_record" table
ALTER TABLE `opencoze`.`app_release_record` RENAME COLUMN `desc` TO `description`;
-- Modify "single_agent_draft" table
ALTER TABLE `opencoze`.`single_agent_draft` RENAME COLUMN `desc` TO `description`, RENAME COLUMN `database` TO `database_config`;
-- Modify "single_agent_version" table
ALTER TABLE `opencoze`.`single_agent_version` RENAME COLUMN `desc` TO `description`, RENAME COLUMN `database` TO `database_config`;
