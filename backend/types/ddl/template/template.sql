CREATE TABLE IF NOT EXISTS `template` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID',
    `agent_id` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `workflow_id` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Workflow ID',

    `space_id` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `heat` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'Heat',
    `product_entity_type` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'Product Entity Type',

    `meta_info` json COMMENT 'Meta Info',
    `agent_extra` json COMMENT 'Agent Extra Info',
    `workflow_extra` json COMMENT 'Workflow Extra Info',
    `project_extra` json COMMENT 'Project Extra Info',
    PRIMARY KEY (`id`),
    UNIQUE KEY idx_agent_id (agent_id)
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Template Info Table';