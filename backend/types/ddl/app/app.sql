CREATE TABLE IF NOT EXISTS `app`
(
    `id`             bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key',
    `app_id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Application ID',
    `space_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `owner_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Owner ID',
    `icon_uri`       varchar(512)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `Name`           varchar(255)        NOT NULL DEFAULT '' COMMENT 'Application Name',
    `desc`           text COMMENT 'Application Description',
    `connector_id`   bigint(20) unsigned COMMENT 'Publish Connector ID',
    `publish_config` json COMMENT 'Publish Configuration',
    `version`        varchar(255)        NOT NULL DEFAULT '' COMMENT 'Release Version',
    `version_desc`   text COMMENT 'Version Description',

    `publish_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Publish Time in Milliseconds',
    `created_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_app_connector` (`app_id`, `connector_id`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Latest Application';