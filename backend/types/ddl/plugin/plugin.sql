CREATE TABLE IF NOT EXISTS `plugin`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `space_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `developer_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Developer ID',
    `project_id`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Project ID',
    `icon_uri`     varchar(255)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `server_url`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Server URL',
    `plugin_type`  tinyint(4)          NOT NULL DEFAULT 0 COMMENT 'Plugin Type, 1:http, 6:local',
    `created_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',

    `version`      varchar(255)        NOT NULL DEFAULT '' COMMENT 'Plugin Version, e.g. v1.0.0',
    `version_desc` text COMMENT 'Plugin Version Description',
    `manifest`     json COMMENT 'Plugin Manifest',
    `openapi_doc`  json COMMENT 'OpenAPI Document, only stores the root',

    PRIMARY KEY (`id`),
    KEY `idx_space_create_at` (`space_id`, `created_at`),
    KEY `idx_space_updated_at` (`space_id`, `updated_at`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Latest Plugin';