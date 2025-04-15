-- Drop Table IF EXISTS `single_agent_draft`;
CREATE TABLE IF NOT EXISTS `single_agent_draft` (
    `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'Primary Key ID',
    `agent_id` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Agent ID',
    `developer_id` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Developer ID',
    `space_id` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `name` varchar(255) NOT NULL DEFAULT '' COMMENT 'Agent Name',
    `desc` text COMMENT 'Agent Description',
    `icon_uri` varchar(255) NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `created_at` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Delete Time in Milliseconds',

    `variable` json COMMENT 'Variable List',
    `model_info` json COMMENT 'Model Configuration Information',
    `onboarding_info` json COMMENT 'Onboarding Information',
    `prompt` json COMMENT 'Agent Prompt Configuration',
    `plugin` json COMMENT 'Agent Plugin Base Configuration',
    `knowledge` json COMMENT 'Agent Knowledge Base Configuration',
    `workflow` json COMMENT 'Agent Workflow Configuration',
    `suggest_reply` json COMMENT 'Suggested Replies',
    `jump_config` json COMMENT 'Jump Configuration',
    PRIMARY KEY (`id`),
    KEY `idx_agent_id` (`agent_id`),
    KEY `idx_developer_id` (`developer_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = 'Single Agent Draft Copy Table';