CREATE TABLE IF NOT EXISTS knowledge_document_slice
(
    id           bigint unsigned default '0'               not null comment '主键ID'
        primary key,
    knowledge_id bigint unsigned default '0'               not null comment 'knowledge id',
    document_id  bigint unsigned default '0'               not null comment 'document id',
    content      text                                      null comment '切片内容',
    sequence     double                              not null comment '切片顺序号, 从1开始',
    created_at   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    updated_at   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    deleted_at   datetime(3) COMMENT 'Delete Time in Milliseconds',
    creator_id   bigint          default 0                 not null comment '创建者ID',
    space_id     bigint          default 0                 not null comment '空间ID',
    status       int              default 0                not null comment '状态',
    fail_reason  tinytext                                  null comment '失败原因',
    hit          bigint unsigned default 0                 not null comment '命中次数',
    KEY idx_document_id_deleted_at_sequence (document_id, deleted_at, sequence),
    KEY idx_knowledge_id(knowledge_id),
    KEY idx_sequence (sequence)
)
    comment '知识库文件切片表';


