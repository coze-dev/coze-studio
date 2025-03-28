create table model
(
    `id`         bigint unsigned                     not null comment '主键ID'
        primary key,
    `meta_id`    bigint unsigned                     not null comment '模型元信息 id',
    `name`       varchar(128)                        not null comment '名称',
    `scenario`   bigint unsigned                     not null comment '模型应用场景',
    `created_at` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at` bigint(20) NOT NULL DEFAULT 0 COMMENT 'Delete Time in Milliseconds',
    KEY `idx_scenario` (`scenario`)
)
    comment '模型信息';

