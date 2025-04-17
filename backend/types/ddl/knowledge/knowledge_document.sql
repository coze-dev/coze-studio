CREATE TABLE IF NOT EXISTS knowledge_document
(
    id              bigint unsigned                            not null comment '主键ID'
        primary key,
    knowledge_id    bigint unsigned  default '0'               not null comment '所属knowledge的ID',
    name            varchar(150)     default ''                not null comment '文档名称',
    type            varchar(20)      default '0'               not null comment '文档类型, txt/pdf/csv/...',
    uri             text                                       null comment '资源uri',
    size            bigint unsigned  default '0'               not null comment '文档大小',
    slice_count     bigint unsigned  default '0'               not null comment '分片数量',
    char_count      bigint unsigned  default '0'               not null comment '字符数',
    creator_id      bigint unsigned  default '0'               not null comment '创建者ID',
    space_id        bigint           default 0                 not null comment '空间id',
    created_at      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    updated_at      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    deleted_at      bigint(20) unsigned COMMENT 'Delete Time in Milliseconds',
    source_type     int              default 0                 not null comment '0:本地文件上传, 2:自定义文本',
    status          int              default 0                 not null comment '状态',
    fail_reason     tinytext                                   null comment '失败原因',
    parse_rule      json                                       null comment '解析+切片规则',
    table_id        varchar(255)                               null comment '表格数据在 dataset 存储的 table_id; 非表格数据该字段为 null',
    KEY idx_creator_id (creator_id),
    KEY idx_knowledge_id_deleted_at_updated_at (knowledge_id, deleted_at, updated_at)
)
    comment '知识库文档表';


