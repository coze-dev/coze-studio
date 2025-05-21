CREATE TABLE IF NOT EXISTS `agent_to_database` (
   `id` bigint(20) unsigned NOT NULL COMMENT 'ID',
   `agent_id` bigint(20) unsigned NOT NULL COMMENT 'Agent ID',
   `database_id` bigint(20) unsigned NOT NULL COMMENT 'ID of database_info',
   `is_draft` tinyint(1) NOT NULL COMMENT 'Is draft',
   `prompt_disable` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Support prompt calls: 1 not supported, 0 supported',
   PRIMARY KEY (`id`),
   UNIQUE KEY `uniq_agent_db_draft` (`agent_id`,`database_id`,`is_draft`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='agent_to_database info';