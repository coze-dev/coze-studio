CREATE TABLE IF NOT EXISTS `app_release`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key',
    `app_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Application ID',
    `space_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `connector_id` bigint(20) unsigned COMMENT 'Release Connector ID',
    `publisher`    bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Publisher',
    `release_info` text COMMENT 'Release Information',
    `version`      varchar(255)        NOT NULL DEFAULT '' COMMENT 'Release Version',
    `status`       tinyint             NOT NULL DEFAULT 0 COMMENT 'Release Status',

    `created_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_app_version_connector` (`app_id`, `version`, `connector_id`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Application Release';