-- Modify "agent_tool_draft" table
ALTER TABLE `opencoze`.`agent_tool_draft` ADD COLUMN `source` tinyint NOT NULL DEFAULT 0 COMMENT "tool source 1 coze saas 0 default";
-- Modify "agent_tool_version" table
ALTER TABLE `opencoze`.`agent_tool_version` ADD COLUMN `source` tinyint NOT NULL DEFAULT 0 COMMENT "tool source 1 coze saas 0 default";

-- Modify "shortcut_command" table
ALTER TABLE `opencoze`.`shortcut_command` ADD COLUMN `source` tinyint NULL DEFAULT 0 COMMENT "plugin source 1 coze saas 0 default";
