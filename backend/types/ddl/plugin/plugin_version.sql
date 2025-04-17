CREATE TABLE IF NOT EXISTS `plugin_version`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `space_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `developer_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Developer ID',
    `plugin_id`    bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `name`         varchar(512)        NOT NULL DEFAULT '' COMMENT 'Plugin Name',
    `desc`         text COMMENT 'Plugin Description',
    `icon_uri`     varchar(255)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `privacy_info` text COMMENT 'Privacy Info',
    `created_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',

    `version`      varchar(255)        NOT NULL DEFAULT '' COMMENT 'Plugin Version, e.g. v1.0.0',
    `server_url`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Server URL',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_plugin_version` (`plugin_id`, `version`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Plugin Version';