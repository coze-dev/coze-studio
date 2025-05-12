CREATE TABLE IF NOT EXISTS `workflow_draft`
(
    id            bigint unsigned not null comment 'workflow ID'
        primary key,
    canvas        mediumtext      not null comment '前端 schema',
    input_params  mediumtext      null comment ' 入参 schema',
    output_params mediumtext      null comment ' 出参 schema',
    test_run_success  boolean   default 0  not null comment '0 未运行, 1 运行成功',
    published         boolean      default 0  not null comment '0 未发布, 1 已发布',
    created_at    bigint unsigned not null,
    updated_at    bigint unsigned null,
    deleted_at    datetime(3)     null
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci CHARACTER SET=utf8mb4;

