CREATE TABLE IF NOT EXISTS `tool`
(
    `id`               bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `plugin_id`        bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `created_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`       bigint(20) unsigned COMMENT 'Delete Time in Milliseconds',

    `version`          varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',
    `sub_url`          varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`           varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `operation`        json COMMENT 'Tool Openapi Operation Schema',

    `activated_status` tinyint unsigned    NOT NULL DEFAULT '0' COMMENT '0:activated; 1:deactivated',

    PRIMARY KEY (`id`),
    KEY `idx_plugin_activated_status` (`plugin_id`, `activated_status`),
    UNIQUE KEY `uniq_idx_plugin_sub_url_method` (`plugin_id`, `sub_url`, `method`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Latest Tool';