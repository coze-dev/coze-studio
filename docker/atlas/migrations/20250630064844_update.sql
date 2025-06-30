-- Create "app_conversion_template_draft" table
CREATE TABLE `opencoze`.`app_conversion_template_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `name` varchar(256) NOT NULL COMMENT "conversion name",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_name` (`name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_conversion_template_online" table
CREATE TABLE `opencoze`.`app_conversion_template_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `name` varchar(256) NOT NULL COMMENT "conversion name",
  `version` varchar(256) NOT NULL COMMENT "version name",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_name_version` (`name`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_dynamic_conversion_draft" table
CREATE TABLE `opencoze`.`app_dynamic_conversion_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `name` varchar(256) NOT NULL COMMENT "conversion name",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversion_id` bigint unsigned NOT NULL COMMENT "conversion id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_name_user_id_connector_id` (`name`, `user_id`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_dynamic_conversion_online" table
CREATE TABLE `opencoze`.`app_dynamic_conversion_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `name` varchar(256) NOT NULL COMMENT "conversion name",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversion_id` bigint unsigned NOT NULL COMMENT "conversion id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_name_user_id_connector_id` (`name`, `user_id`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_user_connector_conversion_draft" table
CREATE TABLE `opencoze`.`app_user_connector_conversion_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversion_id` bigint unsigned NOT NULL COMMENT "conversion id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_tmpl_id_user_id_connector_id` (`template_id`, `user_id`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_user_connector_conversion_online" table
CREATE TABLE `opencoze`.`app_user_connector_conversion_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversion_id` bigint unsigned NOT NULL COMMENT "conversion id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_tmpl_id_user_id_connector_id` (`template_id`, `user_id`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "chat_flow_role_config" table
CREATE TABLE `opencoze`.`chat_flow_role_config` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `name` varchar(256) NOT NULL COMMENT "role name",
  `description` mediumtext NOT NULL COMMENT "role description",
  `project_version` varchar(256) NOT NULL COMMENT "project_version",
  `avatar` varchar(256) NOT NULL COMMENT "avatar uri",
  `background_image_info` mediumtext NOT NULL COMMENT "background image information, object structure",
  `onboarding_info` mediumtext NOT NULL COMMENT "intro information, object structure",
  `suggest_reply_info` mediumtext NOT NULL COMMENT "user suggestions, object structure",
  `audio_config` mediumtext NOT NULL COMMENT "agent audio config, object structure",
  `user_input_config` varchar(256) NOT NULL COMMENT "user input config, object structure",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_workflow_id_version` (`workflow_id`, `project_version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
