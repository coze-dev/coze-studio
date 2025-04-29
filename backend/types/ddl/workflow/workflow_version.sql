CREATE TABLE IF NOT EXISTS `workflow_version`
(
    id                  bigint unsigned not null comment 'workflow id',
    version             varchar(50)     not null comment '发布版本',
    version_description varchar(2000)   not null comment '版本描述',
    canvas              mediumtext      not null comment '前端 schema',
    input_params        mediumtext      null,
    output_params       mediumtext      null,
    creator_id          bigint unsigned not null comment '发布用户 ID',
    created_at          bigint unsigned not null comment '创建时间毫秒时间戳',
    updater_id          bigint unsigned null comment '更新用户 ID',
    updated_at          bigint unsigned null comment '更新毫秒时间戳',
    deleted_at          datetime(3)     null comment '删除毫秒时间戳',
    primary key (id, version)
);

