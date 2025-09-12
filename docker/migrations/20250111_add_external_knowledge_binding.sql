-- 外部知识库绑定表
-- 该表存储用户的外部知识库绑定信息
CREATE TABLE IF NOT EXISTS `external_knowledge_binding` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` varchar(255) NOT NULL COMMENT '用户ID，全局唯一标识',
  `binding_key` varchar(500) NOT NULL COMMENT '绑定密钥，用于连接外部知识库',
  `binding_name` varchar(255) DEFAULT NULL COMMENT '绑定名称，用户自定义名称',
  `binding_type` varchar(50) NOT NULL DEFAULT 'default' COMMENT '绑定类型，预留字段用于支持多种知识库类型',
  `extra_config` json DEFAULT NULL COMMENT '额外配置信息，JSON格式存储',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态，0=禁用，1=启用',
  `last_sync_at` timestamp NULL DEFAULT NULL COMMENT '最后同步时间',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_binding_key` (`user_id`, `binding_key`) COMMENT '用户和绑定密钥组合唯一索引',
  KEY `idx_user_id` (`user_id`) COMMENT '用户ID索引',
  KEY `idx_status` (`status`) COMMENT '状态索引',
  KEY `idx_binding_type` (`binding_type`) COMMENT '绑定类型索引',
  KEY `idx_created_at` (`created_at`) COMMENT '创建时间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='外部知识库绑定表，存储用户的外部知识库连接信息';

-- 添加示例注释
-- 用户可以通过输入binding_key来绑定外部知识库
-- binding_type预留用于未来支持不同类型的知识库（如：notion, obsidian, custom等）
-- extra_config可以存储特定知识库类型所需的额外配置信息