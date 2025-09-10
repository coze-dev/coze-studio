-- 用户记忆文档表
-- 该表存储每个用户的完整记忆文档，支持语义搜索
CREATE TABLE IF NOT EXISTS `user_memory_document` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` varchar(255) NOT NULL COMMENT '用户ID，全局唯一标识',
  `connector_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '连接器ID',
  `document_content` longtext NOT NULL COMMENT '记忆文档内容，完整的文本记录用户的所有记忆',
  `line_count` int(11) NOT NULL DEFAULT '0' COMMENT '文档行数，用于上下文检索',
  `version` int(11) NOT NULL DEFAULT '1' COMMENT '文档版本号，每次更新递增',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用记忆功能，0=禁用，1=启用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_connector` (`user_id`, `connector_id`) COMMENT '用户和连接器组合唯一索引',
  KEY `idx_user_id` (`user_id`) COMMENT '用户ID索引',
  KEY `idx_enabled` (`enabled`) COMMENT '启用状态索引',
  KEY `idx_updated_at` (`updated_at`) COMMENT '更新时间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户记忆文档表，存储每个用户的完整记忆文档';

-- 用户记忆配置表
-- 存储用户的记忆功能配置信息
CREATE TABLE IF NOT EXISTS `user_memory_config` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` varchar(255) NOT NULL COMMENT '用户ID',
  `connector_id` bigint(20) NOT NULL DEFAULT '0' COMMENT '连接器ID',
  `memory_enabled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否启用记忆功能，0=禁用，1=启用',
  `auto_learn` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否自动学习，0=不自动学习，1=自动学习用户偏好',
  `search_context_lines` int(11) NOT NULL DEFAULT '10' COMMENT '搜索上下文行数，默认前后10行',
  `max_document_lines` int(11) NOT NULL DEFAULT '10000' COMMENT '文档最大行数限制',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_connector_config` (`user_id`, `connector_id`) COMMENT '用户和连接器配置唯一索引',
  KEY `idx_user_id_config` (`user_id`) COMMENT '用户ID索引',
  KEY `idx_memory_enabled` (`memory_enabled`) COMMENT '记忆启用状态索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户记忆配置表，存储用户记忆功能的配置信息';

-- 插入默认配置示例（可选）
-- 为了测试，可以给一个默认用户启用记忆功能
INSERT IGNORE INTO `user_memory_config` (`user_id`, `connector_id`, `memory_enabled`, `auto_learn`) 
VALUES ('7532755646093983744', 10000010, 1, 1);