-- Modify "workflow_execution" table
ALTER TABLE `opencoze`.`workflow_execution` ADD COLUMN `sync_pattern` tinyint unsigned NULL COMMENT "the sync pattern 1. sync 2. async 3. stream";
