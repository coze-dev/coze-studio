CREATE TABLE IF NOT EXISTS `space` (
    `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID, Space ID',
    `owner_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Owner ID',
    `name` varchar(200) NOT NULL DEFAULT '' COMMENT 'Space Name',
    `description` varchar(2000) NOT NULL DEFAULT '' COMMENT 'Space Description',
    `icon_uri` varchar(200) NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `creator_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Creator ID',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Creation Time (Milliseconds)',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time (Milliseconds)',
    `deleted_at` bigint(20) unsigned DEFAULT NULL COMMENT 'Deletion Time (Milliseconds)',
    PRIMARY KEY (`id`),
    KEY `idx_owner_id` (`owner_id`),
    KEY `idx_creator_id` (`creator_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Space Table';