-- Create "app_conversation_template_draft" table
CREATE TABLE `opencoze`.`app_conversation_template_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `space_id` bigint unsigned NOT NULL COMMENT "space id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_space_id_app_id_template_id` (`space_id`, `app_id`, `template_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_conversation_template_online" table
CREATE TABLE `opencoze`.`app_conversation_template_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `space_id` bigint unsigned NOT NULL COMMENT "space id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `version` varchar(256) NOT NULL COMMENT "version name",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_space_id_app_id_template_id_version` (`space_id`, `app_id`, `template_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_dynamic_conversation_draft" table
CREATE TABLE `opencoze`.`app_dynamic_conversation_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id_connector_id_user_id` (`app_id`, `connector_id`, `user_id`),
  INDEX `idx_connector_id_user_id_name` (`connector_id`, `user_id`, `name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_dynamic_conversation_online" table
CREATE TABLE `opencoze`.`app_dynamic_conversation_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id_connector_id_user_id` (`app_id`, `connector_id`, `user_id`),
  INDEX `idx_connector_id_user_id_name` (`connector_id`, `user_id`, `name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_static_conversation_draft" table
CREATE TABLE `opencoze`.`app_static_conversation_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_user_id_template_id` (`connector_id`, `user_id`, `template_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_static_conversation_online" table
CREATE TABLE `opencoze`.`app_static_conversation_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_user_id_template_id` (`connector_id`, `user_id`, `template_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "chat_flow_role_config" table
CREATE TABLE `opencoze`.`chat_flow_role_config` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `connector_id` bigint unsigned NULL COMMENT "connector id",
  `name` varchar(256) NOT NULL COMMENT "role name",
  `description` mediumtext NOT NULL COMMENT "role description",
  `version` varchar(256) NOT NULL COMMENT "version",
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
  INDEX `idx_connector_id_version` (`connector_id`, `version`),
  INDEX `idx_workflow_id_version` (`workflow_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
