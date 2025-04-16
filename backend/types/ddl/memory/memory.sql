-- Drop Table IF EXISTS `project_variable`;
CREATE TABLE IF NOT EXISTS `project_variable` (
    `id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '主键ID',
    `creator_id` bigint unsigned NOT NULL COMMENT '创建者ID',
    `project_id` varchar(128) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT 'project ID',
    `variable_list` text COLLATE utf8mb4_general_ci COMMENT '变量配置的json数据',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '创建时间',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '更新时间',
    `version` varchar(255) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'project版本,为空代表草稿态',
    PRIMARY KEY (`id`),
    UNIQUE KEY `idx_project_key` (`project_id`,`version`) USING BTREE,
    KEY `idx_user_key` (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='KV Memory meta'
