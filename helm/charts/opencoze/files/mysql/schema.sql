SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS opencoze COLLATE utf8mb4_unicode_ci;
-- Create "agent_to_database" table
CREATE TABLE IF NOT EXISTS `agent_to_database` (
  `id` bigint unsigned NOT NULL COMMENT "ID",
  `agent_id` bigint unsigned NOT NULL COMMENT "Agent ID",
  `database_id` bigint unsigned NOT NULL COMMENT "ID of database_info",
  `is_draft` bool NOT NULL COMMENT "Is draft",
  `prompt_disable` bool NOT NULL DEFAULT 0 COMMENT "Support prompt calls: 1 not supported, 0 supported",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_agent_db_draft` (`agent_id`, `database_id`, `is_draft`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "agent_to_database info";
-- Create "agent_tool_draft" table
CREATE TABLE IF NOT EXISTS `agent_tool_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `tool_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `tool_name` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Name",
  `tool_version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  PRIMARY KEY (`id`),
  INDEX `idx_agent_plugin_tool` (`agent_id`, `plugin_id`, `tool_id`),
  INDEX `idx_agent_tool_bind` (`agent_id`, `created_at`),
  UNIQUE INDEX `uniq_idx_agent_tool_id` (`agent_id`, `tool_id`),
  UNIQUE INDEX `uniq_idx_agent_tool_name` (`agent_id`, `tool_name`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Agent Tool";
-- Create "agent_tool_version" table
CREATE TABLE IF NOT EXISTS `agent_tool_version` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `tool_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `agent_version` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Tool Version",
  `tool_name` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Name",
  `tool_version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_agent_tool_id_created_at` (`agent_id`, `tool_id`, `created_at`),
  INDEX `idx_agent_tool_name_created_at` (`agent_id`, `tool_name`, `created_at`),
  UNIQUE INDEX `uniq_idx_agent_tool_id_agent_version` (`agent_id`, `tool_id`, `agent_version`),
  UNIQUE INDEX `uniq_idx_agent_tool_name_agent_version` (`agent_id`, `tool_name`, `agent_version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Agent Tool Version";
-- Create "api_key" table
CREATE TABLE IF NOT EXISTS `api_key` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `api_key` varchar(255) NOT NULL DEFAULT "" COMMENT "API Key hash",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "API Key Name",
  `status` tinyint NOT NULL DEFAULT 0 COMMENT "0 normal, 1 deleted",
  `user_id` bigint NOT NULL DEFAULT 0 COMMENT "API Key Owner",
  `expired_at` bigint NOT NULL DEFAULT 0 COMMENT "API Key Expired Time",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `last_used_at` bigint NOT NULL DEFAULT 0 COMMENT "Used Time in Milliseconds",
  PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "api key table";
-- Create "app_connector_release_ref" table
CREATE TABLE IF NOT EXISTS `app_connector_release_ref` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key",
  `record_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Record ID",
  `connector_id` bigint unsigned NULL COMMENT "Publish Connector ID",
  `publish_config` json NULL COMMENT "Publish Configuration",
  `publish_status` tinyint NOT NULL DEFAULT 0 COMMENT "Publish Status",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_record_connector` (`record_id`, `connector_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Connector Release Record Reference";
-- Create "app_draft" table
CREATE TABLE IF NOT EXISTS `app_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "APP ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `owner_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Owner ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Application Name",
  `description` text NULL COMMENT "Application Description",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Application";
-- Create "app_release_record" table
CREATE TABLE IF NOT EXISTS `app_release_record` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Record ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `owner_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Owner ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Application Name",
  `description` text NULL COMMENT "Application Description",
  `connector_ids` json NULL COMMENT "Publish Connector IDs",
  `extra_info` json NULL COMMENT "Publish Extra Info",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Release Version",
  `version_desc` text NULL COMMENT "Version Description",
  `publish_status` tinyint NOT NULL DEFAULT 0 COMMENT "Publish Status",
  `publish_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Time in Milliseconds",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_app_publish_at` (`app_id`, `publish_at`),
  UNIQUE INDEX `uniq_idx_app_version_connector` (`app_id`, `version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Application Release Record";
-- Create "connector_workflow_version" table
CREATE TABLE IF NOT EXISTS `connector_workflow_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `version` varchar(256) NOT NULL COMMENT "version",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_workflow_id_create_at` (`connector_id`, `workflow_id`, `created_at`),
  UNIQUE INDEX `idx_connector_id_workflow_id_version` (`connector_id`, `workflow_id`, `version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "conversation" table
CREATE TABLE IF NOT EXISTS `conversation` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "主键ID",
  `connector_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "业务线 ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "agent_id",
  `scene` tinyint NOT NULL DEFAULT 0 COMMENT "会话场景",
  `section_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "最新section_id",
  `creator_id` bigint unsigned NULL DEFAULT 0 COMMENT "创建者id",
  `ext` text NULL COMMENT "扩展字段",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "status: 1-normal 2-deleted",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "创建时间",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "更新时间",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_bot_status` (`connector_id`, `agent_id`, `creator_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "会话信息表";
-- Create "data_copy_task" table
CREATE TABLE IF NOT EXISTS `data_copy_task` (
  `master_task_id` varchar(128) NOT NULL DEFAULT "" COMMENT "复制任务ID",
  `origin_data_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "源id",
  `target_data_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "目标id",
  `origin_space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "源团队空间",
  `target_space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "目标团队空间",
  `origin_user_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "源用户ID",
  `target_user_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "目标用户ID",
  `origin_app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "源AppID",
  `target_app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "目标AppID",
  `data_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "数据类型 1:knowledge, 2:database",
  `ext_info` varchar(255) NOT NULL DEFAULT "" COMMENT "存储额外信息",
  `start_time` bigint NOT NULL DEFAULT 0 COMMENT "任务开始时间",
  `finish_time` bigint NULL COMMENT "任务结束时间",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "1:创建 2:执行中 3:成功 4:失败",
  `error_msg` varchar(128) NULL COMMENT "错误信息",
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_master_task_id_origin_data_id_data_type` (`master_task_id`, `origin_data_id`, `data_type`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "data方向复制任务记录表";
-- Create "draft_database_info" table
CREATE TABLE IF NOT EXISTS `draft_database_info` (
  `id` bigint unsigned NOT NULL COMMENT "ID",
  `app_id` bigint unsigned NULL COMMENT "App ID",
  `space_id` bigint unsigned NOT NULL COMMENT "Space ID",
  `related_online_id` bigint unsigned NOT NULL COMMENT "The primary key ID of online_database_info table",
  `is_visible` tinyint NOT NULL DEFAULT 1 COMMENT "Visibility: 0 invisible, 1 visible",
  `prompt_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Support prompt calls: 1 not supported, 0 supported",
  `table_name` varchar(255) NOT NULL COMMENT "Table name",
  `table_desc` varchar(256) NULL COMMENT "Table description",
  `table_field` text NULL COMMENT "Table field info",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `icon_uri` varchar(255) NOT NULL COMMENT "Icon Uri",
  `physical_table_name` varchar(255) NULL COMMENT "The name of the real physical table",
  `rw_mode` bigint NOT NULL DEFAULT 1 COMMENT "Read and write permission modes: 1. Limited read and write mode 2. Read-only mode 3. Full read and write mode",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_space_app_creator_deleted` (`space_id`, `app_id`, `creator_id`, `deleted_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "draft database info";
-- Create "knowledge" table
CREATE TABLE IF NOT EXISTS `knowledge` (
  `id` bigint unsigned NOT NULL COMMENT "主键ID",
  `name` varchar(150) NOT NULL DEFAULT "" COMMENT "名称",
  `app_id` bigint NOT NULL DEFAULT 0 COMMENT "项目ID，标识该资源是否是项目独有",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "空间ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time in Milliseconds",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "0 初始化, 1 生效 2 失效",
  `description` text NULL COMMENT "描述",
  `icon_uri` varchar(150) NULL COMMENT "头像uri",
  `format_type` tinyint NOT NULL DEFAULT 0 COMMENT "0:文本 1:表格 2:图片",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id` (`app_id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_space_id_deleted_at_updated_at` (`space_id`, `deleted_at`, `updated_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "知识库表";
-- Create "knowledge_document" table
CREATE TABLE IF NOT EXISTS `knowledge_document` (
  `id` bigint unsigned NOT NULL COMMENT "主键ID",
  `knowledge_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "所属knowledge的ID",
  `name` varchar(150) NOT NULL DEFAULT "" COMMENT "文档名称",
  `file_extension` varchar(20) NOT NULL DEFAULT "0" COMMENT "文档类型, txt/pdf/csv/...",
  `document_type` int NOT NULL DEFAULT 0 COMMENT "文档类型: 0:文本 1:表格 2:图片",
  `uri` text NULL COMMENT "资源uri",
  `size` bigint unsigned NOT NULL DEFAULT 0 COMMENT "文档大小",
  `slice_count` bigint unsigned NOT NULL DEFAULT 0 COMMENT "分片数量",
  `char_count` bigint unsigned NOT NULL DEFAULT 0 COMMENT "字符数",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "创建者ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "空间id",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time in Milliseconds",
  `source_type` int NOT NULL DEFAULT 0 COMMENT "0:本地文件上传, 2:自定义文本",
  `status` int NOT NULL DEFAULT 0 COMMENT "状态",
  `fail_reason` text NULL COMMENT "失败原因",
  `parse_rule` json NULL COMMENT "解析+切片规则",
  `table_info` json NULL COMMENT "表格信息",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_knowledge_id_deleted_at_updated_at` (`knowledge_id`, `deleted_at`, `updated_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "知识库文档表";
-- Create "knowledge_document_review" table
CREATE TABLE IF NOT EXISTS `knowledge_document_review` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "主键ID",
  `knowledge_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "knowledge id",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "空间id",
  `name` varchar(150) NOT NULL DEFAULT "" COMMENT "文档名称",
  `type` varchar(10) NOT NULL DEFAULT "0" COMMENT "文档类型",
  `uri` text NULL COMMENT "资源标识",
  `format_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0 文本, 1 表格, 2 图片",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0 处理中，1 已完成，2 失败，3 失效",
  `chunk_resp_uri` text NULL COMMENT "预切片tos资源标识",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time in Milliseconds",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "创建者ID",
  PRIMARY KEY (`id`),
  INDEX `idx_dataset_id` (`knowledge_id`, `status`, `updated_at`),
  INDEX `idx_uri` (`uri` (100))
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "文档审阅表";
-- Create "knowledge_document_slice" table
CREATE TABLE IF NOT EXISTS `knowledge_document_slice` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "主键ID",
  `knowledge_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "knowledge id",
  `document_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "document id",
  `content` text NULL COMMENT "切片内容",
  `sequence` decimal(20,5) NOT NULL COMMENT "切片顺序号, 从1开始",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time in Milliseconds",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "创建者ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "空间ID",
  `status` int NOT NULL DEFAULT 0 COMMENT "状态",
  `fail_reason` text NULL COMMENT "失败原因",
  `hit` bigint unsigned NOT NULL DEFAULT 0 COMMENT "命中次数",
  PRIMARY KEY (`id`),
  INDEX `idx_document_id_deleted_at_sequence` (`document_id`, `deleted_at`, `sequence`),
  INDEX `idx_knowledge_id_document_id` (`knowledge_id`, `document_id`),
  INDEX `idx_sequence` (`sequence`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "知识库文件切片表";
-- Create "message" table
CREATE TABLE IF NOT EXISTS `message` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "主键ID",
  `run_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "对应的run_id",
  `conversation_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "conversation id",
  `user_id` varchar(60) NOT NULL DEFAULT "" COMMENT "user id",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "agent_id",
  `role` varchar(100) NOT NULL DEFAULT "" COMMENT "角色: user、assistant、system",
  `content_type` varchar(100) NOT NULL DEFAULT "" COMMENT "内容类型 1 text",
  `content` mediumtext NULL COMMENT "内容",
  `message_type` varchar(100) NOT NULL DEFAULT "" COMMENT "消息类型：",
  `display_content` text NULL COMMENT "展示内容",
  `ext` text NULL COMMENT "message 扩展字段" COLLATE utf8mb4_general_ci,
  `section_id` bigint unsigned NULL COMMENT "段落id",
  `broken_position` int NULL DEFAULT -1 COMMENT "打断位置",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "消息状态 1 Available 2 Deleted 3 Replaced 4 Broken 5 Failed 6 Streaming 7 Pending",
  `model_content` mediumtext NULL COMMENT "模型输入内容",
  `meta_info` text NULL COMMENT "引用、高亮等文本标记信息",
  `reasoning_content` text NULL COMMENT "思考内容" COLLATE utf8mb4_general_ci,
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "创建时间",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "更新时间",
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_run_id` (`run_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "消息表";
-- Create "model_entity" table
CREATE TABLE IF NOT EXISTS `model_entity` (
  `id` bigint unsigned NOT NULL COMMENT "主键ID",
  `meta_id` bigint unsigned NOT NULL COMMENT "模型元信息 id",
  `name` varchar(128) NOT NULL COMMENT "名称",
  `description` text NULL COMMENT "描述",
  `default_params` json NULL COMMENT "默认参数",
  `scenario` bigint unsigned NOT NULL COMMENT "模型应用场景",
  `status` int NOT NULL DEFAULT 1 COMMENT "模型状态",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` bigint unsigned NULL COMMENT "Delete Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_scenario` (`scenario`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "模型信息";
-- Create "model_meta" table
CREATE TABLE IF NOT EXISTS `model_meta` (
  `id` bigint unsigned NOT NULL COMMENT "主键ID",
  `model_name` varchar(128) NOT NULL COMMENT "模型名称",
  `protocol` varchar(128) NOT NULL COMMENT "模型协议",
  `icon_uri` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `capability` json NULL COMMENT "模型能力",
  `conn_config` json NULL COMMENT "模型连接配置",
  `status` int NOT NULL DEFAULT 1 COMMENT "模型状态",
  `description` varchar(2048) NOT NULL DEFAULT "" COMMENT "模型描述",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` bigint unsigned NULL COMMENT "Delete Time in Milliseconds",
  `icon_url` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URL",
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "模型元信息";
-- Create "node_execution" table
CREATE TABLE IF NOT EXISTS `node_execution` (
  `id` bigint unsigned NOT NULL COMMENT "node execution id",
  `execute_id` bigint unsigned NOT NULL COMMENT "the workflow execute id this node execution belongs to",
  `node_id` varchar(128) NOT NULL COMMENT "node key" COLLATE utf8mb4_unicode_ci,
  `node_name` varchar(128) NOT NULL COMMENT "name of the node" COLLATE utf8mb4_unicode_ci,
  `node_type` varchar(128) NOT NULL COMMENT "the type of the node, in string" COLLATE utf8mb4_unicode_ci,
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `status` tinyint unsigned NOT NULL COMMENT "1=waiting 2=running 3=success 4=fail",
  `duration` bigint unsigned NULL COMMENT "execution duration in millisecond",
  `input` mediumtext NULL COMMENT "actual input of the node" COLLATE utf8mb4_unicode_ci,
  `output` mediumtext NULL COMMENT "actual output of the node" COLLATE utf8mb4_unicode_ci,
  `raw_output` mediumtext NULL COMMENT "the original output of the node" COLLATE utf8mb4_unicode_ci,
  `error_info` mediumtext NULL COMMENT "error info" COLLATE utf8mb4_unicode_ci,
  `error_level` varchar(32) NULL COMMENT "level of the error" COLLATE utf8mb4_unicode_ci,
  `input_tokens` bigint unsigned NULL COMMENT "number of input tokens",
  `output_tokens` bigint unsigned NULL COMMENT "number of output tokens",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `composite_node_index` bigint unsigned NULL COMMENT "loop or batch's execution index",
  `composite_node_items` mediumtext NULL COMMENT "the items extracted from parent composite node for this index" COLLATE utf8mb4_unicode_ci,
  `parent_node_id` varchar(128) NULL COMMENT "when as inner node for loop or batch, this is the parent node's key" COLLATE utf8mb4_unicode_ci,
  `sub_execute_id` bigint unsigned NULL COMMENT "if this node is sub_workflow, the exe id of the sub workflow",
  `extra` mediumtext NULL COMMENT "extra info" COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  INDEX `idx_execute_id_node_id` (`execute_id`, `node_id`),
  INDEX `idx_execute_id_parent_node_id` (`execute_id`, `parent_node_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT "node 节点运行记录，用于记录每次workflow执行时，每个节点的状态信息";
-- Create "online_database_info" table
CREATE TABLE IF NOT EXISTS `online_database_info` (
  `id` bigint unsigned NOT NULL COMMENT "ID",
  `app_id` bigint unsigned NULL COMMENT "App ID",
  `space_id` bigint unsigned NOT NULL COMMENT "Space ID",
  `related_draft_id` bigint unsigned NOT NULL COMMENT "The primary key ID of draft_database_info table",
  `is_visible` tinyint NOT NULL DEFAULT 1 COMMENT "Visibility: 0 invisible, 1 visible",
  `prompt_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Support prompt calls: 1 not supported, 0 supported",
  `table_name` varchar(255) NOT NULL COMMENT "Table name",
  `table_desc` varchar(256) NULL COMMENT "Table description",
  `table_field` text NULL COMMENT "Table field info",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `icon_uri` varchar(255) NOT NULL COMMENT "Icon Uri",
  `physical_table_name` varchar(255) NULL COMMENT "The name of the real physical table",
  `rw_mode` bigint NOT NULL DEFAULT 1 COMMENT "Read and write permission modes: 1. Limited read and write mode 2. Read-only mode 3. Full read and write mode",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_space_app_creator_deleted` (`space_id`, `app_id`, `creator_id`, `deleted_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "online database info";
-- Create "plugin" table
CREATE TABLE IF NOT EXISTS `plugin` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `developer_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Developer ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `server_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Server URL",
  `plugin_type` tinyint NOT NULL DEFAULT 0 COMMENT "Plugin Type, 1:http, 6:local",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Plugin Version, e.g. v1.0.0",
  `version_desc` text NULL COMMENT "Plugin Version Description",
  `manifest` json NULL COMMENT "Plugin Manifest",
  `openapi_doc` json NULL COMMENT "OpenAPI Document, only stores the root",
  PRIMARY KEY (`id`),
  INDEX `idx_space_created_at` (`space_id`, `created_at`),
  INDEX `idx_space_updated_at` (`space_id`, `updated_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Latest Plugin";
-- Create "plugin_draft" table
CREATE TABLE IF NOT EXISTS `plugin_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `developer_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Developer ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `server_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Server URL",
  `plugin_type` tinyint NOT NULL DEFAULT 0 COMMENT "Plugin Type, 1:http, 6:local",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  `manifest` json NULL COMMENT "Plugin Manifest",
  `openapi_doc` json NULL COMMENT "OpenAPI Document, only stores the root",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id` (`app_id`, `id`),
  INDEX `idx_space_app_created_at` (`space_id`, `app_id`, `created_at`),
  INDEX `idx_space_app_updated_at` (`space_id`, `app_id`, `updated_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Plugin";
-- Create "plugin_oauth_auth" table
CREATE TABLE IF NOT EXISTS `plugin_oauth_auth` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key",
  `user_id` varchar(255) NOT NULL DEFAULT "" COMMENT "User ID",
  `plugin_id` bigint NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `is_draft` bool NOT NULL DEFAULT 0 COMMENT "Is Draft Plugin",
  `oauth_config` json NULL COMMENT "Authorization Code OAuth Config",
  `access_token` text NOT NULL COMMENT "Access Token",
  `refresh_token` text NOT NULL COMMENT "Refresh Token",
  `token_expired_at` bigint NULL COMMENT "Token Expired in Milliseconds",
  `next_token_refresh_at` bigint NULL COMMENT "Next Token Refresh Time in Milliseconds",
  `last_active_at` bigint NULL COMMENT "Last active time in Milliseconds",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_last_active_at` (`last_active_at`),
  INDEX `idx_last_token_expired_at` (`token_expired_at`),
  INDEX `idx_next_token_refresh_at` (`next_token_refresh_at`),
  UNIQUE INDEX `uniq_idx_user_plugin_is_draft` (`user_id`, `plugin_id`, `is_draft`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Plugin OAuth Authorization Code Info";
-- Create "plugin_version" table
CREATE TABLE IF NOT EXISTS `plugin_version` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `developer_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Developer ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `server_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Server URL",
  `plugin_type` tinyint NOT NULL DEFAULT 0 COMMENT "Plugin Type, 1:http, 6:local",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Plugin Version, e.g. v1.0.0",
  `version_desc` text NULL COMMENT "Plugin Version Description",
  `manifest` json NULL COMMENT "Plugin Manifest",
  `openapi_doc` json NULL COMMENT "OpenAPI Document, only stores the root",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_idx_plugin_version` (`plugin_id`, `version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Plugin Version";
-- Create "prompt_resource" table
CREATE TABLE IF NOT EXISTS `prompt_resource` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "主键ID",
  `space_id` bigint NOT NULL COMMENT "空间ID",
  `name` varchar(255) NOT NULL COMMENT "名称",
  `description` varchar(255) NOT NULL COMMENT "描述",
  `prompt_text` mediumtext NULL COMMENT "prompt正文",
  `status` int NOT NULL COMMENT "状态,0无效,1有效",
  `creator_id` bigint NOT NULL COMMENT "创建者ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "创建时间",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "更新时间",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT "prompt_resource";
-- Create "run_record" table
CREATE TABLE IF NOT EXISTS `run_record` (
  `id` bigint unsigned NOT NULL COMMENT "主键ID",
  `conversation_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "会话 ID",
  `section_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "section ID",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "agent_id",
  `user_id` varchar(255) NOT NULL DEFAULT "" COMMENT "user id",
  `source` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "执行来源 0 API,",
  `status` varchar(255) NOT NULL DEFAULT "" COMMENT "状态,0 Unknown, 1-Created,2-InProgress,3-Completed,4-Failed,5-Expired,6-Cancelled,7-RequiresAction",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "创建者标识",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "创建时间",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "更新时间",
  `failed_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "失败时间",
  `last_error` text NULL COMMENT "error message" COLLATE utf8mb4_general_ci,
  `completed_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "结束时间",
  `chat_request` text NULL COMMENT "保存原始请求的部分字段" COLLATE utf8mb4_general_ci,
  `ext` text NULL COMMENT "扩展字段" COLLATE utf8mb4_general_ci,
  `usage` json NULL COMMENT "usage",
  PRIMARY KEY (`id`),
  INDEX `idx_c_s` (`conversation_id`, `section_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "执行记录表";
-- Create "shortcut_command" table
CREATE TABLE IF NOT EXISTS `shortcut_command` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "主键ID",
  `object_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "实体ID,该实体可用这个指令",
  `command_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "命令ID",
  `command_name` varchar(255) NOT NULL DEFAULT "" COMMENT "命令名称",
  `shortcut_command` varchar(255) NOT NULL DEFAULT "" COMMENT "快捷指令",
  `description` varchar(2000) NOT NULL DEFAULT "" COMMENT "命令描述",
  `send_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "发送类型 0:query 1:panel",
  `tool_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "使用工具的type 1:workFlow 2:插件",
  `work_flow_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "使用workFlow的id",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "使用插件的id",
  `plugin_tool_name` varchar(255) NOT NULL DEFAULT "" COMMENT "使用插件的api_name",
  `template_query` text NULL COMMENT "query模板",
  `components` json NULL COMMENT "panel参数",
  `card_schema` text NULL COMMENT "卡片schema",
  `tool_info` json NULL COMMENT "工具信息 包含name+变量列表",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "状态,0无效,1有效",
  `creator_id` bigint unsigned NULL DEFAULT 0 COMMENT "创建者ID",
  `is_online` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "是否为线上信息 0草稿 1线上",
  `created_at` bigint NOT NULL DEFAULT 0 COMMENT "创建时间",
  `updated_at` bigint NOT NULL DEFAULT 0 COMMENT "更新时间",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "multi的指令时，该指令由哪个节点执行",
  `shortcut_icon` json NULL COMMENT "快捷指令图标",
  `plugin_tool_id` bigint NOT NULL DEFAULT 0 COMMENT "tool_id",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_object_command_id_type` (`object_id`, `command_id`, `is_online`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "bot快捷指令表";
-- Create "single_agent_draft" table
CREATE TABLE IF NOT EXISTS `single_agent_draft` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "Space ID",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Name",
  `description` text NOT NULL COMMENT "Agent Description",
  `icon_uri` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  `variables_meta_id` bigint NULL COMMENT "variables meta 表 ID",
  `model_info` json NULL COMMENT "Model Configuration Information",
  `onboarding_info` json NULL COMMENT "Onboarding Information",
  `prompt` json NULL COMMENT "Agent Prompt Configuration",
  `plugin` json NULL COMMENT "Agent Plugin Base Configuration",
  `knowledge` json NULL COMMENT "Agent Knowledge Base Configuration",
  `workflow` json NULL COMMENT "Agent Workflow Configuration",
  `suggest_reply` json NULL COMMENT "Suggested Replies",
  `jump_config` json NULL COMMENT "Jump Configuration",
  `background_image_info_list` json NULL COMMENT "Background image",
  `database_config` json NULL COMMENT "Agent Database Base Configuration",
  `shortcut_command` json NULL COMMENT "shortcut command",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  UNIQUE INDEX `uniq_agent_id` (`agent_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Single Agent Draft Copy Table";
-- Create "single_agent_publish" table
CREATE TABLE IF NOT EXISTS `single_agent_publish` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "主键id",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "agent_id",
  `publish_id` varchar(50) NOT NULL DEFAULT "" COMMENT "发布 id" COLLATE utf8mb4_general_ci,
  `connector_ids` json NULL COMMENT "发布的 connector_ids",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Version",
  `publish_info` text NULL COMMENT "发布信息" COLLATE utf8mb4_general_ci,
  `publish_time` bigint unsigned NOT NULL DEFAULT 0 COMMENT "发布时间",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "发布人 user_id",
  `status` tinyint NOT NULL DEFAULT 0 COMMENT "状态 0:使用中 1:删除 3:禁用",
  `extra` json NULL COMMENT "扩展字段",
  PRIMARY KEY (`id`),
  INDEX `idx_agent_id_version` (`agent_id`, `version`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_publish_id` (`publish_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "bot 渠道和发布版本流水表";
-- Create "single_agent_version" table
CREATE TABLE IF NOT EXISTS `single_agent_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "Space ID",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Name",
  `description` text NOT NULL COMMENT "Agent Description",
  `icon_uri` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  `variables_meta_id` bigint NULL COMMENT "variables meta 表 ID",
  `model_info` json NULL COMMENT "Model Configuration Information",
  `onboarding_info` json NULL COMMENT "Onboarding Information",
  `prompt` json NULL COMMENT "Agent Prompt Configuration",
  `plugin` json NULL COMMENT "Agent Plugin Base Configuration",
  `knowledge` json NULL COMMENT "Agent Knowledge Base Configuration",
  `workflow` json NULL COMMENT "Agent Workflow Configuration",
  `suggest_reply` json NULL COMMENT "Suggested Replies",
  `jump_config` json NULL COMMENT "Jump Configuration",
  `connector_id` bigint unsigned NOT NULL COMMENT "Connector ID",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Version",
  `background_image_info_list` json NULL COMMENT "Background image",
  `database_config` json NULL COMMENT "Agent Database Base Configuration",
  `shortcut_command` json NULL COMMENT "shortcut command",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  UNIQUE INDEX `uniq_agent_id_and_version_connector_id` (`agent_id`, `version`, `connector_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Single Agent Version Copy Table";
-- Create "space" table
CREATE TABLE IF NOT EXISTS `space` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID, Space ID",
  `owner_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Owner ID",
  `name` varchar(200) NOT NULL DEFAULT "" COMMENT "Space Name",
  `description` varchar(2000) NOT NULL DEFAULT "" COMMENT "Space Description",
  `icon_uri` varchar(200) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation Time (Milliseconds)",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time (Milliseconds)",
  `deleted_at` bigint unsigned NULL COMMENT "Deletion Time (Milliseconds)",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_owner_id` (`owner_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Space Table";
-- Create "space_user" table
CREATE TABLE IF NOT EXISTS `space_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID, Auto Increment",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `user_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "User ID",
  `role_type` int NOT NULL DEFAULT 3 COMMENT "Role Type: 1.owner 2.admin 3.member",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation Time (Milliseconds)",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time (Milliseconds)",
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE INDEX `uniq_space_user` (`space_id`, `user_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Space Member Table";
-- Create "template" table
CREATE TABLE IF NOT EXISTS `template` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `workflow_id` bigint NOT NULL DEFAULT 0 COMMENT "Workflow ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "Space ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `heat` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Heat",
  `product_entity_type` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Product Entity Type",
  `meta_info` json NULL COMMENT "Meta Info",
  `agent_extra` json NULL COMMENT "Agent Extra Info",
  `workflow_extra` json NULL COMMENT "Workflow Extra Info",
  `project_extra` json NULL COMMENT "Project Extra Info",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_agent_id` (`agent_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Template Info Table";
-- Create "tool" table
CREATE TABLE IF NOT EXISTS `tool` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `activated_status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0:activated; 1:deactivated",
  PRIMARY KEY (`id`),
  INDEX `idx_plugin_activated_status` (`plugin_id`, `activated_status`),
  UNIQUE INDEX `uniq_idx_plugin_sub_url_method` (`plugin_id`, `sub_url`, `method`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Latest Tool";
-- Create "tool_draft" table
CREATE TABLE IF NOT EXISTS `tool_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `debug_status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0:not pass; 1:pass",
  `activated_status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0:activated; 1:deactivated",
  PRIMARY KEY (`id`),
  INDEX `idx_plugin_created_at_id` (`plugin_id`, `created_at`, `id`),
  UNIQUE INDEX `uniq_idx_plugin_sub_url_method` (`plugin_id`, `sub_url`, `method`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Tool";
-- Create "tool_version" table
CREATE TABLE IF NOT EXISTS `tool_version` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `tool_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_idx_tool_version` (`tool_id`, `version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Tool Version";
-- Create "user" table
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `name` varchar(128) NOT NULL DEFAULT "" COMMENT "User Nickname",
  `unique_name` varchar(128) NOT NULL DEFAULT "" COMMENT "User Unique Name",
  `email` varchar(128) NOT NULL DEFAULT "" COMMENT "Email",
  `password` varchar(128) NOT NULL DEFAULT "" COMMENT "Password (Encrypted)",
  `description` varchar(512) NOT NULL DEFAULT "" COMMENT "User Description",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Avatar URI",
  `user_verified` bool NOT NULL DEFAULT 0 COMMENT "User Verification Status",
  `locale` varchar(128) NOT NULL DEFAULT "" COMMENT "Locale",
  `session_key` varchar(256) NOT NULL DEFAULT "" COMMENT "Session Key",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation Time (Milliseconds)",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time (Milliseconds)",
  `deleted_at` bigint unsigned NULL COMMENT "Deletion Time (Milliseconds)",
  PRIMARY KEY (`id`),
  INDEX `idx_session_key` (`session_key`),
  UNIQUE INDEX `uniq_email` (`email`),
  UNIQUE INDEX `uniq_unique_name` (`unique_name`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "User Table";
-- Create "variable_instance" table
CREATE TABLE IF NOT EXISTS `variable_instance` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "主键ID",
  `biz_type` tinyint unsigned NOT NULL COMMENT "1 for agent，2 for app",
  `biz_id` varchar(128) NOT NULL DEFAULT "" COMMENT "1 for agent_id，2 for app_id",
  `version` varchar(255) NOT NULL COMMENT "agent or project 版本,为空代表草稿态",
  `keyword` varchar(255) NOT NULL COMMENT "记忆的KEY",
  `type` tinyint NOT NULL COMMENT "记忆类型 1 KV 2 list",
  `content` text NULL COMMENT "记忆内容",
  `connector_uid` varchar(255) NOT NULL COMMENT "二方用户ID",
  `connector_id` bigint NOT NULL COMMENT "二方id, e.g. coze = 10000010",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "创建时间",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "更新时间",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_key` (`biz_id`, `biz_type`, `version`, `connector_uid`, `connector_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT "KV Memory";
-- Create "variables_meta" table
CREATE TABLE IF NOT EXISTS `variables_meta` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "主键ID",
  `creator_id` bigint unsigned NOT NULL COMMENT "创建者ID",
  `biz_type` tinyint unsigned NOT NULL COMMENT "1 for agent，2 for app",
  `biz_id` varchar(128) NOT NULL DEFAULT "" COMMENT "1 for agent_id，2 for app_id",
  `variable_list` json NULL COMMENT "变量配置的json数据",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "create time",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "update time",
  `version` varchar(255) NOT NULL COMMENT "project版本,为空代表草稿态",
  PRIMARY KEY (`id`),
  INDEX `idx_user_key` (`creator_id`),
  UNIQUE INDEX `uniq_project_key` (`biz_id`, `biz_type`, `version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT "KV Memory meta";
-- Create "workflow_draft" table
CREATE TABLE IF NOT EXISTS `workflow_draft` (
  `id` bigint unsigned NOT NULL COMMENT "workflow ID",
  `canvas` mediumtext NOT NULL COMMENT "前端 schema",
  `input_params` mediumtext NULL COMMENT " 入参 schema",
  `output_params` mediumtext NULL COMMENT " 出参 schema",
  `test_run_success` bool NOT NULL DEFAULT 0 COMMENT "0 未运行, 1 运行成功",
  `modified` bool NOT NULL DEFAULT 0 COMMENT "0 未被修改, 1 已被修改",
  `updated_at` bigint unsigned NULL,
  `deleted_at` datetime(3) NULL,
  `commit_id` varchar(255) NOT NULL COMMENT "used to uniquely identify a draft snapshot",
  PRIMARY KEY (`id`),
  INDEX `idx_updated_at` (`updated_at` DESC)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "workflow 画布草稿表，用于记录workflow最新的草稿画布信息";
-- Create "workflow_execution" table
CREATE TABLE IF NOT EXISTS `workflow_execution` (
  `id` bigint unsigned NOT NULL COMMENT "execute id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow_id",
  `version` varchar(50) NULL COMMENT "workflow version. empty if is draft",
  `space_id` bigint unsigned NOT NULL COMMENT "the space id the workflow belongs to",
  `mode` tinyint unsigned NOT NULL COMMENT "the execution mode: 1. debug run 2. release run 3. node debug",
  `operator_id` bigint unsigned NOT NULL COMMENT "the user id that runs this workflow",
  `connector_id` bigint unsigned NULL COMMENT "the connector on which this execution happened",
  `connector_uid` varchar(64) NULL COMMENT "user id of the connector",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `log_id` varchar(128) NULL COMMENT "log id",
  `status` tinyint unsigned NULL COMMENT "1=running 2=success 3=fail 4=interrupted",
  `duration` bigint unsigned NULL COMMENT "execution duration in millisecond",
  `input` mediumtext NULL COMMENT "actual input of this execution",
  `output` mediumtext NULL COMMENT "the actual output of this execution",
  `error_code` varchar(255) NULL COMMENT "error code if any",
  `fail_reason` mediumtext NULL COMMENT "the reason for failure",
  `input_tokens` bigint unsigned NULL COMMENT "number of input tokens",
  `output_tokens` bigint unsigned NULL COMMENT "number of output tokens",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `root_execution_id` bigint unsigned NULL COMMENT "the top level execution id. Null if this is the root",
  `parent_node_id` varchar(128) NULL COMMENT "the node key for the sub_workflow node that executes this workflow",
  `app_id` bigint unsigned NULL COMMENT "app id this workflow execution belongs to",
  `node_count` mediumint unsigned NULL COMMENT "the total node count of the workflow",
  `resume_event_id` bigint unsigned NULL COMMENT "the current event ID which is resuming",
  `agent_id` bigint unsigned NULL COMMENT "the agent that this execution binds to",
  `sync_pattern` tinyint unsigned NULL COMMENT "the sync pattern 1. sync 2. async 3. stream",
  `commit_id` varchar(255) NULL COMMENT "draft commit id this execution belongs to",
  PRIMARY KEY (`id`),
  INDEX `idx_workflow_id_version_mode_created_at` (`workflow_id`, `version`, `mode`, `created_at`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "workflow 执行记录表，用于记录每次workflow执行时的状态";
-- Create "workflow_meta" table
CREATE TABLE IF NOT EXISTS `workflow_meta` (
  `id` bigint unsigned NOT NULL COMMENT "workflow id",
  `name` varchar(256) NOT NULL COMMENT "workflow name",
  `description` varchar(2000) NOT NULL COMMENT "workflow description",
  `icon_uri` varchar(256) NOT NULL COMMENT "icon uri",
  `status` tinyint unsigned NOT NULL COMMENT "0:未发布过, 1:已发布过",
  `content_type` tinyint unsigned NOT NULL COMMENT "0用户 1官方",
  `mode` tinyint unsigned NOT NULL COMMENT "0:workflow, 3:chat_flow",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  `creator_id` bigint unsigned NOT NULL COMMENT "user id for creator",
  `tag` tinyint unsigned NULL COMMENT "template tag: Tag: 1=All, 2=Hot, 3=Information, 4=Music, 5=Picture, 6=UtilityTool, 7=Life, 8=Traval, 9=Network, 10=System, 11=Movie, 12=Office, 13=Shopping, 14=Education, 15=Health, 16=Social, 17=Entertainment, 18=Finance, 100=Hidden",
  `author_id` bigint unsigned NOT NULL COMMENT "原作者用户 ID",
  `space_id` bigint unsigned NOT NULL COMMENT " 空间 ID",
  `updater_id` bigint unsigned NULL COMMENT " 更新元信息的用户 ID",
  `source_id` bigint unsigned NULL COMMENT " 复制来源的 workflow ID",
  `app_id` bigint unsigned NULL COMMENT "应用 ID",
  `latest_version` varchar(50) NULL COMMENT "the version of the most recent publish",
  `latest_version_ts` bigint unsigned NULL COMMENT "create time of latest version",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id` (`app_id`),
  INDEX `idx_latest_version_ts` (`latest_version_ts` DESC),
  INDEX `idx_space_id_app_id_status_latest_version_ts` (`space_id`, `app_id`, `status`, `latest_version_ts`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "workflow 元信息表，用于记录workflow基本的元信息";
-- Create "workflow_reference" table
CREATE TABLE IF NOT EXISTS `workflow_reference` (
  `id` bigint unsigned NOT NULL COMMENT "workflow id",
  `referred_id` bigint unsigned NOT NULL COMMENT "the id of the workflow that is referred by other entities",
  `referring_id` bigint unsigned NOT NULL COMMENT "the entity id that refers this workflow",
  `refer_type` tinyint unsigned NOT NULL COMMENT "1 subworkflow 2 tool",
  `referring_biz_type` tinyint unsigned NOT NULL COMMENT "the biz type the referring entity belongs to: 1. workflow 2. agent",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `status` tinyint unsigned NOT NULL COMMENT "whether this reference currently takes effect. 0: disabled 1: enabled",
  `deleted_at` datetime(3) NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_referred_id_referring_biz_type_status` (`referred_id`, `referring_biz_type`, `status`),
  INDEX `idx_referring_id_status` (`referring_id`, `status`),
  UNIQUE INDEX `uniq_referred_id_referring_id_refer_type` (`referred_id`, `referring_id`, `refer_type`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "workflow 关联关系表，用于记录workflow 直接互相引用关系";
-- Create "workflow_snapshot" table
CREATE TABLE IF NOT EXISTS `workflow_snapshot` (
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id this snapshot belongs to",
  `commit_id` varchar(255) NOT NULL COMMENT "the commit id of the workflow draft",
  `canvas` mediumtext NOT NULL COMMENT "frontend schema for this snapshot",
  `input_params` mediumtext NULL COMMENT "input parameter info",
  `output_params` mediumtext NULL COMMENT "output parameter info",
  `created_at` bigint unsigned NOT NULL,
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_workflow_id_commit_id` (`workflow_id`, `commit_id`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "snapshot for executed workflow draft";
-- Create "workflow_version" table
CREATE TABLE IF NOT EXISTS `workflow_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `version` varchar(50) NOT NULL COMMENT "发布版本",
  `version_description` varchar(2000) NOT NULL COMMENT "版本描述",
  `canvas` mediumtext NOT NULL COMMENT "前端 schema",
  `input_params` mediumtext NULL,
  `output_params` mediumtext NULL,
  `creator_id` bigint unsigned NOT NULL COMMENT "发布用户 ID",
  `created_at` bigint unsigned NOT NULL COMMENT "创建时间毫秒时间戳",
  `deleted_at` datetime(3) NULL COMMENT "删除毫秒时间戳",
  `commit_id` varchar(255) NOT NULL COMMENT "the commit id corresponding to this version",
  PRIMARY KEY (`id`),
  INDEX `idx_id_created_at` (`workflow_id`, `created_at`),
  UNIQUE INDEX `uniq_workflow_id_version` (`workflow_id`, `version`)
) ENGINE=InnoDB CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "workflow 画布版本信息表，用于记录不同版本的画布信息";
