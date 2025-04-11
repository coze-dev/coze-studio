CREATE TABLE IF NOT EXISTS `plugin`
(
    `id`               bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `name`             varchar(512)        NOT NULL DEFAULT '' COMMENT 'Plugin Name',
    `desc`             text COMMENT 'Plugin Description',
    `icon_uri`         varchar(255)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `created_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Delete Time in Milliseconds',

    `version`          varchar(255)        NOT NULL DEFAULT '' COMMENT 'Plugin Version, e.g. v1.0.0',
    `server_url`       varchar(512)        NOT NULL DEFAULT '' COMMENT 'Server URL',
    `published_status` tinyint unsigned    NOT NULL DEFAULT '0' COMMENT '0:unpublished; 1:published',

    PRIMARY KEY (`id`),
    KEY `idx_published_plugin_create_at` (`deleted_at`, `published_status`, `created_at`),
    KEY `idx_published_plugin_update_at` (`deleted_at`, `published_status`, `updated_at`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Latest Plugin';