CREATE TABLE IF NOT EXISTS `space_user` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID, Auto Increment',
    `space_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `user_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'User ID',
    `role_type` int(11) NOT NULL DEFAULT 3 COMMENT 'Role Type: 1.owner 2.admin 3.member',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Creation Time (Milliseconds)',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time (Milliseconds)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_space_user` (`space_id`, `user_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Space Member Table';