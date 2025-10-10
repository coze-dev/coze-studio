-- Modify "plugin" table
ALTER TABLE `opencoze`.`plugin` ADD COLUMN `source` tinyint NOT NULL DEFAULT 0 COMMENT "plugin source 1 from saas 0 default" AFTER `openapi_doc`, ADD COLUMN `ext` json NULL COMMENT "extra ";
-- Modify "plugin_version" table
ALTER TABLE `opencoze`.`plugin_version` ADD COLUMN `source` tinyint NOT NULL DEFAULT 0 COMMENT "plugin source 1 from saas 0 default" AFTER `openapi_doc`, ADD COLUMN `ext` json NULL COMMENT "extra ";
-- Modify "tool" table
ALTER TABLE `opencoze`.`tool` ADD COLUMN `source` tinyint NOT NULL DEFAULT 0 COMMENT "tool source 1 coze saas 0 default" AFTER `activated_status`, ADD COLUMN `ext` json NULL COMMENT "extra";
-- Modify "tool_version" table
ALTER TABLE `opencoze`.`tool_version` ADD COLUMN `source` tinyint NOT NULL DEFAULT 0 COMMENT "tool source 1 coze saas 0 default" AFTER `deleted_at`, ADD COLUMN `ext` json NULL COMMENT "extra";
