-- Create "connector_workflow_version" table
CREATE TABLE `opencoze`.`connector_workflow_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `version` varchar(256) NOT NULL COMMENT "version",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_workflow_id_create_at` (`connector_id`, `workflow_id`, `created_at`),
  UNIQUE INDEX `idx_connector_id_workflow_id_version` (`connector_id`, `workflow_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
