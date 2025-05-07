CREATE TABLE IF NOT EXISTS `single_agent_publish` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `agent_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT 'agent_id',
    `publish_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '发布 id',
    `connector_ids` json COMMENT '发布的 connector_ids',
    `version` varchar(255) NOT NULL DEFAULT '' COMMENT 'Agent Version',
    `publish_info` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '发布信息',
    `publish_time` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '发布时间',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `creator_id` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '发布人 user_id',
    `status` tinyint NOT NULL DEFAULT '0' COMMENT '状态 0:使用中 1:删除 3:禁用',
    `extra` json COMMENT '扩展字段',
    PRIMARY KEY (`id`),
    KEY `idx_agent_id_version` (`agent_id`, `version`),
    KEY `idx_publish_id` (`publish_id`),
    KEY `idx_creator_id` (`creator_id`)
) COMMENT = 'bot 渠道和发布版本流水表'