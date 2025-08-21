-- Add folder management tables for library resource organization
-- Create "folder" table
CREATE TABLE `opencoze`.`folder` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Folder ID",
    `space_id` bigint unsigned NOT NULL COMMENT "Space ID",
    `parent_id` bigint unsigned NULL COMMENT "Parent Folder ID, NULL for root folder",
    `name` varchar(255) NOT NULL COMMENT "Folder Name",
    `description` varchar(1000) NOT NULL DEFAULT "" COMMENT "Folder Description",
    `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID",
    `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
    `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
    `deleted_at` datetime(3) NULL COMMENT "Delete Time",
    PRIMARY KEY (`id`),
    INDEX `idx_space_id_parent_id_deleted_at` (`space_id`, `parent_id`, `deleted_at`),
    INDEX `idx_creator_id` (`creator_id`),
    UNIQUE INDEX `uniq_space_parent_name_deleted` (`space_id`, `parent_id`, `name`, `deleted_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Folder Table for Library Resource Organization";

-- Create "resource_folder_mapping" table
CREATE TABLE `opencoze`.`resource_folder_mapping` (
    `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
    `space_id` bigint unsigned NOT NULL COMMENT "Space ID",
    `resource_id` bigint unsigned NOT NULL COMMENT "Resource ID (workflow_id, knowledge_id, etc.)",
    `resource_type` tinyint unsigned NOT NULL COMMENT "Resource Type: 1=agent, 2=workflow, 3=knowledge, 4=database, 5=plugin",
    `folder_id` bigint unsigned NOT NULL COMMENT "Folder ID",
    `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
    `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
    PRIMARY KEY (`id`),
    INDEX `idx_space_id_folder_id` (`space_id`, `folder_id`),
    INDEX `idx_resource_id_type` (`resource_id`, `resource_type`),
    UNIQUE INDEX `uniq_resource_mapping` (`resource_id`, `resource_type`, `space_id`),
    FOREIGN KEY (`folder_id`) REFERENCES `folder` (`id`) ON DELETE CASCADE
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Resource to Folder Mapping Table";