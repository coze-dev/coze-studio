CREATE TABLE IF NOT EXISTS `tool_product_ref`
(
    `id`        bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `space_id`  bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `plugin_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `version`   varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',
    `sub_url`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`    varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `operation` json COMMENT 'Tool Openapi Operation Schema',

    PRIMARY KEY (`id`),
    KEY `idx_plugin_id` (`plugin_id`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Tool Product Reference';