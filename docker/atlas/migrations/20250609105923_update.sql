-- Modify "space" table
ALTER TABLE `opencoze`.`space` AUTO_INCREMENT 666;
-- Modify "user" table
ALTER TABLE `opencoze`.`user` AUTO_INCREMENT 888;
-- Modify "workflow_execution" table
ALTER TABLE `opencoze`.`workflow_execution` ADD COLUMN `agent_id` bigint unsigned NULL COMMENT "the agent that this execution binds to";
