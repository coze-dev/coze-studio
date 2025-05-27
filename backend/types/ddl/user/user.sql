CREATE TABLE IF NOT EXISTS `user` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID',
    `name` varchar(128) NOT NULL DEFAULT '' COMMENT 'User Nickname',
    `unique_name` varchar(128) NOT NULL DEFAULT '' COMMENT 'User Unique Name',
    `email` varchar(128) NOT NULL DEFAULT '' COMMENT 'Email',
    `password` varchar(128) NOT NULL DEFAULT '' COMMENT 'Password (Encrypted)',
    `description` varchar(512) NOT NULL DEFAULT '' COMMENT 'User Description',
    `icon_uri` varchar(512) NOT NULL DEFAULT '' COMMENT 'Avatar URI',
    `user_verified` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'User Verification Status',
    `locale` varchar(128) NOT NULL DEFAULT '' COMMENT 'Locale',
    `session_key` varchar(256) NOT NULL DEFAULT '' COMMENT 'Session Key',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Creation Time (Milliseconds)',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time (Milliseconds)',
    `deleted_at` bigint(20) unsigned DEFAULT NULL COMMENT 'Deletion Time (Milliseconds)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_unique_name` (`unique_name`),
    UNIQUE KEY `idx_email` (`email`),
    KEY `idx_session_key` (`session_key`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'User Table';