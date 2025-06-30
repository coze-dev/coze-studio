-- Modify "app_conversion_template_draft" table
ALTER TABLE `opencoze`.`app_conversion_template_draft` ADD COLUMN `app_id` bigint unsigned NOT NULL COMMENT "app id" AFTER `id`;
-- Modify "app_conversion_template_online" table
ALTER TABLE `opencoze`.`app_conversion_template_online` DROP COLUMN `updated_at`, DROP COLUMN `deleted_at`, ADD COLUMN `app_id` bigint unsigned NOT NULL COMMENT "app id" AFTER `id`;
-- Modify "app_dynamic_conversion_draft" table
ALTER TABLE `opencoze`.`app_dynamic_conversion_draft` ADD COLUMN `app_id` bigint unsigned NOT NULL COMMENT "app id" AFTER `id`;
-- Modify "app_dynamic_conversion_online" table
ALTER TABLE `opencoze`.`app_dynamic_conversion_online` ADD COLUMN `app_id` bigint unsigned NOT NULL COMMENT "app id" AFTER `id`;
-- Modify "app_user_connector_conversion_draft" table
ALTER TABLE `opencoze`.`app_user_connector_conversion_draft` DROP COLUMN `deleted_at`;
-- Modify "app_user_connector_conversion_online" table
ALTER TABLE `opencoze`.`app_user_connector_conversion_online` DROP COLUMN `deleted_at`;
-- Modify "chat_flow_role_config" table
ALTER TABLE `opencoze`.`chat_flow_role_config` DROP INDEX `idx_workflow_id_version`;
-- Modify "chat_flow_role_config" table
ALTER TABLE `opencoze`.`chat_flow_role_config` DROP COLUMN `project_version`, ADD COLUMN `version` varchar(256) NOT NULL COMMENT "version" AFTER `description`, ADD INDEX `idx_workflow_id_version` (`workflow_id`, `version`);
