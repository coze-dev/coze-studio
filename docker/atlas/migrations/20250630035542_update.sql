-- Modify "workflow_draft" table
ALTER TABLE `opencoze`.`workflow_draft` ADD INDEX `idx_updated_at` (`updated_at` DESC);
-- Modify "workflow_meta" table
ALTER TABLE `opencoze`.`workflow_meta` ADD INDEX `idx_app_id` (`app_id`), ADD INDEX `idx_latest_version_ts` (`latest_version_ts` DESC);
