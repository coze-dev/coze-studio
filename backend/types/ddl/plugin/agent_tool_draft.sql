CREATE TABLE IF NOT EXISTS `agent_tool_draft`
(
    `id`              bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Primary Key ID',
    `agent_id`        bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `tool_id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `created_at`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Delete Time in Milliseconds',

    `request_params`  json COMMENT 'Agent Tool Request Parameters',
    `response_params` json COMMENT 'Agent Tool Response Parameters',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_agent_tool` (`agent_id`, `tool_id`),
    KEY `idx_agent_tool_bind` (`agent_id`, `deleted_at`, `created_at`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Draft Agent Tool';