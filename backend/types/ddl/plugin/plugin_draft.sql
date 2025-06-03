CREATE TABLE IF NOT EXISTS `plugin_draft`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `space_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `developer_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Developer ID',
    `app_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Application ID',
    `icon_uri`     varchar(512)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `server_url`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Server URL',
    `plugin_type`  tinyint             NOT NULL DEFAULT 0 COMMENT 'Plugin Type, 1:http, 6:local',
    `created_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`   datetime COMMENT 'Delete Time',

    `manifest`     json COMMENT 'Plugin Manifest',
    `openapi_doc`  json COMMENT 'OpenAPI Document, only stores the root',

    PRIMARY KEY (`id`),
    KEY `idx_space_app_updated_at` (`space_id`, `app_id`, `updated_at`),
    KEY `idx_space_app_create_at` (`space_id`, `app_id`, `created_at`),
    KEY `idx_app_id` (`app_id`, `id`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Draft Plugin';