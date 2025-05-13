CREATE TABLE `dataset_document_review` (
    id           bigint unsigned default '0'               not null comment '主键ID'
        primary key,
    knowledge_id bigint unsigned default '0'               not null comment 'knowledge id',
    space_id        bigint           default 0                 not null comment '空间id',
    name varchar(150) NOT NULL DEFAULT '' COMMENT '文档名称',
    type varchar(10) NOT NULL DEFAULT '0' COMMENT '文档类型',
    uri text  COMMENT '资源标识',
    format_type tinyint unsigned NOT NULL DEFAULT '0' COMMENT '0 文本, 1 表格, 2 图片',
    parse_rule      json                                       null comment '解析+切片规则',
    status tinyint unsigned NOT NULL DEFAULT '0' COMMENT '0 处理中，1 已完成，2 失败，3 失效',
    chunk_resp_uri text COMMENT '预切片tos资源标识',
    preview_uri text COMMENT '原文预览tos资源标识',
    deleted_at   datetime(3) COMMENT 'Delete Time in Milliseconds',
    created_at   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    updated_at   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    creator_id   bigint          default 0                 not null comment '创建者ID',
    KEY idx_dataset_id (knowledge_id, status, update_time),
    KEY idx_uri (uri(100))
)
    comment '文档审阅表';