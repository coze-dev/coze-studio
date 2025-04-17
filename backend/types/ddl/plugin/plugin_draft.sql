CREATE TABLE IF NOT EXISTS `plugin_draft`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `space_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `developer_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Developer ID',
    `name`         varchar(512)        NOT NULL DEFAULT '' COMMENT 'Plugin Name',
    `desc`         text COMMENT 'Plugin Description',
    `icon_uri`     varchar(255)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `created_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`   bigint(20) unsigned COMMENT 'Delete Time in Milliseconds',

    `server_url`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Server URL',

    PRIMARY KEY (`id`),
    KEY `idx_update_at` (`updated_at`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Draft Plugin';