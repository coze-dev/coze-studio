table "agent_to_database" {
  schema  = schema.opencoze
  comment = "agent_to_database info"
  collate = "utf8mb4_general_ci"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "ID"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Agent ID"
  }
  column "database_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "ID of database_info"
  }
  column "is_draft" {
    null    = false
    type    = bool
    comment = "Is draft"
  }
  column "prompt_disable" {
    null    = false
    type    = bool
    default = 0
    comment = "Support prompt calls: 1 not supported, 0 supported"
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_agent_db_draft" {
    unique  = true
    columns = [column.agent_id, column.database_id, column.is_draft]
  }
}
table "agent_tool_draft" {
  schema  = schema.opencoze
  comment = "Draft Agent Tool"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Primary Key ID"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Agent ID"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "tool_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Tool ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "sub_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Sub URL Path"
  }
  column "method" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "HTTP Request Method"
  }
  column "tool_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Tool Name"
  }
  column "tool_version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Tool Version, e.g. v1.0.0"
  }
  column "operation" {
    null    = true
    type    = json
    comment = "Tool Openapi Operation Schema"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_agent_plugin_tool" {
    columns = [column.agent_id, column.plugin_id, column.tool_id]
  }
  index "idx_agent_tool_bind" {
    columns = [column.agent_id, column.created_at]
  }
  index "uniq_idx_agent_tool_id" {
    unique  = true
    columns = [column.agent_id, column.tool_id]
  }
  index "uniq_idx_agent_tool_name" {
    unique  = true
    columns = [column.agent_id, column.tool_name]
  }
}
table "agent_tool_version" {
  schema  = schema.opencoze
  comment = "Agent Tool Version"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Primary Key ID"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Agent ID"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "tool_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Tool ID"
  }
  column "agent_version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Agent Tool Version"
  }
  column "tool_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Tool Name"
  }
  column "tool_version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Tool Version, e.g. v1.0.0"
  }
  column "sub_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Sub URL Path"
  }
  column "method" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "HTTP Request Method"
  }
  column "operation" {
    null    = true
    type    = json
    comment = "Tool Openapi Operation Schema"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_agent_tool_id_created_at" {
    columns = [column.agent_id, column.tool_id, column.created_at]
  }
  index "idx_agent_tool_name_created_at" {
    columns = [column.agent_id, column.tool_name, column.created_at]
  }
  index "uniq_idx_agent_tool_id_agent_version" {
    unique  = true
    columns = [column.agent_id, column.tool_id, column.agent_version]
  }
  index "uniq_idx_agent_tool_name_agent_version" {
    unique  = true
    columns = [column.agent_id, column.tool_name, column.agent_version]
  }
}
table "api_key" {
  schema  = schema.opencoze
  comment = "api key table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "api_key" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "API Key hash"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "API Key Name"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 0
    comment = "0 normal, 1 deleted"
  }
  column "user_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "API Key Owner"
  }
  column "expired_at" {
    null    = false
    type    = bigint
    default = 0
    comment = "API Key Expired Time"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "last_used_at" {
    null    = false
    type    = bigint
    default = 0
    comment = "Used Time in Milliseconds"
  }
  primary_key {
    columns = [column.id]
  }
}
table "app_connector_release_ref" {
  schema  = schema.opencoze
  comment = "Connector Release Record Reference"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Primary Key"
  }
  column "record_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Publish Record ID"
  }
  column "connector_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Publish Connector ID"
  }
  column "publish_config" {
    null    = true
    type    = json
    comment = "Publish Configuration"
  }
  column "publish_status" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Publish Status"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_record_connector" {
    unique  = true
    columns = [column.record_id, column.connector_id]
  }
}
table "app_draft" {
  schema  = schema.opencoze
  comment = "Draft Application"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "APP ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Space ID"
  }
  column "owner_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Owner ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Icon URI"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Application Name"
  }
  column "description" {
    null    = true
    type    = text
    comment = "Application Description"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
}
table "app_release_record" {
  schema  = schema.opencoze
  comment = "Application Release Record"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Publish Record ID"
  }
  column "app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Application ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Space ID"
  }
  column "owner_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Owner ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Icon URI"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Application Name"
  }
  column "description" {
    null    = true
    type    = text
    comment = "Application Description"
  }
  column "connector_ids" {
    null    = true
    type    = json
    comment = "Publish Connector IDs"
  }
  column "extra_info" {
    null    = true
    type    = json
    comment = "Publish Extra Info"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Release Version"
  }
  column "version_desc" {
    null    = true
    type    = text
    comment = "Version Description"
  }
  column "publish_status" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Publish Status"
  }
  column "publish_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Publish Time in Milliseconds"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_app_publish_at" {
    columns = [column.app_id, column.publish_at]
  }
  index "uniq_idx_app_version_connector" {
    unique  = true
    columns = [column.app_id, column.version]
  }
}
table "connector_workflow_version" {
  schema = schema.opencoze
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
    auto_increment = true
  }
  column "app_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "app id"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "connector id"
  }
  column "workflow_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow id"
  }
  column "version" {
    null    = false
    type    = varchar(256)
    comment = "version"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_connector_id_workflow_id_create_at" {
    columns = [column.connector_id, column.workflow_id, column.created_at]
  }
  index "idx_connector_id_workflow_id_version" {
    unique  = true
    columns = [column.connector_id, column.workflow_id, column.version]
  }
}
table "conversation" {
  schema  = schema.opencoze
  comment = "会话信息表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "connector_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "业务线 ID"
  }
  column "agent_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "agent_id"
  }
  column "scene" {
    null    = false
    type    = tinyint
    default = 0
    comment = "会话场景"
  }
  column "section_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "最新section_id"
  }
  column "creator_id" {
    null     = true
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建者id"
  }
  column "ext" {
    null    = true
    type    = text
    comment = "扩展字段"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "status: 1-normal 2-deleted"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建时间"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "更新时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_connector_bot_status" {
    columns = [column.connector_id, column.agent_id, column.creator_id]
  }
}
table "data_copy_task" {
  schema  = schema.opencoze
  comment = "data方向复制任务记录表"
  collate = "utf8mb4_general_ci"
  column "master_task_id" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "复制任务ID"
  }
  column "origin_data_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "源id"
  }
  column "target_data_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "目标id"
  }
  column "origin_space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "源团队空间"
  }
  column "target_space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "目标团队空间"
  }
  column "origin_user_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "源用户ID"
  }
  column "target_user_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "目标用户ID"
  }
  column "origin_app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "源AppID"
  }
  column "target_app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "目标AppID"
  }
  column "data_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "数据类型 1:knowledge, 2:database"
  }
  column "ext_info" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "存储额外信息"
  }
  column "start_time" {
    null    = false
    type    = bigint
    default = 0
    comment = "任务开始时间"
  }
  column "finish_time" {
    null    = true
    type    = bigint
    comment = "任务结束时间"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "1:创建 2:执行中 3:成功 4:失败"
  }
  column "error_msg" {
    null    = true
    type    = varchar(128)
    comment = "错误信息"
  }
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "ID"
    auto_increment = true
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_master_task_id_origin_data_id_data_type" {
    unique  = true
    columns = [column.master_task_id, column.origin_data_id, column.data_type]
  }
}
table "draft_database_info" {
  schema  = schema.opencoze
  comment = "draft database info"
  collate = "utf8mb4_general_ci"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "ID"
  }
  column "app_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "App ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Space ID"
  }
  column "related_online_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "The primary key ID of online_database_info table"
  }
  column "is_visible" {
    null    = false
    type    = tinyint
    default = 1
    comment = "Visibility: 0 invisible, 1 visible"
  }
  column "prompt_disabled" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Support prompt calls: 1 not supported, 0 supported"
  }
  column "table_name" {
    null    = false
    type    = varchar(255)
    comment = "Table name"
  }
  column "table_desc" {
    null    = true
    type    = varchar(256)
    comment = "Table description"
  }
  column "table_field" {
    null    = true
    type    = text
    comment = "Table field info"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Creator ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(255)
    comment = "Icon Uri"
  }
  column "physical_table_name" {
    null    = true
    type    = varchar(255)
    comment = "The name of the real physical table"
  }
  column "rw_mode" {
    null    = false
    type    = bigint
    default = 1
    comment = "Read and write permission modes: 1. Limited read and write mode 2. Read-only mode 3. Full read and write mode"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_space_app_creator_deleted" {
    columns = [column.space_id, column.app_id, column.creator_id, column.deleted_at]
  }
}
table "knowledge" {
  schema  = schema.opencoze
  comment = "知识库表"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "主键ID"
  }
  column "name" {
    null    = false
    type    = varchar(150)
    default = ""
    comment = "名称"
  }
  column "app_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "项目ID，标识该资源是否是项目独有"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "空间ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "Delete Time in Milliseconds"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "0 初始化, 1 生效 2 失效"
  }
  column "description" {
    null    = true
    type    = text
    comment = "描述"
  }
  column "icon_uri" {
    null    = true
    type    = varchar(150)
    comment = "头像uri"
  }
  column "format_type" {
    null    = false
    type    = tinyint
    default = 0
    comment = "0:文本 1:表格 2:图片"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_app_id" {
    columns = [column.app_id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "idx_space_id_deleted_at_updated_at" {
    columns = [column.space_id, column.deleted_at, column.updated_at]
  }
}
table "knowledge_document" {
  schema  = schema.opencoze
  comment = "知识库文档表"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "主键ID"
  }
  column "knowledge_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "所属knowledge的ID"
  }
  column "name" {
    null    = false
    type    = varchar(150)
    default = ""
    comment = "文档名称"
  }
  column "file_extension" {
    null    = false
    type    = varchar(20)
    default = "0"
    comment = "文档类型, txt/pdf/csv/..."
  }
  column "document_type" {
    null    = false
    type    = int
    default = 0
    comment = "文档类型: 0:文本 1:表格 2:图片"
  }
  column "uri" {
    null    = true
    type    = text
    comment = "资源uri"
  }
  column "size" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "文档大小"
  }
  column "slice_count" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "分片数量"
  }
  column "char_count" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "字符数"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建者ID"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "空间id"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "Delete Time in Milliseconds"
  }
  column "source_type" {
    null    = false
    type    = int
    default = 0
    comment = "0:本地文件上传, 2:自定义文本"
  }
  column "status" {
    null    = false
    type    = int
    default = 0
    comment = "状态"
  }
  column "fail_reason" {
    null    = true
    type    = text
    comment = "失败原因"
  }
  column "parse_rule" {
    null    = true
    type    = json
    comment = "解析+切片规则"
  }
  column "table_info" {
    null    = true
    type    = json
    comment = "表格信息"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "idx_knowledge_id_deleted_at_updated_at" {
    columns = [column.knowledge_id, column.deleted_at, column.updated_at]
  }
}
table "knowledge_document_review" {
  schema  = schema.opencoze
  comment = "文档审阅表"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "主键ID"
  }
  column "knowledge_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "knowledge id"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "空间id"
  }
  column "name" {
    null    = false
    type    = varchar(150)
    default = ""
    comment = "文档名称"
  }
  column "type" {
    null    = false
    type    = varchar(10)
    default = "0"
    comment = "文档类型"
  }
  column "uri" {
    null    = true
    type    = text
    comment = "资源标识"
  }
  column "format_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0 文本, 1 表格, 2 图片"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0 处理中，1 已完成，2 失败，3 失效"
  }
  column "chunk_resp_uri" {
    null    = true
    type    = text
    comment = "预切片tos资源标识"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "Delete Time in Milliseconds"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "创建者ID"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_dataset_id" {
    columns = [column.knowledge_id, column.status, column.updated_at]
  }
  index "idx_uri" {
    on {
      column = column.uri
      prefix = 100
    }
  }
}
table "knowledge_document_slice" {
  schema  = schema.opencoze
  comment = "知识库文件切片表"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "主键ID"
  }
  column "knowledge_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "knowledge id"
  }
  column "document_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "document id"
  }
  column "content" {
    null    = true
    type    = text
    comment = "切片内容"
  }
  column "sequence" {
    null     = false
    type     = decimal(20,5)
    unsigned = false
    comment  = "切片顺序号, 从1开始"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "Delete Time in Milliseconds"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "创建者ID"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "空间ID"
  }
  column "status" {
    null    = false
    type    = int
    default = 0
    comment = "状态"
  }
  column "fail_reason" {
    null    = true
    type    = text
    comment = "失败原因"
  }
  column "hit" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "命中次数"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_document_id_deleted_at_sequence" {
    columns = [column.document_id, column.deleted_at, column.sequence]
  }
  index "idx_knowledge_id_document_id" {
    columns = [column.knowledge_id, column.document_id]
  }
  index "idx_sequence" {
    columns = [column.sequence]
  }
}
table "message" {
  schema  = schema.opencoze
  comment = "消息表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "run_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "对应的run_id"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "conversation id"
  }
  column "user_id" {
    null    = false
    type    = varchar(60)
    default = ""
    comment = "user id"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "agent_id"
  }
  column "role" {
    null    = false
    type    = varchar(100)
    default = ""
    comment = "角色: user、assistant、system"
  }
  column "content_type" {
    null    = false
    type    = varchar(100)
    default = ""
    comment = "内容类型 1 text"
  }
  column "content" {
    null    = true
    type    = mediumtext
    comment = "内容"
  }
  column "message_type" {
    null    = false
    type    = varchar(100)
    default = ""
    comment = "消息类型："
  }
  column "display_content" {
    null    = true
    type    = text
    comment = "展示内容"
  }
  column "ext" {
    null    = true
    type    = text
    comment = "message 扩展字段"
    collate = "utf8mb4_general_ci"
  }
  column "section_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "段落id"
  }
  column "broken_position" {
    null    = true
    type    = int
    default = -1
    comment = "打断位置"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "消息状态 1 Available 2 Deleted 3 Replaced 4 Broken 5 Failed 6 Streaming 7 Pending"
  }
  column "model_content" {
    null    = true
    type    = mediumtext
    comment = "模型输入内容"
  }
  column "meta_info" {
    null    = true
    type    = text
    comment = "引用、高亮等文本标记信息"
  }
  column "reasoning_content" {
    null    = true
    type    = text
    comment = "思考内容"
    collate = "utf8mb4_general_ci"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建时间"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "更新时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_conversation_id" {
    columns = [column.conversation_id]
  }
  index "idx_run_id" {
    columns = [column.run_id]
  }
}
table "model_entity" {
  schema  = schema.opencoze
  comment = "模型信息"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "主键ID"
  }
  column "meta_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "模型元信息 id"
  }
  column "name" {
    null    = false
    type    = varchar(128)
    comment = "名称"
  }
  column "description" {
    null    = true
    type    = text
    comment = "描述"
  }
  column "default_params" {
    null    = true
    type    = json
    comment = "默认参数"
  }
  column "scenario" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "模型应用场景"
  }
  column "status" {
    null    = false
    type    = int
    default = 1
    comment = "模型状态"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Delete Time in Milliseconds"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_scenario" {
    columns = [column.scenario]
  }
  index "idx_status" {
    columns = [column.status]
  }
}
table "model_meta" {
  schema  = schema.opencoze
  comment = "模型元信息"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "主键ID"
  }
  column "model_name" {
    null    = false
    type    = varchar(128)
    comment = "模型名称"
  }
  column "protocol" {
    null    = false
    type    = varchar(128)
    comment = "模型协议"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Icon URI"
  }
  column "capability" {
    null    = true
    type    = json
    comment = "模型能力"
  }
  column "conn_config" {
    null    = true
    type    = json
    comment = "模型连接配置"
  }
  column "status" {
    null    = false
    type    = int
    default = 1
    comment = "模型状态"
  }
  column "description" {
    null    = false
    type    = varchar(2048)
    default = ""
    comment = "模型描述"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Delete Time in Milliseconds"
  }
  column "icon_url" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Icon URL"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_status" {
    columns = [column.status]
  }
}
table "node_execution" {
  schema  = schema.opencoze
  comment = "node 节点运行记录，用于记录每次workflow执行时，每个节点的状态信息"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "node execution id"
  }
  column "execute_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "the workflow execute id this node execution belongs to"
  }
  column "node_id" {
    null    = false
    type    = varchar(128)
    comment = "node key"
    collate = "utf8mb4_unicode_ci"
  }
  column "node_name" {
    null    = false
    type    = varchar(128)
    comment = "name of the node"
    collate = "utf8mb4_unicode_ci"
  }
  column "node_type" {
    null    = false
    type    = varchar(128)
    comment = "the type of the node, in string"
    collate = "utf8mb4_unicode_ci"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "status" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "1=waiting 2=running 3=success 4=fail"
  }
  column "duration" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "execution duration in millisecond"
  }
  column "input" {
    null    = true
    type    = mediumtext
    comment = "actual input of the node"
    collate = "utf8mb4_unicode_ci"
  }
  column "output" {
    null    = true
    type    = mediumtext
    comment = "actual output of the node"
    collate = "utf8mb4_unicode_ci"
  }
  column "raw_output" {
    null    = true
    type    = mediumtext
    comment = "the original output of the node"
    collate = "utf8mb4_unicode_ci"
  }
  column "error_info" {
    null    = true
    type    = mediumtext
    comment = "error info"
    collate = "utf8mb4_unicode_ci"
  }
  column "error_level" {
    null    = true
    type    = varchar(32)
    comment = "level of the error"
    collate = "utf8mb4_unicode_ci"
  }
  column "input_tokens" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "number of input tokens"
  }
  column "output_tokens" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "number of output tokens"
  }
  column "updated_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "update time in millisecond"
  }
  column "composite_node_index" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "loop or batch's execution index"
  }
  column "composite_node_items" {
    null    = true
    type    = mediumtext
    comment = "the items extracted from parent composite node for this index"
    collate = "utf8mb4_unicode_ci"
  }
  column "parent_node_id" {
    null    = true
    type    = varchar(128)
    comment = "when as inner node for loop or batch, this is the parent node's key"
    collate = "utf8mb4_unicode_ci"
  }
  column "sub_execute_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "if this node is sub_workflow, the exe id of the sub workflow"
  }
  column "extra" {
    null    = true
    type    = mediumtext
    comment = "extra info"
    collate = "utf8mb4_unicode_ci"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_execute_id_node_id" {
    columns = [column.execute_id, column.node_id]
  }
  index "idx_execute_id_parent_node_id" {
    columns = [column.execute_id, column.parent_node_id]
  }
}
table "online_database_info" {
  schema  = schema.opencoze
  comment = "online database info"
  collate = "utf8mb4_general_ci"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "ID"
  }
  column "app_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "App ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Space ID"
  }
  column "related_draft_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "The primary key ID of draft_database_info table"
  }
  column "is_visible" {
    null    = false
    type    = tinyint
    default = 1
    comment = "Visibility: 0 invisible, 1 visible"
  }
  column "prompt_disabled" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Support prompt calls: 1 not supported, 0 supported"
  }
  column "table_name" {
    null    = false
    type    = varchar(255)
    comment = "Table name"
  }
  column "table_desc" {
    null    = true
    type    = varchar(256)
    comment = "Table description"
  }
  column "table_field" {
    null    = true
    type    = text
    comment = "Table field info"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Creator ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(255)
    comment = "Icon Uri"
  }
  column "physical_table_name" {
    null    = true
    type    = varchar(255)
    comment = "The name of the real physical table"
  }
  column "rw_mode" {
    null    = false
    type    = bigint
    default = 1
    comment = "Read and write permission modes: 1. Limited read and write mode 2. Read-only mode 3. Full read and write mode"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_space_app_creator_deleted" {
    columns = [column.space_id, column.app_id, column.creator_id, column.deleted_at]
  }
}
table "plugin" {
  schema  = schema.opencoze
  comment = "Latest Plugin"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Space ID"
  }
  column "developer_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Developer ID"
  }
  column "app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Application ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Icon URI"
  }
  column "server_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Server URL"
  }
  column "plugin_type" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Plugin Type, 1:http, 6:local"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Plugin Version, e.g. v1.0.0"
  }
  column "version_desc" {
    null    = true
    type    = text
    comment = "Plugin Version Description"
  }
  column "manifest" {
    null    = true
    type    = json
    comment = "Plugin Manifest"
  }
  column "openapi_doc" {
    null    = true
    type    = json
    comment = "OpenAPI Document, only stores the root"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_space_created_at" {
    columns = [column.space_id, column.created_at]
  }
  index "idx_space_updated_at" {
    columns = [column.space_id, column.updated_at]
  }
}
table "plugin_draft" {
  schema  = schema.opencoze
  comment = "Draft Plugin"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Space ID"
  }
  column "developer_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Developer ID"
  }
  column "app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Application ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Icon URI"
  }
  column "server_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Server URL"
  }
  column "plugin_type" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Plugin Type, 1:http, 6:local"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime
    comment = "Delete Time"
  }
  column "manifest" {
    null    = true
    type    = json
    comment = "Plugin Manifest"
  }
  column "openapi_doc" {
    null    = true
    type    = json
    comment = "OpenAPI Document, only stores the root"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_app_id" {
    columns = [column.app_id, column.id]
  }
  index "idx_space_app_created_at" {
    columns = [column.space_id, column.app_id, column.created_at]
  }
  index "idx_space_app_updated_at" {
    columns = [column.space_id, column.app_id, column.updated_at]
  }
}
table "plugin_oauth_auth" {
  schema  = schema.opencoze
  comment = "Plugin OAuth Authorization Code Info"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Primary Key"
  }
  column "user_id" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "User ID"
  }
  column "plugin_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Plugin ID"
  }
  column "is_draft" {
    null    = false
    type    = bool
    default = 0
    comment = "Is Draft Plugin"
  }
  column "oauth_config" {
    null    = true
    type    = json
    comment = "Authorization Code OAuth Config"
  }
  column "access_token" {
    null    = false
    type    = text
    comment = "Access Token"
  }
  column "refresh_token" {
    null    = false
    type    = text
    comment = "Refresh Token"
  }
  column "token_expired_at" {
    null    = true
    type    = bigint
    comment = "Token Expired in Milliseconds"
  }
  column "next_token_refresh_at" {
    null    = true
    type    = bigint
    comment = "Next Token Refresh Time in Milliseconds"
  }
  column "last_active_at" {
    null    = true
    type    = bigint
    comment = "Last active time in Milliseconds"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_last_active_at" {
    columns = [column.last_active_at]
  }
  index "idx_last_token_expired_at" {
    columns = [column.token_expired_at]
  }
  index "idx_next_token_refresh_at" {
    columns = [column.next_token_refresh_at]
  }
  index "uniq_idx_user_plugin_is_draft" {
    unique  = true
    columns = [column.user_id, column.plugin_id, column.is_draft]
  }
}
table "plugin_version" {
  schema  = schema.opencoze
  comment = "Plugin Version"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Primary Key ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Space ID"
  }
  column "developer_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Developer ID"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Application ID"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Icon URI"
  }
  column "server_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Server URL"
  }
  column "plugin_type" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Plugin Type, 1:http, 6:local"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Plugin Version, e.g. v1.0.0"
  }
  column "version_desc" {
    null    = true
    type    = text
    comment = "Plugin Version Description"
  }
  column "manifest" {
    null    = true
    type    = json
    comment = "Plugin Manifest"
  }
  column "openapi_doc" {
    null    = true
    type    = json
    comment = "OpenAPI Document, only stores the root"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_idx_plugin_version" {
    unique  = true
    columns = [column.plugin_id, column.version]
  }
}
table "prompt_resource" {
  schema  = schema.opencoze
  comment = "prompt_resource"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "space_id" {
    null    = false
    type    = bigint
    comment = "空间ID"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    comment = "名称"
  }
  column "description" {
    null    = false
    type    = varchar(255)
    comment = "描述"
  }
  column "prompt_text" {
    null    = true
    type    = mediumtext
    comment = "prompt正文"
  }
  column "status" {
    null    = false
    type    = int
    comment = "状态,0无效,1有效"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    comment = "创建者ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建时间"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "更新时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
}
table "run_record" {
  schema  = schema.opencoze
  comment = "执行记录表"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "主键ID"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "会话 ID"
  }
  column "section_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "section ID"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "agent_id"
  }
  column "user_id" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "user id"
  }
  column "source" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "执行来源 0 API,"
  }
  column "status" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "状态,0 Unknown, 1-Created,2-InProgress,3-Completed,4-Failed,5-Expired,6-Cancelled,7-RequiresAction"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "创建者标识"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建时间"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "更新时间"
  }
  column "failed_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "失败时间"
  }
  column "last_error" {
    null    = true
    type    = text
    comment = "error message"
    collate = "utf8mb4_general_ci"
  }
  column "completed_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "结束时间"
  }
  column "chat_request" {
    null    = true
    type    = text
    comment = "保存原始请求的部分字段"
    collate = "utf8mb4_general_ci"
  }
  column "ext" {
    null    = true
    type    = text
    comment = "扩展字段"
    collate = "utf8mb4_general_ci"
  }
  column "usage" {
    null    = true
    type    = json
    comment = "usage"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_c_s" {
    columns = [column.conversation_id, column.section_id]
  }
}
table "shortcut_command" {
  schema  = schema.opencoze
  comment = "bot快捷指令表"
  collate = "utf8mb4_general_ci"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "object_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "实体ID,该实体可用这个指令"
  }
  column "command_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "命令ID"
  }
  column "command_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "命令名称"
  }
  column "shortcut_command" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "快捷指令"
  }
  column "description" {
    null    = false
    type    = varchar(2000)
    default = ""
    comment = "命令描述"
  }
  column "send_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "发送类型 0:query 1:panel"
  }
  column "tool_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "使用工具的type 1:workFlow 2:插件"
  }
  column "work_flow_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "使用workFlow的id"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "使用插件的id"
  }
  column "plugin_tool_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "使用插件的api_name"
  }
  column "template_query" {
    null    = true
    type    = text
    comment = "query模板"
  }
  column "components" {
    null    = true
    type    = json
    comment = "panel参数"
  }
  column "card_schema" {
    null    = true
    type    = text
    comment = "卡片schema"
  }
  column "tool_info" {
    null    = true
    type    = json
    comment = "工具信息 包含name+变量列表"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "状态,0无效,1有效"
  }
  column "creator_id" {
    null     = true
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建者ID"
  }
  column "is_online" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "是否为线上信息 0草稿 1线上"
  }
  column "created_at" {
    null    = false
    type    = bigint
    default = 0
    comment = "创建时间"
  }
  column "updated_at" {
    null    = false
    type    = bigint
    default = 0
    comment = "更新时间"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "multi的指令时，该指令由哪个节点执行"
  }
  column "shortcut_icon" {
    null    = true
    type    = json
    comment = "快捷指令图标"
  }
  column "plugin_tool_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "tool_id"
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_object_command_id_type" {
    unique  = true
    columns = [column.object_id, column.command_id, column.is_online]
  }
}
table "single_agent_draft" {
  schema  = schema.opencoze
  comment = "Single Agent Draft Copy Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "agent_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Agent ID"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Creator ID"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Space ID"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Agent Name"
  }
  column "description" {
    null    = false
    type    = text
    comment = "Agent Description"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Icon URI"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "delete time in millisecond"
  }
  column "variables_meta_id" {
    null    = true
    type    = bigint
    comment = "variables meta 表 ID"
  }
  column "model_info" {
    null    = true
    type    = json
    comment = "Model Configuration Information"
  }
  column "onboarding_info" {
    null    = true
    type    = json
    comment = "Onboarding Information"
  }
  column "prompt" {
    null    = true
    type    = json
    comment = "Agent Prompt Configuration"
  }
  column "plugin" {
    null    = true
    type    = json
    comment = "Agent Plugin Base Configuration"
  }
  column "knowledge" {
    null    = true
    type    = json
    comment = "Agent Knowledge Base Configuration"
  }
  column "workflow" {
    null    = true
    type    = json
    comment = "Agent Workflow Configuration"
  }
  column "suggest_reply" {
    null    = true
    type    = json
    comment = "Suggested Replies"
  }
  column "jump_config" {
    null    = true
    type    = json
    comment = "Jump Configuration"
  }
  column "background_image_info_list" {
    null    = true
    type    = json
    comment = "Background image"
  }
  column "database_config" {
    null    = true
    type    = json
    comment = "Agent Database Base Configuration"
  }
  column "shortcut_command" {
    null    = true
    type    = json
    comment = "shortcut command"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "uniq_agent_id" {
    unique  = true
    columns = [column.agent_id]
  }
}
table "single_agent_publish" {
  schema  = schema.opencoze
  comment = "bot 渠道和发布版本流水表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键id"
    auto_increment = true
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "agent_id"
  }
  column "publish_id" {
    null    = false
    type    = varchar(50)
    default = ""
    comment = "发布 id"
    collate = "utf8mb4_general_ci"
  }
  column "connector_ids" {
    null    = true
    type    = json
    comment = "发布的 connector_ids"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Agent Version"
  }
  column "publish_info" {
    null    = true
    type    = text
    comment = "发布信息"
    collate = "utf8mb4_general_ci"
  }
  column "publish_time" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "发布时间"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "发布人 user_id"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 0
    comment = "状态 0:使用中 1:删除 3:禁用"
  }
  column "extra" {
    null    = true
    type    = json
    comment = "扩展字段"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_agent_id_version" {
    columns = [column.agent_id, column.version]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "idx_publish_id" {
    columns = [column.publish_id]
  }
}
table "single_agent_version" {
  schema  = schema.opencoze
  comment = "Single Agent Version Copy Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "agent_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Agent ID"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Creator ID"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Space ID"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Agent Name"
  }
  column "description" {
    null    = false
    type    = text
    comment = "Agent Description"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Icon URI"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "delete time in millisecond"
  }
  column "variables_meta_id" {
    null    = true
    type    = bigint
    comment = "variables meta 表 ID"
  }
  column "model_info" {
    null    = true
    type    = json
    comment = "Model Configuration Information"
  }
  column "onboarding_info" {
    null    = true
    type    = json
    comment = "Onboarding Information"
  }
  column "prompt" {
    null    = true
    type    = json
    comment = "Agent Prompt Configuration"
  }
  column "plugin" {
    null    = true
    type    = json
    comment = "Agent Plugin Base Configuration"
  }
  column "knowledge" {
    null    = true
    type    = json
    comment = "Agent Knowledge Base Configuration"
  }
  column "workflow" {
    null    = true
    type    = json
    comment = "Agent Workflow Configuration"
  }
  column "suggest_reply" {
    null    = true
    type    = json
    comment = "Suggested Replies"
  }
  column "jump_config" {
    null    = true
    type    = json
    comment = "Jump Configuration"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Connector ID"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Agent Version"
  }
  column "background_image_info_list" {
    null    = true
    type    = json
    comment = "Background image"
  }
  column "database_config" {
    null    = true
    type    = json
    comment = "Agent Database Base Configuration"
  }
  column "shortcut_command" {
    null    = true
    type    = json
    comment = "shortcut command"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "uniq_agent_id_and_version_connector_id" {
    unique  = true
    columns = [column.agent_id, column.version, column.connector_id]
  }
}
table "space" {
  schema  = schema.opencoze
  comment = "Space Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID, Space ID"
    auto_increment = true
  }
  column "owner_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Owner ID"
  }
  column "name" {
    null    = false
    type    = varchar(200)
    default = ""
    comment = "Space Name"
  }
  column "description" {
    null    = false
    type    = varchar(2000)
    default = ""
    comment = "Space Description"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(200)
    default = ""
    comment = "Icon URI"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Creator ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Creation Time (Milliseconds)"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time (Milliseconds)"
  }
  column "deleted_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Deletion Time (Milliseconds)"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "idx_owner_id" {
    columns = [column.owner_id]
  }
}
table "space_user" {
  schema  = schema.opencoze
  comment = "Space Member Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID, Auto Increment"
    auto_increment = true
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Space ID"
  }
  column "user_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "User ID"
  }
  column "role_type" {
    null    = false
    type    = int
    default = 3
    comment = "Role Type: 1.owner 2.admin 3.member"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Creation Time (Milliseconds)"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time (Milliseconds)"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_user_id" {
    columns = [column.user_id]
  }
  index "uniq_space_user" {
    unique  = true
    columns = [column.space_id, column.user_id]
  }
}
table "template" {
  schema  = schema.opencoze
  comment = "Template Info Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "agent_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Agent ID"
  }
  column "workflow_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Workflow ID"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "Space ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "heat" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Heat"
  }
  column "product_entity_type" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Product Entity Type"
  }
  column "meta_info" {
    null    = true
    type    = json
    comment = "Meta Info"
  }
  column "agent_extra" {
    null    = true
    type    = json
    comment = "Agent Extra Info"
  }
  column "workflow_extra" {
    null    = true
    type    = json
    comment = "Workflow Extra Info"
  }
  column "project_extra" {
    null    = true
    type    = json
    comment = "Project Extra Info"
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_agent_id" {
    unique  = true
    columns = [column.agent_id]
  }
}
table "tool" {
  schema  = schema.opencoze
  comment = "Latest Tool"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Tool ID"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Tool Version, e.g. v1.0.0"
  }
  column "sub_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Sub URL Path"
  }
  column "method" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "HTTP Request Method"
  }
  column "operation" {
    null    = true
    type    = json
    comment = "Tool Openapi Operation Schema"
  }
  column "activated_status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0:activated; 1:deactivated"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_plugin_activated_status" {
    columns = [column.plugin_id, column.activated_status]
  }
  index "uniq_idx_plugin_sub_url_method" {
    unique  = true
    columns = [column.plugin_id, column.sub_url, column.method]
  }
}
table "tool_draft" {
  schema  = schema.opencoze
  comment = "Draft Tool"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Tool ID"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time in Milliseconds"
  }
  column "sub_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Sub URL Path"
  }
  column "method" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "HTTP Request Method"
  }
  column "operation" {
    null    = true
    type    = json
    comment = "Tool Openapi Operation Schema"
  }
  column "debug_status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0:not pass; 1:pass"
  }
  column "activated_status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0:activated; 1:deactivated"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_plugin_created_at_id" {
    columns = [column.plugin_id, column.created_at, column.id]
  }
  index "uniq_idx_plugin_sub_url_method" {
    unique  = true
    columns = [column.plugin_id, column.sub_url, column.method]
  }
}
table "tool_version" {
  schema  = schema.opencoze
  comment = "Tool Version"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Primary Key ID"
  }
  column "tool_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Tool ID"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Plugin ID"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Tool Version, e.g. v1.0.0"
  }
  column "sub_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Sub URL Path"
  }
  column "method" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "HTTP Request Method"
  }
  column "operation" {
    null    = true
    type    = json
    comment = "Tool Openapi Operation Schema"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Create Time in Milliseconds"
  }
  column "deleted_at" {
    null    = true
    type    = datetime
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_idx_tool_version" {
    unique  = true
    columns = [column.tool_id, column.version]
  }
}
table "user" {
  schema  = schema.opencoze
  comment = "User Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "name" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "User Nickname"
  }
  column "unique_name" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "User Unique Name"
  }
  column "email" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "Email"
  }
  column "password" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "Password (Encrypted)"
  }
  column "description" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "User Description"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Avatar URI"
  }
  column "user_verified" {
    null    = false
    type    = bool
    default = 0
    comment = "User Verification Status"
  }
  column "locale" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "Locale"
  }
  column "session_key" {
    null    = false
    type    = varchar(256)
    default = ""
    comment = "Session Key"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Creation Time (Milliseconds)"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Update Time (Milliseconds)"
  }
  column "deleted_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Deletion Time (Milliseconds)"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_session_key" {
    columns = [column.session_key]
  }
  index "uniq_email" {
    unique  = true
    columns = [column.email]
  }
  index "uniq_unique_name" {
    unique  = true
    columns = [column.unique_name]
  }
}
table "variable_instance" {
  schema  = schema.opencoze
  comment = "KV Memory"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "主键ID"
  }
  column "biz_type" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "1 for agent，2 for app"
  }
  column "biz_id" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "1 for agent_id，2 for app_id"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    comment = "agent or project 版本,为空代表草稿态"
  }
  column "keyword" {
    null    = false
    type    = varchar(255)
    comment = "记忆的KEY"
  }
  column "type" {
    null    = false
    type    = tinyint
    comment = "记忆类型 1 KV 2 list"
  }
  column "content" {
    null    = true
    type    = text
    comment = "记忆内容"
  }
  column "connector_uid" {
    null    = false
    type    = varchar(255)
    comment = "二方用户ID"
  }
  column "connector_id" {
    null    = false
    type    = bigint
    comment = "二方id, e.g. coze = 10000010"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建时间"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "更新时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_connector_key" {
    columns = [column.biz_id, column.biz_type, column.version, column.connector_uid, column.connector_id]
  }
}
table "variables_meta" {
  schema  = schema.opencoze
  comment = "KV Memory meta"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "主键ID"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "创建者ID"
  }
  column "biz_type" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "1 for agent，2 for app"
  }
  column "biz_id" {
    null    = false
    type    = varchar(128)
    default = ""
    comment = "1 for agent_id，2 for app_id"
  }
  column "variable_list" {
    null    = true
    type    = json
    comment = "变量配置的json数据"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "create time"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "update time"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    comment = "project版本,为空代表草稿态"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_user_key" {
    columns = [column.creator_id]
  }
  index "uniq_project_key" {
    unique  = true
    columns = [column.biz_id, column.biz_type, column.version]
  }
}
table "workflow_draft" {
  schema  = schema.opencoze
  comment = "workflow 画布草稿表，用于记录workflow最新的草稿画布信息"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow ID"
  }
  column "canvas" {
    null    = false
    type    = mediumtext
    comment = "前端 schema"
  }
  column "input_params" {
    null    = true
    type    = mediumtext
    comment = " 入参 schema"
  }
  column "output_params" {
    null    = true
    type    = mediumtext
    comment = " 出参 schema"
  }
  column "test_run_success" {
    null    = false
    type    = bool
    default = 0
    comment = "0 未运行, 1 运行成功"
  }
  column "modified" {
    null    = false
    type    = bool
    default = 0
    comment = "0 未被修改, 1 已被修改"
  }
  column "updated_at" {
    null     = true
    type     = bigint
    unsigned = true
  }
  column "deleted_at" {
    null = true
    type = datetime(3)
  }
  column "commit_id" {
    null    = false
    type    = varchar(255)
    comment = "used to uniquely identify a draft snapshot"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_updated_at" {
    on {
      desc   = true
      column = column.updated_at
    }
  }
}
table "workflow_execution" {
  schema  = schema.opencoze
  comment = "workflow 执行记录表，用于记录每次workflow执行时的状态"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "execute id"
  }
  column "workflow_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow_id"
  }
  column "version" {
    null    = true
    type    = varchar(50)
    comment = "workflow version. empty if is draft"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "the space id the workflow belongs to"
  }
  column "mode" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "the execution mode: 1. debug run 2. release run 3. node debug"
  }
  column "operator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "the user id that runs this workflow"
  }
  column "connector_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "the connector on which this execution happened"
  }
  column "connector_uid" {
    null    = true
    type    = varchar(64)
    comment = "user id of the connector"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "log_id" {
    null    = true
    type    = varchar(128)
    comment = "log id"
  }
  column "status" {
    null     = true
    type     = tinyint
    unsigned = true
    comment  = "1=running 2=success 3=fail 4=interrupted"
  }
  column "duration" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "execution duration in millisecond"
  }
  column "input" {
    null    = true
    type    = mediumtext
    comment = "actual input of this execution"
  }
  column "output" {
    null    = true
    type    = mediumtext
    comment = "the actual output of this execution"
  }
  column "error_code" {
    null    = true
    type    = varchar(255)
    comment = "error code if any"
  }
  column "fail_reason" {
    null    = true
    type    = mediumtext
    comment = "the reason for failure"
  }
  column "input_tokens" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "number of input tokens"
  }
  column "output_tokens" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "number of output tokens"
  }
  column "updated_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "update time in millisecond"
  }
  column "root_execution_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "the top level execution id. Null if this is the root"
  }
  column "parent_node_id" {
    null    = true
    type    = varchar(128)
    comment = "the node key for the sub_workflow node that executes this workflow"
  }
  column "app_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "app id this workflow execution belongs to"
  }
  column "node_count" {
    null     = true
    type     = mediumint
    unsigned = true
    comment  = "the total node count of the workflow"
  }
  column "resume_event_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "the current event ID which is resuming"
  }
  column "agent_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "the agent that this execution binds to"
  }
  column "sync_pattern" {
    null     = true
    type     = tinyint
    unsigned = true
    comment  = "the sync pattern 1. sync 2. async 3. stream"
  }
  column "commit_id" {
    null    = true
    type    = varchar(255)
    comment = "draft commit id this execution belongs to"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_workflow_id_version_mode_created_at" {
    columns = [column.workflow_id, column.version, column.mode, column.created_at]
  }
}
table "workflow_meta" {
  schema  = schema.opencoze
  comment = "workflow 元信息表，用于记录workflow基本的元信息"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow id"
  }
  column "name" {
    null    = false
    type    = varchar(256)
    comment = "workflow name"
  }
  column "description" {
    null    = false
    type    = varchar(2000)
    comment = "workflow description"
  }
  column "icon_uri" {
    null    = false
    type    = varchar(256)
    comment = "icon uri"
  }
  column "status" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "0:未发布过, 1:已发布过"
  }
  column "content_type" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "0用户 1官方"
  }
  column "mode" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "0:workflow, 3:chat_flow"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "updated_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "update time in millisecond"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "delete time in millisecond"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "user id for creator"
  }
  column "tag" {
    null     = true
    type     = tinyint
    unsigned = true
    comment  = "template tag: Tag: 1=All, 2=Hot, 3=Information, 4=Music, 5=Picture, 6=UtilityTool, 7=Life, 8=Traval, 9=Network, 10=System, 11=Movie, 12=Office, 13=Shopping, 14=Education, 15=Health, 16=Social, 17=Entertainment, 18=Finance, 100=Hidden"
  }
  column "author_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "原作者用户 ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = " 空间 ID"
  }
  column "updater_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = " 更新元信息的用户 ID"
  }
  column "source_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = " 复制来源的 workflow ID"
  }
  column "app_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "应用 ID"
  }
  column "latest_version" {
    null    = true
    type    = varchar(50)
    comment = "the version of the most recent publish"
  }
  column "latest_version_ts" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "create time of latest version"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_app_id" {
    columns = [column.app_id]
  }
  index "idx_latest_version_ts" {
    on {
      desc   = true
      column = column.latest_version_ts
    }
  }
  index "idx_space_id_app_id_status_latest_version_ts" {
    columns = [column.space_id, column.app_id, column.status, column.latest_version_ts]
  }
}
table "workflow_reference" {
  schema  = schema.opencoze
  comment = "workflow 关联关系表，用于记录workflow 直接互相引用关系"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow id"
  }
  column "referred_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "the id of the workflow that is referred by other entities"
  }
  column "referring_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "the entity id that refers this workflow"
  }
  column "refer_type" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "1 subworkflow 2 tool"
  }
  column "referring_biz_type" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "the biz type the referring entity belongs to: 1. workflow 2. agent"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "status" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "whether this reference currently takes effect. 0: disabled 1: enabled"
  }
  column "deleted_at" {
    null = true
    type = datetime(3)
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_referred_id_referring_biz_type_status" {
    columns = [column.referred_id, column.referring_biz_type, column.status]
  }
  index "idx_referring_id_status" {
    columns = [column.referring_id, column.status]
  }
  index "uniq_referred_id_referring_id_refer_type" {
    unique  = true
    columns = [column.referred_id, column.referring_id, column.refer_type]
  }
}
table "workflow_snapshot" {
  schema  = schema.opencoze
  comment = "snapshot for executed workflow draft"
  column "workflow_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow id this snapshot belongs to"
  }
  column "commit_id" {
    null    = false
    type    = varchar(255)
    comment = "the commit id of the workflow draft"
  }
  column "canvas" {
    null    = false
    type    = mediumtext
    comment = "frontend schema for this snapshot"
  }
  column "input_params" {
    null    = true
    type    = mediumtext
    comment = "input parameter info"
  }
  column "output_params" {
    null    = true
    type    = mediumtext
    comment = "output parameter info"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
  }
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "ID"
    auto_increment = true
  }
  primary_key {
    columns = [column.id]
  }
  index "uniq_workflow_id_commit_id" {
    unique  = true
    columns = [column.workflow_id, column.commit_id]
  }
}
table "workflow_version" {
  schema  = schema.opencoze
  comment = "workflow 画布版本信息表，用于记录不同版本的画布信息"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "ID"
    auto_increment = true
  }
  column "workflow_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow id"
  }
  column "version" {
    null    = false
    type    = varchar(50)
    comment = "发布版本"
  }
  column "version_description" {
    null    = false
    type    = varchar(2000)
    comment = "版本描述"
  }
  column "canvas" {
    null    = false
    type    = mediumtext
    comment = "前端 schema"
  }
  column "input_params" {
    null = true
    type = mediumtext
  }
  column "output_params" {
    null = true
    type = mediumtext
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "发布用户 ID"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "创建时间毫秒时间戳"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "删除毫秒时间戳"
  }
  column "commit_id" {
    null    = false
    type    = varchar(255)
    comment = "the commit id corresponding to this version"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_id_created_at" {
    columns = [column.workflow_id, column.created_at]
  }
  index "uniq_workflow_id_version" {
    unique  = true
    columns = [column.workflow_id, column.version]
  }
}
schema "opencoze" {
  charset = "utf8mb4"
  collate = "utf8mb4_unicode_ci"
}
