CREATE TABLE IF NOT EXISTS `agent_tool_version`
(
    `id`              bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `agent_id`        bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `tool_id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `version_ms`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent Tool Version in Milliseconds',
    `tool_version`    varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',

    `request_params`  json COMMENT 'Agent Tool Request Parameters',
    `response_params` json COMMENT 'Agent Tool Response Parameters',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_agent_tool_version_ms` (`agent_id`, `tool_id`, `version_ms`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Agent Tool Version';