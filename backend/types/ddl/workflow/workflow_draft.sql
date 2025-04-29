CREATE TABLE IF NOT EXISTS `workflow_draft`
(
    id            bigint unsigned not null comment 'workflow ID'
        primary key,
    canvas        mediumtext      not null comment '前端 schema',
    input_params  mediumtext      null comment ' 入参 schema',
    output_params mediumtext      null comment ' 出参 schema',
    created_at    bigint unsigned not null,
    updated_at    bigint unsigned null,
    deleted_at    datetime(3)     null
);

