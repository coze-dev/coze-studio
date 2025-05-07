CREATE TABLE IF NOT EXISTS `single_agent_publish_result` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键id',
    `publish_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '' COMMENT '发布 id',
    `connector_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '10000010, 10000011, 10000012, 10000023, 482431, 489823',
    `publish_result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci COMMENT '发布结果',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `extra` json COMMENT '扩展字段',
    PRIMARY KEY (`id`),
    KEY `idx_publish_id` (`publish_id`)
) COMMENT = 'bot 渠道和发布版本流水表'