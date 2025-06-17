CREATE TABLE IF NOT EXISTS `workflow_meta`
(
    id           bigint unsigned  not null comment 'workflow id'
        primary key,
    name         varchar(256)     not null comment 'workflow name',
    description  varchar(2000)    not null comment 'workflow description',
    icon_uri     varchar(256)     not null comment 'icon uri',
    status       tinyint unsigned not null comment '0:未发布过, 1:已发布过',
    content_type tinyint unsigned not null comment '0用户 1官方',
    mode         tinyint unsigned not null comment '0:workflow, 3:chat_flow',
    created_at   bigint unsigned  not null comment 'create time in millisecond',
    updated_at   bigint unsigned  null comment 'update time in millisecond',
    deleted_at   datetime(3)      null comment 'delete time in millisecond',
    creator_id   bigint unsigned  not null comment 'user id for creator',
    tag          tinyint unsigned null comment 'template tag: Tag: 1=All, 2=Hot, 3=Information, 4=Music, 5=Picture, 6=UtilityTool, 7=Life, 8=Traval, 9=Network, 10=System, 11=Movie, 12=Office, 13=Shopping, 14=Education, 15=Health, 16=Social, 17=Entertainment, 18=Finance, 100=Hidden',
    author_id    bigint unsigned  not null comment '原作者用户 ID',
    space_id     bigint unsigned  not null comment ' 空间 ID',
    updater_id   bigint unsigned  null comment ' 更新元信息的用户 ID',
    source_id    bigint unsigned  null comment ' 复制来源的 workflow ID',
    app_id   bigint unsigned  null comment '应用 ID',
    latest_version varchar(50) null comment 'the version of the most recent publish',

    KEY `idx_creator_id` (creator_id),
    KEY `idx_app_id` (app_id),
    KEY `idx_source_id` (source_id),
    KEY `idx_published_time` (status),
    KEY `idx_space_id_app_id_mode_content_type` (space_id, app_id, mode, content_type)
);

