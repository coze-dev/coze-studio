-- Modify "connector_workflow_version" table
ALTER TABLE `opencoze`.`connector_workflow_version` COMMENT "connector workflow version", RENAME INDEX `idx_connector_id_workflow_id_version` TO `uniq_connector_id_workflow_id_version`;
-- Modify "knowledge" table
ALTER TABLE `opencoze`.`knowledge` MODIFY COLUMN `name` varchar(150) NOT NULL DEFAULT "" COMMENT "knowledge_s name";
-- Modify "node_execution" table
ALTER TABLE `opencoze`.`node_execution` MODIFY COLUMN `composite_node_index` bigint unsigned NULL COMMENT "loop or batch_s execution index", MODIFY COLUMN `parent_node_id` varchar(128) NULL COMMENT "when as inner node for loop or batch, this is the parent node_s key" COLLATE utf8mb4_unicode_ci;
-- Modify "plugin_oauth_auth" table
ALTER TABLE `opencoze`.`plugin_oauth_auth` MODIFY COLUMN `access_token` text NULL COMMENT "Access Token", MODIFY COLUMN `refresh_token` text NULL COMMENT "Refresh Token";
-- Modify "single_agent_draft" table
ALTER TABLE `opencoze`.`single_agent_draft` MODIFY COLUMN `description` text NULL COMMENT "Agent Description";
-- Modify "single_agent_version" table
ALTER TABLE `opencoze`.`single_agent_version` MODIFY COLUMN `description` text NULL COMMENT "Agent Description";
-- Modify "workflow_draft" table
ALTER TABLE `opencoze`.`workflow_draft` MODIFY COLUMN `canvas` mediumtext NULL COMMENT "Front end schema";
-- Modify "workflow_snapshot" table
ALTER TABLE `opencoze`.`workflow_snapshot` MODIFY COLUMN `canvas` mediumtext NULL COMMENT "frontend schema for this snapshot";
-- Modify "workflow_version" table
ALTER TABLE `opencoze`.`workflow_version` MODIFY COLUMN `canvas` mediumtext NULL COMMENT "Front end schema";
