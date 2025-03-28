create table model_meta
(
    id                 bigint unsigned                         not null comment '主键ID'
        primary key,
    model_name         varchar(128)                            not null comment '模型名称',
    protocol           varchar(128)                            not null comment '模型协议',
    show_name          varchar(128)  default ''                not null comment '模型展示名',
    capability         json                                    null comment '模型能力',
    conn_config        json                                    null comment '模型连接配置',
    param_schema       json                                    null comment '模型请求参数',
    status             int           default 1                 not null comment '模型状态',
    description        varchar(2048) default ''                not null comment '模型描述',
    `created_at`       bigint(20)                              NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`       bigint(20)                              NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`       bigint(20)                              NOT NULL DEFAULT 0 COMMENT 'Delete Time in Milliseconds',
    KEY `idx_status` (`status`)
)
    comment '模型元信息';

