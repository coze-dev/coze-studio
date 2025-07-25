-- Modify "data_copy_task" table
ALTER TABLE `opencoze`.`data_copy_task` ADD COLUMN `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID", DROP PRIMARY KEY, ADD PRIMARY KEY (`id`), ADD UNIQUE INDEX `uniq_master_task_id_origin_data_id_data_type` (`master_task_id`, `origin_data_id`, `data_type`);
-- Modify "workflow_snapshot" table
ALTER TABLE `opencoze`.`workflow_snapshot` ADD COLUMN `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID", DROP PRIMARY KEY, ADD PRIMARY KEY (`id`), ADD UNIQUE INDEX `uniq_workflow_id_commit_id` (`workflow_id`, `commit_id`);
-- Modify "workflow_version" table
ALTER TABLE `opencoze`.`workflow_version` DROP INDEX `idx_id_created_at`;
-- Modify "workflow_version" table
ALTER TABLE `opencoze`.`workflow_version` MODIFY COLUMN `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID", ADD COLUMN `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id", DROP PRIMARY KEY, ADD PRIMARY KEY (`id`), ADD INDEX `idx_id_created_at` (`workflow_id`, `created_at`), ADD UNIQUE INDEX `uniq_workflow_id_version` (`workflow_id`, `version`);
