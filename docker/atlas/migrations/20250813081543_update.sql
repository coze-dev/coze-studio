-- Modify "api_key" table
ALTER TABLE `opencoze`.`api_key` ADD COLUMN `ak_type` tinyint NOT NULL DEFAULT 0 COMMENT "api key type ";
-- Modify "single_agent_draft" table
ALTER TABLE `opencoze`.`single_agent_draft` ADD COLUMN `bot_mode` tinyint NOT NULL DEFAULT 0 COMMENT "bot mode,0:single mode 2:chatflow mode" AFTER `database_config`, ADD COLUMN `layout_info` text NULL COMMENT "chatflow layout info";
-- Modify "single_agent_version" table
ALTER TABLE `opencoze`.`single_agent_version` ADD COLUMN `bot_mode` tinyint NOT NULL DEFAULT 0 COMMENT "bot mode,0:single mode 2:chatflow mode" AFTER `database_config`, ADD COLUMN `layout_info` text NULL COMMENT "chatflow layout info";

