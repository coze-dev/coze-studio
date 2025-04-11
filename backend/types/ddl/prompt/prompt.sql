CREATE TABLE IF NOT EXISTS `prompt_resource` (
`id` BIGINT(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`space_id` BIGINT(20) NOT NULL COMMENT '空间ID',
`name` VARCHAR(255) NOT NULL COMMENT '名称',
`description` VARCHAR(255) NOT NULL COMMENT '描述',
`prompt_text` MEDIUMTEXT COMMENT 'prompt正文',
`status` INT(11) NOT NULL COMMENT '状态,0无效,1有效',
`creator_id` BIGINT(20) NOT NULL COMMENT '创建者ID',
`created_at` bigint(20) NOT NULL DEFAULT 0 COMMENT '创建时间',
`updated_at` bigint(20) NOT NULL DEFAULT 0 COMMENT '更新时间',
PRIMARY KEY (`id`),
KEY `idx_creator_id` (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='prompt_resource';