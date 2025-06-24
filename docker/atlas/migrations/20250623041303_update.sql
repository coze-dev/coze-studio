-- Modify "message" table
ALTER TABLE `opencoze`.`message` ADD INDEX `idx_conversation_id` (`conversation_id`), ADD INDEX `idx_run_id` (`run_id`);
-- Modify "run_record" table
ALTER TABLE `opencoze`.`run_record` ADD INDEX `idx_c_s` (`conversation_id`, `section_id`);
