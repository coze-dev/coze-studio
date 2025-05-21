CREATE TABLE IF NOT EXISTS `agent_tool_draft`
(
    `id`           bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `agent_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `plugin_id`    bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `space_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `tool_id`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `created_at`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `sub_url`      varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`       varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `tool_version` varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',

    `operation`    json COMMENT 'Tool Openapi Operation Schema',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_agent_space_tool` (`agent_id`, `space_id`, `tool_id`),
    KEY `idx_space_id_agent_tool_bind` (`space_id`, `agent_id`, `created_at`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Draft Agent Tool';