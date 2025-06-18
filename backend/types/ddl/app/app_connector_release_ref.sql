CREATE TABLE IF NOT EXISTS `app_connector_release_ref`
(
    `id`             bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key',
    `record_id`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Publish Record ID',
    `connector_id`   bigint(20) unsigned COMMENT 'Publish Connector ID',
    `publish_config` json COMMENT 'Publish Configuration',
    `publish_status` tinyint             NOT NULL DEFAULT 0 COMMENT 'Publish Status',

    `created_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',

    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_record_connector` (`record_id`, `connector_id`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Application Connector Release Record Reference';