-- Modify "single_agent_draft" table
ALTER TABLE `opencoze`.`single_agent_draft` AUTO_INCREMENT 2, ADD COLUMN `bot_mode` tinyint NOT NULL DEFAULT 0 COMMENT "编排模式,0:single mode 2:chatflow mode", ADD COLUMN `layout_info` text NULL COMMENT "chatflow模式的编排信息";
-- Modify "single_agent_version" table
ALTER TABLE `opencoze`.`single_agent_version` ADD COLUMN `bot_mode` tinyint NOT NULL DEFAULT 0 COMMENT "编排模式,0:single mode 2:chatflow mode", ADD COLUMN `layout_info` text NULL COMMENT "chatflow模式的编排信息";

