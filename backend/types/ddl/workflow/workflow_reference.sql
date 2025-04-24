create table opencoze.workflow_reference
(
    id                 bigint unsigned  not null comment 'workflow id',
    space_id           bigint unsigned  not null comment 'workflow space id',
    referring_id       bigint unsigned  not null comment 'the entity id that refers this workflow',
    refer_type         tinyint unsigned not null comment '1 subworkflow 2 tool',
    referring_biz_type tinyint unsigned not null comment 'the biz type the referring entity belongs to: 1. workflow 2. agent',
    created_at         bigint unsigned  not null comment 'create time in millisecond',
    creator_id         bigint unsigned  not null comment 'the user id of the creator',
    stage              tinyint unsigned not null comment 'the stage of this reference: 1. draft 2. published',
    updated_at         bigint unsigned  null comment 'update time in millisecond',
    updater_id         bigint unsigned  null comment 'the user id of the updater',
    deleted_at         datetime(3)      null comment 'delete time in millisecond',
    primary key (id, referring_id)
);

create index idx_id_referring_biz_type
    on opencoze.workflow_reference (id, referring_biz_type);

