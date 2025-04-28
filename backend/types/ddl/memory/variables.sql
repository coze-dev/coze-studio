-- Drop Table IF EXISTS `variables_meta`;
CREATE TABLE IF NOT EXISTS `variables_meta` (
  `id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '主键ID',
  `creator_id` bigint unsigned NOT NULL COMMENT '创建者ID',
  `biz_type` tinyint unsigned NOT NULL COMMENT '1 for agent，2 for project',
  `biz_id` varchar(128) NOT NULL DEFAULT '' COMMENT '1 for agent_id，2 for project_id',
  `variable_list` json COMMENT '变量配置的json数据',
  `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '更新时间',
  `version` varchar(255) NOT NULL COMMENT 'project版本,为空代表草稿态',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_project_key` (`biz_id`, `biz_type`, `version`) USING BTREE,
  KEY `idx_user_key` (`creator_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'KV Memory meta';
CREATE TABLE IF NOT EXISTS `variable_instance` (
  `id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '主键ID',
  `biz_type` tinyint unsigned NOT NULL COMMENT '1 for agent，2 for project',
  `biz_id` varchar(128) NOT NULL DEFAULT '' COMMENT '1 for agent_id，2 for project_id',
  `version` varchar(255) NOT NULL COMMENT 'agent or project 版本,为空代表草稿态',
  `keyword` varchar(255) NOT NULL COMMENT '记忆的KEY',
  `type` tinyint NOT NULL COMMENT '记忆类型 1 KV 2 list',
  `content` text COMMENT '记忆内容',
  `connector_uid` varchar(255) NOT NULL COMMENT '二方用户ID',
  `connector_id` bigint NOT NULL COMMENT '二方id, e.g. coze = 10000010',
  `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '创建时间',
  `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_connector_key` (
    `biz_id`,
    `biz_type`,
    `version`,
    `connector_uid`,
    `connector_id`
  )
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT = 'KV Memory';