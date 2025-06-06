CREATE TABLE IF NOT EXISTS `tool_version`
(
    `id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `tool_id`    bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `plugin_id`  bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',


    `version`    varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',
    `sub_url`    varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`     varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `operation`  json COMMENT 'Tool Openapi Operation Schema',

    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `deleted_at` datetime COMMENT 'Delete Time',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_tool_version` (`tool_id`, `version`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Tool Version';