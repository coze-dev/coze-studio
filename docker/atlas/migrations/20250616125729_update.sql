-- Modify "workflow_draft" table
ALTER TABLE `opencoze`.`workflow_draft` DROP COLUMN `created_at`, ADD COLUMN `commit_id` varchar(255) NOT NULL COMMENT "used to uniquely identify a draft snapshot";
-- Modify "workflow_execution" table
ALTER TABLE `opencoze`.`workflow_execution` ADD COLUMN `commit_id` varchar(255) NULL COMMENT "draft commit id this execution belongs to";
-- Modify "workflow_meta" table
ALTER TABLE `opencoze`.`workflow_meta` ADD COLUMN `latest_version` varchar(50) NULL COMMENT "the version of the most recent publish";
-- Modify "workflow_version" table
ALTER TABLE `opencoze`.`workflow_version` DROP COLUMN `updater_id`, DROP COLUMN `updated_at`, ADD COLUMN `commit_id` varchar(255) NOT NULL COMMENT "the commit id corresponding to this version";
-- Create "workflow_snapshot" table
CREATE TABLE `opencoze`.`workflow_snapshot` (`workflow_id` bigint unsigned NOT NULL COMMENT "workflow id this snapshot belongs to", `commit_id` varchar(255) NOT NULL COMMENT "the commit id of the workflow draft", `canvas` mediumtext NOT NULL COMMENT "frontend schema for this snapshot", `input_params` mediumtext NULL COMMENT "input parameter info", `output_params` mediumtext NULL COMMENT "output parameter info", `created_at` bigint unsigned NOT NULL, PRIMARY KEY (`workflow_id`, `commit_id`)) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "snapshot for executed workflow draft";
