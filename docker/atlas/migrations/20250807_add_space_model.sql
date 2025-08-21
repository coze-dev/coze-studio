-- Add space_model table for managing model associations with spaces
CREATE TABLE IF NOT EXISTS `opencoze`.`space_model` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `space_id` bigint unsigned NOT NULL COMMENT '空间ID',
  `model_entity_id` bigint unsigned NOT NULL COMMENT '模型实体ID',
  `user_id` bigint unsigned NOT NULL COMMENT '创建者ID',
  `status` int NOT NULL DEFAULT 1 COMMENT '状态: 1启用 2禁用',
  `custom_config` json NULL COMMENT '空间自定义配置(覆盖默认配置)',
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT '创建时间（毫秒）',
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT '更新时间（毫秒）',
  `deleted_at` bigint unsigned NULL COMMENT '删除时间（毫秒）',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_space_model` (`space_id`, `model_entity_id`, `deleted_at`),
  KEY `idx_space_id` (`space_id`),
  KEY `idx_model_entity_id` (`model_entity_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='空间模型关联表';