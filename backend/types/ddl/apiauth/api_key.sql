Drop Table IF EXISTS `api_key`;
CREATE TABLE IF NOT EXISTS `api_key` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID',
    `key` varchar(255) NOT NULL DEFAULT '' COMMENT 'API Key hash',
    `name` varchar(255) NOT NULL DEFAULT '' COMMENT 'API Key Name',
    `status` tinyint NOT NULL DEFAULT 0 COMMENT '0 normal, 1 deleted',
    `user_id` bigint(20) NOT NULL DEFAULT '0' COMMENT 'API Key Owner',
    `expired_at` bigint(20) NOT NULL DEFAULT '0' COMMENT 'API Key Expired Time',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    PRIMARY KEY (`id`)
)ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'api key table';