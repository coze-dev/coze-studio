CREATE TABLE IF NOT EXISTS `workflow_reference` (
                                      `id` bigint unsigned NOT NULL COMMENT 'workflow id',
                                      `referred_id` bigint unsigned NOT NULL COMMENT 'the id of the workflow that is referred by other entities',
                                      `referring_id` bigint unsigned NOT NULL COMMENT 'the entity id that refers this workflow',
                                      `refer_type` tinyint unsigned NOT NULL COMMENT '1 subworkflow 2 tool',
                                      `referring_biz_type` tinyint unsigned NOT NULL COMMENT 'the biz type the referring entity belongs to: 1. workflow 2. agent',
                                      `created_at` bigint unsigned NOT NULL COMMENT 'create time in millisecond',
                                      `status` tinyint unsigned NOT NULL COMMENT 'whether this reference currently takes effect. 0: disabled 1: enabled',
                                      `deleted_at` datetime(3) DEFAULT NULL,
                                      PRIMARY KEY (`id`),
                                      UNIQUE KEY `uniq_referred_id_referring_id_refer_type` (`referred_id`,`referring_id`,`refer_type`),
                                      KEY `idx_referred_id_referring_biz_type_status` (`referred_id`,`referring_biz_type`,`status`),
                                      KEY `idx_referring_id_status` (`referring_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

