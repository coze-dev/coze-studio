-- Modify "api_key" table
ALTER TABLE `opencoze`.`api_key` AUTO_INCREMENT 7519138824157396993, ADD COLUMN `last_used_at` bigint NOT NULL DEFAULT 0 COMMENT "Used Time in Milliseconds";
