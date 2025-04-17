CREATE TABLE IF NOT EXISTS `tool`
(
    `id`              bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Tool ID',
    `plugin_id`       bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Plugin ID',
    `name`            varchar(512)        NOT NULL DEFAULT '' COMMENT 'Tool Name',
    `desc`            text COMMENT 'Tool Description',
    `icon_uri`        varchar(255)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `created_at`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at`      bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at`      bigint(20) unsigned COMMENT 'Delete Time in Milliseconds',

    `version`         varchar(255)        NOT NULL DEFAULT '' COMMENT 'Tool Version, e.g. v1.0.0',
    `sub_url_path`    varchar(512)        NOT NULL DEFAULT '' COMMENT 'Sub URL Path',
    `request_method`  tinyint unsigned    NOT NULL DEFAULT '0' COMMENT 'HTTP Request Method 1get 2post 3put 4delete',
    `request_params`  json COMMENT 'Tool Request Parameters',
    `response_params` json COMMENT 'Tool Response Parameters',
    `enabled_status`  tinyint unsigned    NOT NULL DEFAULT '0' COMMENT '0:enabled; 1:disabled',

    PRIMARY KEY (`id`),
    KEY `idx_tool_available` (`plugin_id`, `deleted_at`, `enabled_status`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Latest Tool';