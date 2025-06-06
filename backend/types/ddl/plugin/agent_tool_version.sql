CREATE TABLE IF NOT EXISTS `agent_tool_version`
(
    `id`            bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `agent_id`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `plugin_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `tool_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `agent_version` varchar(255)        not null default '' comment 'Agent Tool Version',
    `tool_name`     varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Name',
    `tool_version`  varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',
    `sub_url`       varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `method`        varchar(64)         NOT NULL DEFAULT '' COMMENT 'HTTP Request Method',
    `operation`     json COMMENT 'Tool Openapi Operation Schema',

    `created_at`    bigint(20) unsigned not null default 0 comment 'Create Time in Milliseconds',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_agent_tool_name_agent_version` (`agent_id`, `tool_name`, `agent_version`),
    UNIQUE KEY `uniq_idx_agent_tool_id_agent_version` (`agent_id`, `tool_id`, `agent_version`),
    KEY `idx_agent_tool_name_created_at` (`agent_id`, `tool_name`, `created_at`),
    KEY `idx_agent_tool_id_created_at` (`agent_id`, `tool_id`, `created_at`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Agent Tool Version';