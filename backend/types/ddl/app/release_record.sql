CREATE TABLE IF NOT EXISTS `release_record`
(
    `id`             bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Publish Record ID',
    `app_id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Application ID',
    `space_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `owner_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Owner ID',
    `icon_uri`       varchar(512)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `Name`           varchar(255)        NOT NULL DEFAULT '' COMMENT 'Application Name',
    `desc`           text COMMENT 'Application Description',
    `connector_ids`  json COMMENT 'Publish Connector IDs',
    `extra_info`     json COMMENT 'Publish Extra Info',
    `version`        varchar(255)        NOT NULL DEFAULT '' COMMENT 'Release Version',
    `version_desc`   text COMMENT 'Version Description',
    `publish_status` tinyint             NOT NULL DEFAULT 0 COMMENT 'Publish Status',

    `publish_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Publish Time in Milliseconds',
    `created_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',

    PRIMARY KEY (`id`),
    KEY `idx_app_publish_at` (`app_id`, `publish_at`),
    UNIQUE KEY `uniq_idx_app_version_connector` (`app_id`, `version`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Application Release Record';