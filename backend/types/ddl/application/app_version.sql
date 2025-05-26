CREATE TABLE IF NOT EXISTS `app_version`
(
    `id`         bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'APP ID',
    `app_id`     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Application ID',
    `space_id`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Space ID',
    `owner_id`   bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Owner ID',
    `icon_uri`   varchar(512)        NOT NULL DEFAULT '' COMMENT 'Icon URI',
    `Name`       varchar(255)        NOT NULL DEFAULT '' COMMENT 'Application Name',
    `desc`       text COMMENT 'Application Description',
    `version`    varchar(255)        NOT NULL DEFAULT '' COMMENT 'Release Version',

    `created_at` bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT 'Create Time in Milliseconds',

    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_idx_app_version` (`app_id`, `version`)


) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci COMMENT = 'Application Version';