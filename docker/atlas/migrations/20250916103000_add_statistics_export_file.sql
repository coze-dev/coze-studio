-- Create "statistics_export_file" table
CREATE TABLE `opencoze`.`statistics_export_file` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'primary key',
    `agent_id`   BIGINT NOT NULL COMMENT 'agent id',
    `file_name`  VARCHAR(255) NOT NULL COMMENT 'exported file name',
    `object_key` VARCHAR(512) NOT NULL COMMENT 'object storage key',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT 'created time',
    `expire_at`  DATETIME(3) NOT NULL COMMENT 'expire time',
    PRIMARY KEY (`id`),
    INDEX `idx_agent_expire` (`agent_id`, `expire_at`),
    INDEX `idx_expire_at` (`expire_at`)
) CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci
  COMMENT = 'Conversation statistics export files';
