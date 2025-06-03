CREATE TABLE IF NOT EXISTS `app_draft`
(
    `id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'APP ID',
    `space_id`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `owner_id`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Owner ID',
    `icon_uri`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `Name`       varchar(255)        NOT NULL DEFAULT '' COMMENT 'Application Name',
    `desc`       text COMMENT 'Application Description',
    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',
    `updated_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Update Time in Milliseconds',
    `deleted_at` datetime COMMENT 'Delete Time',

    PRIMARY KEY (`id`)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Draft Application';