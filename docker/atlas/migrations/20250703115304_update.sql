-- Modify "run_record" table
ALTER TABLE `opencoze`.`run_record` DROP COLUMN `token_count`, DROP COLUMN `output_tokens`, DROP COLUMN `input_tokens`, ADD COLUMN `usage` json NULL COMMENT "usage";
