create table knowledge
(
    id                bigint unsigned                           not null comment '主键ID'
        primary key,
    name              varchar(150)    default ''                not null comment '名称',
    creator_id        bigint unsigned default '0'               not null comment 'ID',
    space_id          bigint unsigned default 0                 not null comment '空间ID',
    created_at bigint(20) NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    updated_at bigint(20) NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    deleted_at bigint(20) NOT NULL DEFAULT 0 COMMENT 'Delete Time in Milliseconds',
    status            tinyint         default 1                 not null comment '0 初始化, 1 生效 2 失效',
    description       text                                      null comment '描述',
    icon_uri          varchar(150)                              null comment '头像uri',
    format_type       tinyint         default 0                 not null comment '0:文本 1:表格 2:图片'
)
    comment '知识库表';

create index idx_creator_id
    on knowledge (creator_id);

create index idx_space_id_deleted_at_updated_at
    on knowledge (space_id, deleted_at, updated_at);