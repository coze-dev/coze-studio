-- 创建 HiAgent 表
CREATE TABLE `hi_agent` (
    `agent_id` varchar(64) NOT NULL COMMENT '智能体ID',
    `space_id` bigint(20) NOT NULL COMMENT '空间ID',
    `name` varchar(255) NOT NULL COMMENT '智能体名称',
    `description` text COMMENT '描述',
    `icon_url` varchar(500) COMMENT '图标URL',
    `endpoint` varchar(500) NOT NULL COMMENT 'API端点',
    `auth_type` enum('bearer','api_key') NOT NULL COMMENT '认证类型',
    `api_key` text COMMENT 'API密钥（加密存储）',
    `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
    `meta` json DEFAULT NULL COMMENT '额外元数据',
    `created_at` bigint(20) NOT NULL COMMENT '创建时间',
    `updated_at` bigint(20) NOT NULL COMMENT '更新时间',
    `deleted_at` timestamp NULL DEFAULT NULL COMMENT '删除时间',
    PRIMARY KEY (`agent_id`),
    KEY `idx_space_id` (`space_id`),
    KEY `idx_deleted_at` (`deleted_at`),
    KEY `idx_status` (`status`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='HiAgent外部智能体表';