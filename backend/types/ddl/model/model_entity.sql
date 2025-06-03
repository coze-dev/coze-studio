CREATE TABLE IF NOT EXISTS model_entity (
    `id` bigint unsigned not null comment '主键ID' primary key,
    `meta_id` bigint unsigned not null comment '模型元信息 id',
    `name` varchar(128) not null comment '名称',
    `description` text null comment '描述',
    `default_params` json not null comment '默认参数',
    `scenario` bigint unsigned not null comment '模型应用场景',
    `status` int default 1 not null comment '模型状态',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at` bigint(20) unsigned COMMENT 'Delete Time in Milliseconds',
    KEY `idx_scenario` (`scenario`),
    KEY `idx_status` (`status`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci comment '模型信息';