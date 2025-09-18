-- Alter "statistics_export_file" to add export_task_id and status
ALTER TABLE `opencoze`.`statistics_export_file`
    ADD COLUMN `export_task_id` VARCHAR(64) NOT NULL COMMENT 'export task id' AFTER `agent_id`,
    ADD COLUMN `status` TINYINT NOT NULL DEFAULT 0 COMMENT 'upload status';

ALTER TABLE `opencoze`.`statistics_export_file`
    ADD UNIQUE KEY `uk_export_task_id` (`export_task_id`);
