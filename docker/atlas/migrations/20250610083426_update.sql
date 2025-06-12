-- Modify "data_copy_task" table
ALTER TABLE `opencoze`.`data_copy_task` DROP COLUMN `id`, DROP PRIMARY KEY, ADD PRIMARY KEY (`master_task_id`, `origin_data_id`, `data_type`), DROP INDEX `uniq_task`;
