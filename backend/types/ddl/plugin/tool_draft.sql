CREATE TABLE IF NOT EXISTS `tool_draft`
(
    `id`               bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `plugin_id`        bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `created_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',

    `sub_url`          varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`           varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `operation`        json COMMENT 'Tool Openapi Operation Schema',

    `debug_status`     tinyint unsigned    NOT NULL DEFAULT '0' COMMENT '0:not pass; 1:pass',
    `activated_status` tinyint unsigned    NOT NULL DEFAULT '0' COMMENT '0:activated; 1:deactivated',

    PRIMARY KEY (`id`),
    KEY `idx_plugin_created_at_id` (`plugin_id`, `created_at`, `id`),
    UNIQUE KEY `uniq_idx_plugin_sub_url_method` (`plugin_id`, `sub_url`, `method`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Draft Tool';