CREATE TABLE IF NOT EXISTS `workflow_snapshot` (
                                     `workflow_id` bigint unsigned NOT NULL COMMENT 'workflow id this snapshot belongs to',
                                     `commit_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'the commit id of the workflow draft',
                                     `canvas` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'frontend schema for this snapshot',
                                     `created_at` bigint unsigned NOT NULL,
                                     PRIMARY KEY (`workflow_id`,`commit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='snapshot for executed workflow draft'

