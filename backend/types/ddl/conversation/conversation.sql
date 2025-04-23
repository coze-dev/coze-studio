CREATE TABLE IF NOT EXISTS `conversation` (
   `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
   `connector_id` bigint unsigned NOT NULL DEFAULT '0' COMMENT '业务线 ID',
   `agent_id` bigint NOT NULL DEFAULT '0' COMMENT 'agent_id',
   `scene` tinyint NOT NULL DEFAULT '0' COMMENT '会话场景',
   `section_id` bigint unsigned  NOT NULL DEFAULT '0' COMMENT '最新section_id',
   `creator_id`  bigint unsigned DEFAULT '0' COMMENT '创建者id',
   `ext` text  COMMENT '扩展字段',
   `created_at` bigint unsigned NOT NULL DEFAULT '0' COMMENT '创建时间',
   `updated_at` bigint unsigned NOT NULL DEFAULT '0' COMMENT '更新时间',
   PRIMARY KEY (`id`),
   KEY `idx_connector_bot_status` (`connector_id`,`agent_id`,`creator_id`)
) COMMENT='会话信息表'