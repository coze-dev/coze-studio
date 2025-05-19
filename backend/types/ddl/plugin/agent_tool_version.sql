CREATE TABLE IF NOT EXISTS `agent_tool_version`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `agent_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `plugin_id`    bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `tool_id`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `version_ms`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent Tool Version in Milliseconds',
    `tool_version` varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',
    `sub_url`      varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`       varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `operation`    json COMMENT 'Tool Openapi Operation Schema',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_agent_tool_version_ms` (`agent_id`, `tool_id`, `version_ms`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Agent Tool Version';