Notice: Skipping triggers, functions, stored procedures and other advanced objects.
Upgrade to Pro to enable these features and more. See: https://atlasgo.io/features.

To upgrade run: atlas login
table "agent_conversation_mapping" {
  schema  = schema.opencoze
  comment = "Agent会话映射表，管理ChatFlow与各Agent平台的会话关系"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null           = false
    type           = bigint
    comment        = "主键ID"
    auto_increment = true
  }
  column "chatflow_conversation_id" {
    null    = false
    type    = bigint
    comment = "ChatFlow会话ID"
  }
  column "node_id" {
    null    = false
    type    = varchar(64)
    comment = "工作流节点ID"
  }
  column "platform" {
    null    = false
    type    = varchar(32)
    comment = "Agent平台类型: hiagent, singleagent, dify, coze"
  }
  column "agent_conversation_id" {
    null    = false
    type    = varchar(128)
    comment = "Agent平台的会话ID"
  }
  column "agent_id" {
    null    = true
    type    = bigint
    comment = "Agent ID (for singleagent platform)"
  }
  column "agent_config" {
    null    = true
    type    = json
    comment = "Agent配置快照"
  }
  column "message_count" {
    null    = true
    type    = int
    default = 0
    comment = "消息数量"
  }
  column "last_message_id" {
    null    = true
    type    = varchar(128)
    comment = "最后一条消息ID"
  }
  column "last_message_time" {
    null    = true
    type    = timestamp
    comment = "最后消息时间"
  }
  column "status" {
    null    = true
    type    = tinyint
    default = 1
    comment = "状态: 1-活跃, 0-已结束"
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
    comment = "创建时间"
  }
  column "updated_at" {
    null      = false
    type      = timestamp
    default   = sql("CURRENT_TIMESTAMP")
    comment   = "更新时间"
    on_update = sql("CURRENT_TIMESTAMP")
  }
  column "deleted_at" {
    null    = true
    type    = timestamp
    comment = "软删除时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_agent_conv" {
    columns = [column.platform, column.agent_conversation_id]
  }
  index "idx_chatflow_id" {
    columns = [column.chatflow_conversation_id]
  }
  index "idx_created_at" {
    columns = [column.created_at]
  }
  index "idx_status_updated" {
    columns = [column.status, column.updated_at]
  }
  index "uk_chatflow_node" {
    unique  = true
    columns = [column.chatflow_conversation_id, column.node_id, column.deleted_at]
  }
}
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
  column "ak_type" {
    null    = false
    type    = tinyint
    default = 0
    comment = "api key type "
  }
  primary_key {
    columns = [column.id]
  }
}
table "api_token" {
  schema = schema.opencoze
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "token" {
    null = false
    type = varchar(255)
  }
  column "dialog_id" {
    null = true
    type = varchar(32)
  }
  column "source" {
    null = true
    type = varchar(16)
  }
  column "beta" {
    null = true
    type = varchar(255)
  }
  primary_key {
    columns = [column.tenant_id, column.token]
  }
  index "apitoken_beta" {
    columns = [column.beta]
  }
  index "apitoken_create_date" {
    columns = [column.create_date]
  }
  index "apitoken_create_time" {
    columns = [column.create_time]
  }
  index "apitoken_dialog_id" {
    columns = [column.dialog_id]
  }
  index "apitoken_source" {
    columns = [column.source]
  }
  index "apitoken_tenant_id" {
    columns = [column.tenant_id]
  }
  index "apitoken_token" {
    columns = [column.token]
  }
  index "apitoken_update_date" {
    columns = [column.update_date]
  }
  index "apitoken_update_time" {
    columns = [column.update_time]
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
table "app_conversation_template_draft" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "app_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "app id"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "space id"
  }
  column "name" {
    null    = false
    type    = varchar(256)
    comment = "conversation name"
  }
  column "template_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "template id"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "creator id"
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
  primary_key {
    columns = [column.id]
  }
  index "idx_space_id_app_id_template_id" {
    columns = [column.space_id, column.app_id, column.template_id]
  }
}
table "app_conversation_template_online" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "app_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "app id"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "space id"
  }
  column "name" {
    null    = false
    type    = varchar(256)
    comment = "conversation name"
  }
  column "template_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "template id"
  }
  column "version" {
    null    = false
    type    = varchar(256)
    comment = "version name"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "creator id"
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
  index "idx_space_id_app_id_template_id_version" {
    columns = [column.space_id, column.app_id, column.template_id, column.version]
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
table "app_dynamic_conversation_draft" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "app_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "app id"
  }
  column "name" {
    null    = false
    type    = varchar(256)
    comment = "conversation name"
  }
  column "user_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "user id"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "connector id"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "conversation id"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "delete time in millisecond"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_app_id_connector_id_user_id" {
    columns = [column.app_id, column.connector_id, column.user_id]
  }
  index "idx_connector_id_user_id_name" {
    columns = [column.connector_id, column.user_id, column.name]
  }
}
table "app_dynamic_conversation_online" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "app_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "app id"
  }
  column "name" {
    null    = false
    type    = varchar(256)
    comment = "conversation name"
  }
  column "user_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "user id"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "connector id"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "conversation id"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "delete time in millisecond"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_app_id_connector_id_user_id" {
    columns = [column.app_id, column.connector_id, column.user_id]
  }
  index "idx_connector_id_user_id_name" {
    columns = [column.connector_id, column.user_id, column.name]
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
table "app_static_conversation_draft" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "template_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "template id"
  }
  column "user_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "user id"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "connector id"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "conversation id"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "create time in millisecond"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "delete time in millisecond"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_connector_id_user_id_template_id" {
    columns = [column.connector_id, column.user_id, column.template_id]
  }
}
table "app_static_conversation_online" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "template_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "template id"
  }
  column "user_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "user id"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "connector id"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "conversation id"
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
  index "idx_connector_id_user_id_template_id" {
    columns = [column.connector_id, column.user_id, column.template_id]
  }
}
table "chat_flow_role_config" {
  schema = schema.opencoze
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "workflow_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "workflow id"
  }
  column "connector_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "connector id"
  }
  column "name" {
    null    = false
    type    = varchar(256)
    comment = "role name"
  }
  column "description" {
    null    = false
    type    = mediumtext
    comment = "role description"
  }
  column "version" {
    null    = false
    type    = varchar(256)
    comment = "version"
  }
  column "avatar" {
    null    = false
    type    = varchar(256)
    comment = "avatar uri"
  }
  column "background_image_info" {
    null    = false
    type    = mediumtext
    comment = "background image information, object structure"
  }
  column "onboarding_info" {
    null    = false
    type    = mediumtext
    comment = "intro information, object structure"
  }
  column "suggest_reply_info" {
    null    = false
    type    = mediumtext
    comment = "user suggestions, object structure"
  }
  column "audio_config" {
    null    = false
    type    = mediumtext
    comment = "agent audio config, object structure"
  }
  column "user_input_config" {
    null    = false
    type    = varchar(256)
    comment = "user input config, object structure"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "creator id"
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
  primary_key {
    columns = [column.id]
  }
  index "idx_connector_id_version" {
    columns = [column.connector_id, column.version]
  }
  index "idx_workflow_id_version" {
    columns = [column.workflow_id, column.version]
  }
}
table "chatflow_conversation_history" {
  schema  = schema.opencoze
  comment = "Chatflow conversation history table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "conversation_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "Conversation identifier"
  }
  column "workflow_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Chatflow workflow ID"
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Space ID"
  }
  column "user_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "User ID who initiated the conversation"
  }
  column "role" {
    null    = false
    type    = varchar(20)
    default = ""
    comment = "Message role: user, assistant, system"
  }
  column "content" {
    null    = false
    type    = longtext
    comment = "Message content"
  }
  column "execution_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Workflow execution ID that generated this message"
  }
  column "node_id" {
    null    = true
    type    = varchar(128)
    comment = "Node ID that generated this message"
  }
  column "message_order" {
    null     = false
    type     = int
    default  = 0
    unsigned = true
    comment  = "Message order in conversation"
  }
  column "metadata" {
    null    = true
    type    = json
    comment = "Additional metadata like tokens, model info, etc."
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
  index "idx_conversation_name_created_at" {
    columns = [column.conversation_name, column.created_at]
  }
  index "idx_conversation_name_workflow_order" {
    columns = [column.conversation_name, column.workflow_id, column.message_order]
  }
  index "idx_space_id_created_at" {
    columns = [column.space_id, column.created_at]
  }
  index "idx_workflow_id_conversation_name" {
    columns = [column.workflow_id, column.conversation_name]
  }
}
table "connector_workflow_version" {
  schema  = schema.opencoze
  comment = "connector workflow version"
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
  index "uniq_connector_id_workflow_id_version" {
    unique  = true
    columns = [column.connector_id, column.workflow_id, column.version]
  }
}
table "conversation" {
  schema  = schema.opencoze
  comment = "conversation info record"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
    auto_increment = true
  }
  column "name" {
    null    = true
    type    = varchar(255)
    default = ""
    comment = "conversation name"
  }
  column "connector_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Publish Connector ID"
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
    comment = "conversation scene"
  }
  column "section_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "section_id"
  }
  column "creator_id" {
    null     = true
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "creator_id"
  }
  column "ext" {
    null    = true
    type    = text
    comment = "ext"
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
  index "idx_connector_bot_status" {
    columns = [column.connector_id, column.agent_id, column.creator_id]
  }
}
table "data_copy_task" {
  schema  = schema.opencoze
  comment = "data copy task record"
  collate = "utf8mb4_general_ci"
  column "master_task_id" {
    null    = true
    type    = varchar(128)
    default = ""
    comment = "task id"
  }
  column "origin_data_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "origin data id"
  }
  column "target_data_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "target data id"
  }
  column "origin_space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "origin space id"
  }
  column "target_space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "target space id"
  }
  column "origin_user_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "origin user id"
  }
  column "target_user_id" {
    null     = true
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "target user id"
  }
  column "origin_app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "origin app id"
  }
  column "target_app_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "target app id"
  }
  column "data_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "data type 1:knowledge, 2:database"
  }
  column "ext_info" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "ext"
  }
  column "start_time" {
    null    = true
    type    = bigint
    default = 0
    comment = "task start time"
  }
  column "finish_time" {
    null    = true
    type    = bigint
    comment = "task finish time"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "1: Create 2: Running 3: Success 4: Failure"
  }
  column "error_msg" {
    null    = true
    type    = varchar(128)
    comment = "error msg"
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
table "external_agent_config" {
  schema  = schema.opencoze
  comment = "外部智能体配置表"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null           = false
    type           = bigint
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
    comment = "智能体名称"
  }
  column "description" {
    null    = true
    type    = text
    comment = "智能体描述"
  }
  column "platform" {
    null    = false
    type    = varchar(32)
    comment = "平台类型: hiagent, dify, coze"
  }
  column "agent_url" {
    null    = false
    type    = varchar(512)
    comment = "API接口地址"
  }
  column "agent_key" {
    null    = true
    type    = varchar(512)
    comment = "API密钥(加密存储)"
  }
  column "agent_id" {
    null    = true
    type    = varchar(128)
    comment = "外部平台的Agent ID"
  }
  column "app_id" {
    null    = true
    type    = varchar(128)
    comment = "Dify应用ID"
  }
  column "icon" {
    null    = true
    type    = varchar(255)
    default = "robot"
    comment = "图标"
  }
  column "category" {
    null    = true
    type    = varchar(64)
    default = "external"
    comment = "分类"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "状态: 0-禁用, 1-启用"
  }
  column "metadata" {
    null    = true
    type    = json
    comment = "其他扩展配置"
  }
  column "created_by" {
    null    = false
    type    = bigint
    comment = "创建者用户ID"
  }
  column "updated_by" {
    null    = true
    type    = bigint
    comment = "最后更新者用户ID"
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
    comment = "创建时间"
  }
  column "updated_at" {
    null      = false
    type      = timestamp
    default   = sql("CURRENT_TIMESTAMP")
    comment   = "更新时间"
    on_update = sql("CURRENT_TIMESTAMP")
  }
  column "deleted_at" {
    null    = true
    type    = timestamp
    comment = "软删除时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_created_by" {
    columns = [column.created_by]
  }
  index "idx_deleted_at" {
    columns = [column.deleted_at]
  }
  index "idx_platform" {
    columns = [column.platform]
  }
  index "idx_space_id" {
    columns = [column.space_id]
  }
  index "idx_status" {
    columns = [column.status]
  }
  index "uk_space_name_platform" {
    unique  = true
    columns = [column.space_id, column.name, column.platform, column.deleted_at]
  }
}
table "external_knowledge_binding" {
  schema  = schema.opencoze
  comment = "外部知识库绑定表，存储用户的外部知识库连接信息"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "user_id" {
    null    = false
    type    = varchar(255)
    comment = "用户ID，全局唯一标识"
  }
  column "binding_key" {
    null    = false
    type    = varchar(500)
    comment = "绑定密钥，用于连接外部知识库"
  }
  column "binding_name" {
    null    = true
    type    = varchar(255)
    comment = "绑定名称，用户自定义名称"
  }
  column "binding_type" {
    null    = false
    type    = varchar(50)
    default = "default"
    comment = "绑定类型，预留字段用于支持多种知识库类型"
  }
  column "extra_config" {
    null    = true
    type    = json
    comment = "额外配置信息，JSON格式存储"
  }
  column "status" {
    null    = false
    type    = bool
    default = 1
    comment = "状态，0=禁用，1=启用"
  }
  column "last_sync_at" {
    null    = true
    type    = timestamp
    comment = "最后同步时间"
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
    comment = "创建时间"
  }
  column "updated_at" {
    null      = false
    type      = timestamp
    default   = sql("CURRENT_TIMESTAMP")
    comment   = "更新时间"
    on_update = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_binding_type" {
    columns = [column.binding_type]
    comment = "绑定类型索引"
  }
  index "idx_created_at" {
    columns = [column.created_at]
    comment = "创建时间索引"
  }
  index "idx_status" {
    columns = [column.status]
    comment = "状态索引"
  }
  index "idx_user_id" {
    columns = [column.user_id]
    comment = "用户ID索引"
  }
  index "uk_user_binding_key" {
    unique  = true
    columns = [column.user_id, column.binding_key]
    comment = "用户和绑定密钥组合唯一索引"
  }
}
table "files" {
  schema  = schema.opencoze
  comment = "file resource table"
  collate = "utf8mb4_general_ci"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "file name"
  }
  column "file_size" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "file size"
  }
  column "tos_uri" {
    null    = false
    type    = varchar(1024)
    default = ""
    comment = "TOS URI"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "status，0invalid，1valid"
  }
  column "comment" {
    null    = false
    type    = varchar(1024)
    default = ""
    comment = "file comment"
  }
  column "source" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "source：1 from API,"
  }
  column "creator_id" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "creator id"
  }
  column "content_type" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "content type"
  }
  column "coze_account_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "coze account id"
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
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
}
table "folder" {
  schema  = schema.opencoze
  comment = "Folder Table for Library Resource Organization"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Folder ID"
    auto_increment = true
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Space ID"
  }
  column "parent_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "Parent Folder ID, NULL for root folder"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    comment = "Folder Name"
  }
  column "description" {
    null    = false
    type    = varchar(1000)
    default = ""
    comment = "Folder Description"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Creator ID"
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
    comment = "Delete Time"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
  index "idx_space_id_parent_id_deleted_at" {
    columns = [column.space_id, column.parent_id, column.deleted_at]
  }
  index "uniq_space_parent_name_deleted" {
    unique  = true
    columns = [column.space_id, column.parent_id, column.name, column.deleted_at]
  }
}
table "knowledge" {
  schema  = schema.opencoze
  comment = "knowledge tabke"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "name" {
    null    = false
    type    = varchar(150)
    default = ""
    comment = "knowledge_s name"
  }
  column "app_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "app id"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "creator id"
  }
  column "space_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "space id"
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
    comment = "Delete Time"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "0 initialization, 1 effective, 2 invalid"
  }
  column "description" {
    null    = true
    type    = text
    comment = "description"
  }
  column "icon_uri" {
    null    = true
    type    = varchar(150)
    comment = "icon uri"
  }
  column "format_type" {
    null    = false
    type    = tinyint
    default = 0
    comment = "0: Text 1: Table 2: Images"
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
table "knowledge_backup_20250812" {
  schema = schema.opencoze
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
}
table "knowledge_document" {
  schema  = schema.opencoze
  comment = "knowledge document info"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "knowledge_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "knowledge id"
  }
  column "name" {
    null    = false
    type    = varchar(150)
    default = ""
    comment = "document name"
  }
  column "file_extension" {
    null    = false
    type    = varchar(20)
    default = "0"
    comment = "Document type, txt/pdf/csv etc.."
  }
  column "document_type" {
    null    = false
    type    = int
    default = 0
    comment = "Document type: 0: Text 1: Table 2: Image"
  }
  column "uri" {
    null    = true
    type    = text
    comment = "uri"
  }
  column "size" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "document size"
  }
  column "slice_count" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "slice count"
  }
  column "char_count" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "number of characters"
  }
  column "creator_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "creator id"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "space id"
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
    comment = "Delete Time"
  }
  column "source_type" {
    null    = true
    type    = int
    default = 0
    comment = "0: Local file upload, 2: Custom text, 103: Feishu 104: Lark"
  }
  column "status" {
    null    = false
    type    = int
    default = 0
    comment = "status"
  }
  column "fail_reason" {
    null    = true
    type    = text
    comment = "fail reason"
  }
  column "parse_rule" {
    null    = true
    type    = json
    comment = "parse rule"
  }
  column "table_info" {
    null    = true
    type    = json
    comment = "table info"
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
  comment = "Document slice preview info"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "id"
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
    comment = "space id"
  }
  column "name" {
    null    = false
    type    = varchar(150)
    default = ""
    comment = "name"
  }
  column "type" {
    null    = false
    type    = varchar(10)
    default = "0"
    comment = "document type"
  }
  column "uri" {
    null    = true
    type    = text
    comment = "uri"
  }
  column "format_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0 text, 1 table, 2 images"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0 Processing 1 Completed 2 Failed 3 Expired"
  }
  column "chunk_resp_uri" {
    null    = true
    type    = text
    comment = "pre-sliced uri"
  }
  column "deleted_at" {
    null    = true
    type    = datetime(3)
    comment = "Delete Time"
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
    comment = "creator id"
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
  comment = "knowledge document slice"
  column "id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "id"
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
    comment  = "document_id"
  }
  column "content" {
    null    = true
    type    = text
    comment = "content"
  }
  column "sequence" {
    null     = false
    type     = decimal(20,5)
    unsigned = false
    comment  = "slice sequence number, starting from 1"
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
    comment = "Delete Time"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "creator id"
  }
  column "space_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "space id"
  }
  column "status" {
    null    = false
    type    = int
    default = 0
    comment = "status"
  }
  column "fail_reason" {
    null    = true
    type    = text
    comment = "fail reason"
  }
  column "hit" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "hit counts "
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
table "marketplace_bot" {
  schema  = schema.opencoze
  comment = "智能体商店表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "bot_id" {
    null    = false
    type    = bigint
    comment = "智能体ID"
  }
  column "bot_version" {
    null    = true
    type    = varchar(64)
    comment = "智能体版本"
  }
  column "category_id" {
    null    = false
    type    = int
    comment = "分类ID: 1-效率工具,2-商业服务,3-文本创作,4-学习教育,5-代码助手,6-生活方式,7-游戏,8-图像与音视频,9-角色"
  }
  column "category_name" {
    null    = false
    type    = varchar(64)
    comment = "分类名称"
  }
  column "title" {
    null    = false
    type    = varchar(256)
    comment = "商店显示标题"
  }
  column "description" {
    null    = true
    type    = text
    comment = "商店显示描述"
  }
  column "icon_url" {
    null    = true
    type    = varchar(512)
    comment = "图标URL"
  }
  column "publisher_id" {
    null    = false
    type    = bigint
    comment = "发布者用户ID"
  }
  column "publisher_name" {
    null    = true
    type    = varchar(128)
    comment = "发布者名称"
  }
  column "space_id" {
    null    = false
    type    = bigint
    comment = "所属空间ID"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "状态: 0-下架,1-上架,2-审核中"
  }
  column "view_count" {
    null    = true
    type    = int
    default = 0
    comment = "查看次数"
  }
  column "use_count" {
    null    = true
    type    = int
    default = 0
    comment = "使用次数"
  }
  column "favorite_count" {
    null    = true
    type    = int
    default = 0
    comment = "收藏次数"
  }
  column "is_featured" {
    null    = true
    type    = tinyint
    default = 0
    comment = "是否精选推荐"
  }
  column "is_official" {
    null    = true
    type    = tinyint
    default = 0
    comment = "是否官方认证"
  }
  column "tags" {
    null    = true
    type    = json
    comment = "标签列表"
  }
  column "extra_info" {
    null    = true
    type    = json
    comment = "扩展信息"
  }
  column "publish_time" {
    null    = false
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "发布时间"
  }
  column "created_at" {
    null    = false
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "创建时间"
  }
  column "updated_at" {
    null      = false
    type      = datetime
    default   = sql("CURRENT_TIMESTAMP")
    comment   = "更新时间"
    on_update = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_category_status" {
    columns = [column.category_id, column.status]
  }
  index "idx_publish_time" {
    columns = [column.publish_time]
  }
  index "idx_publisher_id" {
    columns = [column.publisher_id]
  }
  index "idx_space_id" {
    columns = [column.space_id]
  }
  index "idx_use_count" {
    columns = [column.use_count]
  }
  index "idx_view_count" {
    columns = [column.view_count]
  }
  index "uk_bot_id" {
    unique  = true
    columns = [column.bot_id]
  }
}
table "marketplace_bot_favorite" {
  schema  = schema.opencoze
  comment = "用户收藏表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "user_id" {
    null    = false
    type    = bigint
    comment = "用户ID"
  }
  column "bot_id" {
    null    = false
    type    = bigint
    comment = "智能体ID"
  }
  column "created_at" {
    null    = false
    type    = datetime
    default = sql("CURRENT_TIMESTAMP")
    comment = "收藏时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_bot_id" {
    columns = [column.bot_id]
  }
  index "idx_user_id" {
    columns = [column.user_id]
  }
  index "uk_user_bot" {
    unique  = true
    columns = [column.user_id, column.bot_id]
  }
}
table "marketplace_plugin_tools" {
  schema  = schema.opencoze
  comment = "Marketplace Plugin Tools Mapping Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Marketplace Plugin ID (关联 plugin_marketplace.id)"
  }
  column "stable_tool_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "稳定的工具ID (100000-999999范围)"
  }
  column "operation_id" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "OpenAPI operationId"
  }
  column "tool_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "工具名称"
  }
  column "method" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "HTTP Request Method"
  }
  column "sub_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "Sub URL Path"
  }
  column "operation" {
    null    = true
    type    = json
    comment = "Tool OpenAPI Operation Schema (与tool表格式一致)"
  }
  column "pkg_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "外部插件包名"
  }
  column "pkg_version" {
    null    = false
    type    = varchar(64)
    default = ""
    comment = "外部插件版本"
  }
  column "plugin_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "外部插件名称"
  }
  column "external_tool_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "外部工具名称"
  }
  column "activated_status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "0:activated; 1:deactivated"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = "v1.0.0"
    comment = "Tool Version"
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
  column "operation_json" {
    null    = true
    type    = text
    comment = "完整的OpenAPI操作JSON"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_activated_status" {
    columns = [column.activated_status]
  }
  index "idx_external_tool" {
    columns = [column.external_tool_name]
  }
  index "idx_pkg_info" {
    columns = [column.pkg_name, column.pkg_version, column.plugin_name]
  }
  index "idx_plugin_id" {
    columns = [column.plugin_id]
  }
  index "idx_plugin_operation" {
    columns = [column.plugin_id, column.operation_id]
  }
  index "idx_stable_tool_id" {
    columns = [column.stable_tool_id]
  }
  index "idx_tool_name" {
    columns = [column.tool_name]
  }
  index "uk_plugin_operation" {
    unique  = true
    columns = [column.plugin_id, column.operation_id]
  }
  index "uk_stable_tool_id" {
    unique  = true
    columns = [column.stable_tool_id]
  }
}
table "marketplace_sync_log" {
  schema  = schema.opencoze
  comment = "插件同步日志表"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    auto_increment = true
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "插件ID"
  }
  column "plugin_name" {
    null    = false
    type    = varchar(255)
    comment = "插件名称"
  }
  column "action" {
    null    = false
    type    = varchar(50)
    comment = "操作类型"
  }
  column "status" {
    null    = false
    type    = varchar(50)
    comment = "状态"
  }
  column "message" {
    null    = true
    type    = text
    comment = "消息"
  }
  column "created_at" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "创建时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_created_at" {
    columns = [column.created_at]
  }
  index "idx_plugin_id" {
    columns = [column.plugin_id]
  }
}
table "message" {
  schema  = schema.opencoze
  comment = "message record"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
    auto_increment = true
  }
  column "run_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "run_id"
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
    comment = "role: user、assistant、system"
  }
  column "content_type" {
    null    = false
    type    = varchar(100)
    default = ""
    comment = "content type 1 text"
  }
  column "content" {
    null    = true
    type    = mediumtext
    comment = "content"
  }
  column "message_type" {
    null    = false
    type    = varchar(100)
    default = ""
    comment = "message_type"
  }
  column "display_content" {
    null    = true
    type    = text
    comment = "display content"
  }
  column "ext" {
    null    = true
    type    = text
    comment = "message ext"
    collate = "utf8mb4_general_ci"
  }
  column "section_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "section_id"
  }
  column "broken_position" {
    null    = true
    type    = int
    default = -1
    comment = "broken position"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "message status: 1 Available 2 Deleted 3 Replaced 4 Broken 5 Failed 6 Streaming 7 Pending"
  }
  column "model_content" {
    null    = true
    type    = mediumtext
    comment = "model content"
  }
  column "meta_info" {
    null    = true
    type    = text
    comment = "text tagging information such as citation and highlighting"
  }
  column "reasoning_content" {
    null    = true
    type    = text
    comment = "reasoning content"
    collate = "utf8mb4_general_ci"
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
  index "idx_conversation_id" {
    columns = [column.conversation_id]
  }
  index "idx_run_id" {
    columns = [column.run_id]
  }
}
table "model_entity" {
  schema  = schema.opencoze
  comment = "Model information"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
    auto_increment = true
  }
  column "meta_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "model metadata id"
  }
  column "name" {
    null    = false
    type    = varchar(128)
    comment = "name"
  }
  column "description" {
    null    = true
    type    = text
    comment = "description"
  }
  column "default_params" {
    null    = true
    type    = json
    comment = "default params"
  }
  column "scenario" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "scenario"
  }
  column "status" {
    null    = false
    type    = int
    default = 1
    comment = "model status"
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
    comment  = "Delete Time"
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
  comment = "Model metadata"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
    auto_increment = true
  }
  column "model_name" {
    null    = false
    type    = varchar(128)
    comment = "model name"
  }
  column "protocol" {
    null    = false
    type    = varchar(128)
    comment = "model protocol"
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
    comment = "capability"
  }
  column "conn_config" {
    null    = true
    type    = json
    comment = "model conn config"
  }
  column "status" {
    null    = false
    type    = int
    default = 1
    comment = "model status"
  }
  column "description" {
    null    = false
    type    = varchar(2048)
    default = ""
    comment = "description"
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
    comment  = "Delete Time"
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
table "model_template" {
  schema  = schema.opencoze
  comment = "model_template"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "provider" {
    null    = true
    type    = varchar(64)
    comment = "模型提供商"
  }
  column "model_name" {
    null    = true
    type    = varchar(128)
    comment = "模型名称"
  }
  column "model_type" {
    null    = true
    type    = varchar(32)
    comment = "模型类型(llm/embedding/rerank/..)"
  }
  column "template" {
    null    = false
    type    = json
    comment = "模型模版，json格式"
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
  column "deleted_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "删除时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_provider" {
    columns = [column.provider]
  }
}
table "node_execution" {
  schema  = schema.opencoze
  comment = "Node run record, used to record the status information of each node during each workflow execution"
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
    comment  = "loop or batch_s execution index"
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
    comment = "when as inner node for loop or batch, this is the parent node_s key"
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
table "plugin_backup_20250812" {
  schema = schema.opencoze
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
table "plugin_marketplace" {
  schema  = schema.opencoze
  comment = "插件商店主表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "商店插件ID"
    auto_increment = true
  }
  column "template_plugin_id" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "关联的模板插件ID（可选）"
  }
  column "product_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "商店产品ID（唯一标识）"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "插件名称"
  }
  column "description" {
    null    = true
    type    = text
    comment = "插件描述"
  }
  column "icon_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "图标URL"
  }
  column "server_url" {
    null    = false
    type    = varchar(512)
    default = ""
    comment = "服务器URL"
  }
  column "version" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "版本号 e.g. v1.0.0"
  }
  column "version_desc" {
    null    = true
    type    = text
    comment = "版本描述"
  }
  column "plugin_type" {
    null    = false
    type    = tinyint
    default = 1
    comment = "插件类型：1=HTTP API, 6=本地插件"
  }
  column "manifest" {
    null    = true
    type    = json
    comment = "插件清单（JSON格式）"
  }
  column "openapi_doc" {
    null    = true
    type    = json
    comment = "OpenAPI文档（JSON格式）"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "状态：0=下架, 1=上架"
  }
  column "is_official" {
    null    = false
    type    = tinyint
    default = 0
    comment = "是否官方插件：0=否, 1=是"
  }
  column "is_free" {
    null    = false
    type    = tinyint
    default = 1
    comment = "是否免费：0=付费, 1=免费"
  }
  column "heat_score" {
    null    = false
    type    = int
    default = 0
    comment = "热度评分"
  }
  column "favorite_count" {
    null    = false
    type    = int
    default = 0
    comment = "收藏数量"
  }
  column "usage_count" {
    null    = false
    type    = int
    default = 0
    comment = "使用次数"
  }
  column "listed_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "上架时间（毫秒时间戳）"
  }
  column "created_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "创建时间（毫秒时间戳）"
  }
  column "updated_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "更新时间（毫秒时间戳）"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_heat_score" {
    columns = [column.heat_score]
  }
  index "idx_listed_at" {
    columns = [column.listed_at]
  }
  index "idx_status_official" {
    columns = [column.status, column.is_official]
  }
  index "idx_template_plugin_id" {
    columns = [column.template_plugin_id]
  }
  index "idx_usage_count" {
    columns = [column.usage_count]
  }
  index "uk_product_id" {
    unique  = true
    columns = [column.product_id]
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
    null    = true
    type    = text
    comment = "Access Token"
  }
  column "refresh_token" {
    null    = true
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
    comment        = "id"
    auto_increment = true
  }
  column "space_id" {
    null    = false
    type    = bigint
    comment = "space id"
  }
  column "name" {
    null    = false
    type    = varchar(255)
    comment = "name"
  }
  column "description" {
    null    = false
    type    = varchar(255)
    comment = "description"
  }
  column "prompt_text" {
    null    = true
    type    = mediumtext
    comment = "prompt text"
  }
  column "status" {
    null    = false
    type    = int
    comment = "status, 0 is invalid, 1 is valid"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    comment = "creator id"
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
  index "idx_creator_id" {
    columns = [column.creator_id]
  }
}
table "ragflow_api_4_conversation" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "dialog_id" {
    null = false
    type = varchar(32)
  }
  column "user_id" {
    null = false
    type = varchar(255)
  }
  column "message" {
    null = true
    type = longtext
  }
  column "reference" {
    null = true
    type = longtext
  }
  column "tokens" {
    null = false
    type = int
  }
  column "source" {
    null = true
    type = varchar(16)
  }
  column "dsl" {
    null = true
    type = longtext
  }
  column "duration" {
    null = false
    type = float
  }
  column "round" {
    null = false
    type = int
  }
  column "thumb_up" {
    null = false
    type = int
  }
  column "errors" {
    null = true
    type = text
  }
  primary_key {
    columns = [column.id]
  }
  index "api4conversation_create_date" {
    columns = [column.create_date]
  }
  index "api4conversation_create_time" {
    columns = [column.create_time]
  }
  index "api4conversation_dialog_id" {
    columns = [column.dialog_id]
  }
  index "api4conversation_duration" {
    columns = [column.duration]
  }
  index "api4conversation_round" {
    columns = [column.round]
  }
  index "api4conversation_source" {
    columns = [column.source]
  }
  index "api4conversation_thumb_up" {
    columns = [column.thumb_up]
  }
  index "api4conversation_update_date" {
    columns = [column.update_date]
  }
  index "api4conversation_update_time" {
    columns = [column.update_time]
  }
  index "api4conversation_user_id" {
    columns = [column.user_id]
  }
}
table "ragflow_canvas_template" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "avatar" {
    null = true
    type = text
  }
  column "title" {
    null = true
    type = longtext
  }
  column "description" {
    null = true
    type = longtext
  }
  column "canvas_type" {
    null = true
    type = varchar(32)
  }
  column "dsl" {
    null = true
    type = longtext
  }
  column "canvas_category" {
    null = false
    type = varchar(32)
  }
  primary_key {
    columns = [column.id]
  }
  index "canvas_template_canvas_category" {
    columns = [column.canvas_category]
  }
  index "canvastemplate_canvas_type" {
    columns = [column.canvas_type]
  }
  index "canvastemplate_create_date" {
    columns = [column.create_date]
  }
  index "canvastemplate_create_time" {
    columns = [column.create_time]
  }
  index "canvastemplate_update_date" {
    columns = [column.update_date]
  }
  index "canvastemplate_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_conversation" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "dialog_id" {
    null = false
    type = varchar(32)
  }
  column "name" {
    null = true
    type = varchar(255)
  }
  column "message" {
    null = true
    type = longtext
  }
  column "reference" {
    null = true
    type = longtext
  }
  column "user_id" {
    null = true
    type = varchar(255)
  }
  primary_key {
    columns = [column.id]
  }
  index "conversation_create_date" {
    columns = [column.create_date]
  }
  index "conversation_create_time" {
    columns = [column.create_time]
  }
  index "conversation_dialog_id" {
    columns = [column.dialog_id]
  }
  index "conversation_name" {
    columns = [column.name]
  }
  index "conversation_update_date" {
    columns = [column.update_date]
  }
  index "conversation_update_time" {
    columns = [column.update_time]
  }
  index "conversation_user_id" {
    columns = [column.user_id]
  }
}
table "ragflow_dialog" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "name" {
    null = true
    type = varchar(255)
  }
  column "description" {
    null = true
    type = text
  }
  column "icon" {
    null = true
    type = text
  }
  column "language" {
    null = true
    type = varchar(32)
  }
  column "llm_id" {
    null = false
    type = varchar(128)
  }
  column "llm_setting" {
    null = false
    type = longtext
  }
  column "prompt_type" {
    null = false
    type = varchar(16)
  }
  column "prompt_config" {
    null = false
    type = longtext
  }
  column "meta_data_filter" {
    null = true
    type = longtext
  }
  column "similarity_threshold" {
    null = false
    type = float
  }
  column "vector_similarity_weight" {
    null = false
    type = float
  }
  column "top_n" {
    null = false
    type = int
  }
  column "top_k" {
    null = false
    type = int
  }
  column "do_refer" {
    null = false
    type = varchar(1)
  }
  column "rerank_id" {
    null = false
    type = varchar(128)
  }
  column "kb_ids" {
    null = false
    type = longtext
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.id]
  }
  index "dialog_create_date" {
    columns = [column.create_date]
  }
  index "dialog_create_time" {
    columns = [column.create_time]
  }
  index "dialog_language" {
    columns = [column.language]
  }
  index "dialog_name" {
    columns = [column.name]
  }
  index "dialog_prompt_type" {
    columns = [column.prompt_type]
  }
  index "dialog_status" {
    columns = [column.status]
  }
  index "dialog_tenant_id" {
    columns = [column.tenant_id]
  }
  index "dialog_update_date" {
    columns = [column.update_date]
  }
  index "dialog_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_document" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "thumbnail" {
    null = true
    type = text
  }
  column "kb_id" {
    null = false
    type = varchar(256)
  }
  column "parser_id" {
    null = false
    type = varchar(32)
  }
  column "parser_config" {
    null = false
    type = longtext
  }
  column "source_type" {
    null = false
    type = varchar(128)
  }
  column "type" {
    null = false
    type = varchar(32)
  }
  column "created_by" {
    null = false
    type = varchar(32)
  }
  column "name" {
    null = true
    type = varchar(255)
  }
  column "location" {
    null = true
    type = varchar(255)
  }
  column "size" {
    null = false
    type = int
  }
  column "token_num" {
    null = false
    type = int
  }
  column "chunk_num" {
    null = false
    type = int
  }
  column "progress" {
    null = false
    type = float
  }
  column "progress_msg" {
    null = true
    type = text
  }
  column "process_begin_at" {
    null = true
    type = datetime
  }
  column "process_duration" {
    null = false
    type = float
  }
  column "meta_fields" {
    null = true
    type = longtext
  }
  column "suffix" {
    null = false
    type = varchar(32)
  }
  column "run" {
    null = true
    type = varchar(1)
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.id]
  }
  index "document_chunk_num" {
    columns = [column.chunk_num]
  }
  index "document_create_date" {
    columns = [column.create_date]
  }
  index "document_create_time" {
    columns = [column.create_time]
  }
  index "document_created_by" {
    columns = [column.created_by]
  }
  index "document_kb_id" {
    columns = [column.kb_id]
  }
  index "document_location" {
    columns = [column.location]
  }
  index "document_name" {
    columns = [column.name]
  }
  index "document_parser_id" {
    columns = [column.parser_id]
  }
  index "document_process_begin_at" {
    columns = [column.process_begin_at]
  }
  index "document_progress" {
    columns = [column.progress]
  }
  index "document_run" {
    columns = [column.run]
  }
  index "document_size" {
    columns = [column.size]
  }
  index "document_source_type" {
    columns = [column.source_type]
  }
  index "document_status" {
    columns = [column.status]
  }
  index "document_suffix" {
    columns = [column.suffix]
  }
  index "document_token_num" {
    columns = [column.token_num]
  }
  index "document_type" {
    columns = [column.type]
  }
  index "document_update_date" {
    columns = [column.update_date]
  }
  index "document_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_file" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "parent_id" {
    null = false
    type = varchar(32)
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "created_by" {
    null = false
    type = varchar(32)
  }
  column "name" {
    null = false
    type = varchar(255)
  }
  column "location" {
    null = true
    type = varchar(255)
  }
  column "size" {
    null = false
    type = int
  }
  column "type" {
    null = false
    type = varchar(32)
  }
  column "source_type" {
    null = false
    type = varchar(128)
  }
  primary_key {
    columns = [column.id]
  }
  index "file_create_date" {
    columns = [column.create_date]
  }
  index "file_create_time" {
    columns = [column.create_time]
  }
  index "file_created_by" {
    columns = [column.created_by]
  }
  index "file_location" {
    columns = [column.location]
  }
  index "file_name" {
    columns = [column.name]
  }
  index "file_parent_id" {
    columns = [column.parent_id]
  }
  index "file_size" {
    columns = [column.size]
  }
  index "file_source_type" {
    columns = [column.source_type]
  }
  index "file_tenant_id" {
    columns = [column.tenant_id]
  }
  index "file_type" {
    columns = [column.type]
  }
  index "file_update_date" {
    columns = [column.update_date]
  }
  index "file_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_file2document" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "file_id" {
    null = true
    type = varchar(32)
  }
  column "document_id" {
    null = true
    type = varchar(32)
  }
  primary_key {
    columns = [column.id]
  }
  index "file2document_create_date" {
    columns = [column.create_date]
  }
  index "file2document_create_time" {
    columns = [column.create_time]
  }
  index "file2document_document_id" {
    columns = [column.document_id]
  }
  index "file2document_file_id" {
    columns = [column.file_id]
  }
  index "file2document_update_date" {
    columns = [column.update_date]
  }
  index "file2document_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_invitation_code" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "code" {
    null = false
    type = varchar(32)
  }
  column "visit_time" {
    null = true
    type = datetime
  }
  column "user_id" {
    null = true
    type = varchar(32)
  }
  column "tenant_id" {
    null = true
    type = varchar(32)
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.id]
  }
  index "invitationcode_code" {
    columns = [column.code]
  }
  index "invitationcode_create_date" {
    columns = [column.create_date]
  }
  index "invitationcode_create_time" {
    columns = [column.create_time]
  }
  index "invitationcode_status" {
    columns = [column.status]
  }
  index "invitationcode_tenant_id" {
    columns = [column.tenant_id]
  }
  index "invitationcode_update_date" {
    columns = [column.update_date]
  }
  index "invitationcode_update_time" {
    columns = [column.update_time]
  }
  index "invitationcode_user_id" {
    columns = [column.user_id]
  }
  index "invitationcode_visit_time" {
    columns = [column.visit_time]
  }
}
table "ragflow_kb_api_tokens" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "kb_id" {
    null = false
    type = varchar(32)
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "token" {
    null = false
    type = varchar(255)
  }
  column "name" {
    null = true
    type = varchar(255)
  }
  column "description" {
    null = true
    type = text
  }
  column "permissions" {
    null = false
    type = longtext
  }
  column "status" {
    null = false
    type = varchar(16)
  }
  column "expires_at" {
    null = true
    type = datetime
  }
  column "created_by" {
    null = false
    type = varchar(32)
  }
  primary_key {
    columns = [column.id]
  }
  index "knowledgebaseapitoken_create_date" {
    columns = [column.create_date]
  }
  index "knowledgebaseapitoken_create_time" {
    columns = [column.create_time]
  }
  index "knowledgebaseapitoken_kb_id" {
    columns = [column.kb_id]
  }
  index "knowledgebaseapitoken_kb_id_token" {
    columns = [column.kb_id, column.token]
  }
  index "knowledgebaseapitoken_tenant_id" {
    columns = [column.tenant_id]
  }
  index "knowledgebaseapitoken_tenant_id_token" {
    columns = [column.tenant_id, column.token]
  }
  index "knowledgebaseapitoken_token" {
    unique  = true
    columns = [column.token]
  }
  index "knowledgebaseapitoken_update_date" {
    columns = [column.update_date]
  }
  index "knowledgebaseapitoken_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_knowledgebase" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "avatar" {
    null = true
    type = text
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "name" {
    null = false
    type = varchar(128)
  }
  column "language" {
    null = true
    type = varchar(32)
  }
  column "description" {
    null = true
    type = text
  }
  column "embd_id" {
    null = false
    type = varchar(128)
  }
  column "permission" {
    null = false
    type = varchar(16)
  }
  column "created_by" {
    null = false
    type = varchar(32)
  }
  column "doc_num" {
    null = false
    type = int
  }
  column "token_num" {
    null = false
    type = int
  }
  column "chunk_num" {
    null = false
    type = int
  }
  column "similarity_threshold" {
    null = false
    type = float
  }
  column "vector_similarity_weight" {
    null = false
    type = float
  }
  column "parser_id" {
    null = false
    type = varchar(32)
  }
  column "parser_config" {
    null = false
    type = longtext
  }
  column "pagerank" {
    null = false
    type = int
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.id]
  }
  index "knowledgebase_chunk_num" {
    columns = [column.chunk_num]
  }
  index "knowledgebase_create_date" {
    columns = [column.create_date]
  }
  index "knowledgebase_create_time" {
    columns = [column.create_time]
  }
  index "knowledgebase_created_by" {
    columns = [column.created_by]
  }
  index "knowledgebase_doc_num" {
    columns = [column.doc_num]
  }
  index "knowledgebase_embd_id" {
    columns = [column.embd_id]
  }
  index "knowledgebase_language" {
    columns = [column.language]
  }
  index "knowledgebase_name" {
    columns = [column.name]
  }
  index "knowledgebase_parser_id" {
    columns = [column.parser_id]
  }
  index "knowledgebase_permission" {
    columns = [column.permission]
  }
  index "knowledgebase_similarity_threshold" {
    columns = [column.similarity_threshold]
  }
  index "knowledgebase_status" {
    columns = [column.status]
  }
  index "knowledgebase_tenant_id" {
    columns = [column.tenant_id]
  }
  index "knowledgebase_token_num" {
    columns = [column.token_num]
  }
  index "knowledgebase_update_date" {
    columns = [column.update_date]
  }
  index "knowledgebase_update_time" {
    columns = [column.update_time]
  }
  index "knowledgebase_vector_similarity_weight" {
    columns = [column.vector_similarity_weight]
  }
}
table "ragflow_llm" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "llm_name" {
    null = false
    type = varchar(128)
  }
  column "model_type" {
    null = false
    type = varchar(128)
  }
  column "fid" {
    null = false
    type = varchar(128)
  }
  column "max_tokens" {
    null = false
    type = int
  }
  column "tags" {
    null = false
    type = varchar(255)
  }
  column "is_tools" {
    null = false
    type = bool
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.fid, column.llm_name]
  }
  index "llm_create_date" {
    columns = [column.create_date]
  }
  index "llm_create_time" {
    columns = [column.create_time]
  }
  index "llm_fid" {
    columns = [column.fid]
  }
  index "llm_llm_name" {
    columns = [column.llm_name]
  }
  index "llm_model_type" {
    columns = [column.model_type]
  }
  index "llm_status" {
    columns = [column.status]
  }
  index "llm_tags" {
    columns = [column.tags]
  }
  index "llm_update_date" {
    columns = [column.update_date]
  }
  index "llm_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_llm_factories" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "name" {
    null = false
    type = varchar(128)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "logo" {
    null = true
    type = text
  }
  column "tags" {
    null = false
    type = varchar(255)
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.name]
  }
  index "llmfactories_create_date" {
    columns = [column.create_date]
  }
  index "llmfactories_create_time" {
    columns = [column.create_time]
  }
  index "llmfactories_status" {
    columns = [column.status]
  }
  index "llmfactories_tags" {
    columns = [column.tags]
  }
  index "llmfactories_update_date" {
    columns = [column.update_date]
  }
  index "llmfactories_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_mcp_server" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "name" {
    null = false
    type = varchar(255)
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "url" {
    null = false
    type = varchar(2048)
  }
  column "server_type" {
    null = false
    type = varchar(32)
  }
  column "description" {
    null = true
    type = text
  }
  column "variables" {
    null = true
    type = longtext
  }
  column "headers" {
    null = true
    type = longtext
  }
  primary_key {
    columns = [column.id]
  }
  index "mcpserver_create_date" {
    columns = [column.create_date]
  }
  index "mcpserver_create_time" {
    columns = [column.create_time]
  }
  index "mcpserver_tenant_id" {
    columns = [column.tenant_id]
  }
  index "mcpserver_update_date" {
    columns = [column.update_date]
  }
  index "mcpserver_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_search" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "avatar" {
    null = true
    type = text
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "name" {
    null = false
    type = varchar(128)
  }
  column "description" {
    null = true
    type = text
  }
  column "created_by" {
    null = false
    type = varchar(32)
  }
  column "search_config" {
    null = false
    type = longtext
  }
  column "status" {
    null = true
    type = varchar(1)
  }
  primary_key {
    columns = [column.id]
  }
  index "search_create_date" {
    columns = [column.create_date]
  }
  index "search_create_time" {
    columns = [column.create_time]
  }
  index "search_created_by" {
    columns = [column.created_by]
  }
  index "search_name" {
    columns = [column.name]
  }
  index "search_status" {
    columns = [column.status]
  }
  index "search_tenant_id" {
    columns = [column.tenant_id]
  }
  index "search_update_date" {
    columns = [column.update_date]
  }
  index "search_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_session_map" {
  schema  = schema.opencoze
  comment = "Session mapping between RAGFlow and Coze"
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null           = false
    type           = int
    auto_increment = true
  }
  column "coze_user_id" {
    null = false
    type = bigint
  }
  column "ragflow_user_id" {
    null = false
    type = varchar(32)
  }
  column "session_key" {
    null = false
    type = varchar(255)
  }
  column "ragflow_token" {
    null = true
    type = varchar(255)
  }
  column "created_at" {
    null    = true
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }
  column "updated_at" {
    null      = true
    type      = timestamp
    default   = sql("CURRENT_TIMESTAMP")
    on_update = sql("CURRENT_TIMESTAMP")
  }
  column "expires_at" {
    null = true
    type = timestamp
  }
  column "is_active" {
    null    = true
    type    = bool
    default = 1
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_coze_user" {
    columns = [column.coze_user_id]
  }
  index "idx_ragflow_user" {
    columns = [column.ragflow_user_id]
  }
  index "idx_session_key" {
    columns = [column.session_key]
  }
  index "uk_session" {
    unique  = true
    columns = [column.session_key]
  }
}
table "ragflow_task" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "doc_id" {
    null = false
    type = varchar(32)
  }
  column "from_page" {
    null = false
    type = int
  }
  column "to_page" {
    null = false
    type = int
  }
  column "task_type" {
    null = false
    type = varchar(32)
  }
  column "priority" {
    null = false
    type = int
  }
  column "begin_at" {
    null = true
    type = datetime
  }
  column "process_duration" {
    null = false
    type = float
  }
  column "progress" {
    null = false
    type = float
  }
  column "progress_msg" {
    null = true
    type = text
  }
  column "retry_count" {
    null = false
    type = int
  }
  column "digest" {
    null = true
    type = text
  }
  column "chunk_ids" {
    null = true
    type = longtext
  }
  primary_key {
    columns = [column.id]
  }
  index "task_begin_at" {
    columns = [column.begin_at]
  }
  index "task_create_date" {
    columns = [column.create_date]
  }
  index "task_create_time" {
    columns = [column.create_time]
  }
  index "task_doc_id" {
    columns = [column.doc_id]
  }
  index "task_progress" {
    columns = [column.progress]
  }
  index "task_update_date" {
    columns = [column.update_date]
  }
  index "task_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_tenant_config" {
  schema  = schema.opencoze
  comment = "租户配置表"
  column "tenant_id" {
    null    = false
    type    = varchar(32)
    comment = "租户ID，对应user表的MD5(id)"
  }
  column "name" {
    null    = true
    type    = varchar(100)
    comment = "租户名称"
  }
  column "llm_id" {
    null    = true
    type    = varchar(128)
    comment = "默认LLM模型ID"
  }
  column "embd_id" {
    null    = true
    type    = varchar(128)
    comment = "默认嵌入模型ID"
  }
  column "asr_id" {
    null    = true
    type    = varchar(128)
    comment = "默认ASR模型ID"
  }
  column "img2txt_id" {
    null    = true
    type    = varchar(128)
    comment = "默认图像识别模型ID"
  }
  column "rerank_id" {
    null    = true
    type    = varchar(128)
    comment = "默认重排序模型ID"
  }
  column "tts_id" {
    null    = true
    type    = varchar(256)
    comment = "默认TTS模型ID"
  }
  column "parser_ids" {
    null    = true
    type    = varchar(256)
    comment = "文档处理器"
  }
  column "description" {
    null    = true
    type    = text
    comment = "租户描述"
  }
  column "settings" {
    null    = true
    type    = text
    comment = "其他配置信息(JSON格式)"
  }
  column "create_time" {
    null    = true
    type    = bigint
    comment = "创建时间戳"
  }
  column "create_date" {
    null    = true
    type    = datetime
    comment = "创建日期"
  }
  column "update_time" {
    null    = true
    type    = bigint
    comment = "更新时间戳"
  }
  column "update_date" {
    null    = true
    type    = datetime
    comment = "更新日期"
  }
  primary_key {
    columns = [column.tenant_id]
  }
  index "idx_asr_id" {
    columns = [column.asr_id]
  }
  index "idx_embd_id" {
    columns = [column.embd_id]
  }
  index "idx_img2txt_id" {
    columns = [column.img2txt_id]
  }
  index "idx_llm_id" {
    columns = [column.llm_id]
  }
  index "idx_name" {
    columns = [column.name]
  }
  index "idx_parser_ids" {
    columns = [column.parser_ids]
  }
  index "idx_rerank_id" {
    columns = [column.rerank_id]
  }
  index "idx_tts_id" {
    columns = [column.tts_id]
  }
}
table "ragflow_tenant_langfuse" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "secret_key" {
    null = false
    type = varchar(2048)
  }
  column "public_key" {
    null = false
    type = varchar(2048)
  }
  column "host" {
    null = false
    type = varchar(128)
  }
  primary_key {
    columns = [column.tenant_id]
  }
  index "tenantlangfuse_create_date" {
    columns = [column.create_date]
  }
  index "tenantlangfuse_create_time" {
    columns = [column.create_time]
  }
  index "tenantlangfuse_host" {
    columns = [column.host]
  }
  index "tenantlangfuse_public_key" {
    on {
      column = column.public_key
      prefix = 768
    }
  }
  index "tenantlangfuse_secret_key" {
    on {
      column = column.secret_key
      prefix = 768
    }
  }
  index "tenantlangfuse_update_date" {
    columns = [column.update_date]
  }
  index "tenantlangfuse_update_time" {
    columns = [column.update_time]
  }
}
table "ragflow_tenant_llm" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "llm_factory" {
    null = false
    type = varchar(128)
  }
  column "model_type" {
    null = true
    type = varchar(128)
  }
  column "llm_name" {
    null = false
    type = varchar(128)
  }
  column "api_key" {
    null = true
    type = varchar(2048)
  }
  column "api_base" {
    null = true
    type = varchar(255)
  }
  column "max_tokens" {
    null = false
    type = int
  }
  column "used_tokens" {
    null = false
    type = int
  }
  primary_key {
    columns = [column.tenant_id, column.llm_factory, column.llm_name]
  }
  index "tenantllm_api_key" {
    on {
      column = column.api_key
      prefix = 768
    }
  }
  index "tenantllm_create_date" {
    columns = [column.create_date]
  }
  index "tenantllm_create_time" {
    columns = [column.create_time]
  }
  index "tenantllm_llm_factory" {
    columns = [column.llm_factory]
  }
  index "tenantllm_llm_name" {
    columns = [column.llm_name]
  }
  index "tenantllm_max_tokens" {
    columns = [column.max_tokens]
  }
  index "tenantllm_model_type" {
    columns = [column.model_type]
  }
  index "tenantllm_tenant_id" {
    columns = [column.tenant_id]
  }
  index "tenantllm_update_date" {
    columns = [column.update_date]
  }
  index "tenantllm_update_time" {
    columns = [column.update_time]
  }
  index "tenantllm_used_tokens" {
    columns = [column.used_tokens]
  }
}
table "ragflow_user_canvas" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "avatar" {
    null = true
    type = text
  }
  column "user_id" {
    null = false
    type = varchar(255)
  }
  column "title" {
    null = true
    type = varchar(255)
  }
  column "permission" {
    null = false
    type = varchar(16)
  }
  column "description" {
    null = true
    type = text
  }
  column "canvas_type" {
    null = true
    type = varchar(32)
  }
  column "dsl" {
    null = true
    type = longtext
  }
  column "canvas_category" {
    null = false
    type = varchar(32)
  }
  primary_key {
    columns = [column.id]
  }
  index "user_canvas_canvas_category" {
    columns = [column.canvas_category]
  }
  index "usercanvas_canvas_type" {
    columns = [column.canvas_type]
  }
  index "usercanvas_create_date" {
    columns = [column.create_date]
  }
  index "usercanvas_create_time" {
    columns = [column.create_time]
  }
  index "usercanvas_permission" {
    columns = [column.permission]
  }
  index "usercanvas_update_date" {
    columns = [column.update_date]
  }
  index "usercanvas_update_time" {
    columns = [column.update_time]
  }
  index "usercanvas_user_id" {
    columns = [column.user_id]
  }
}
table "ragflow_user_canvas_version" {
  schema  = schema.opencoze
  collate = "utf8mb4_0900_ai_ci"
  column "id" {
    null = false
    type = varchar(32)
  }
  column "create_time" {
    null = true
    type = bigint
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null = true
    type = bigint
  }
  column "update_date" {
    null = true
    type = datetime
  }
  column "user_canvas_id" {
    null = false
    type = varchar(255)
  }
  column "title" {
    null = true
    type = varchar(255)
  }
  column "description" {
    null = true
    type = text
  }
  column "dsl" {
    null = true
    type = longtext
  }
  primary_key {
    columns = [column.id]
  }
  index "usercanvasversion_create_date" {
    columns = [column.create_date]
  }
  index "usercanvasversion_create_time" {
    columns = [column.create_time]
  }
  index "usercanvasversion_update_date" {
    columns = [column.update_date]
  }
  index "usercanvasversion_update_time" {
    columns = [column.update_time]
  }
  index "usercanvasversion_user_canvas_id" {
    columns = [column.user_canvas_id]
  }
}
table "ragflow_user_tenant_real" {
  schema = schema.opencoze
  column "id" {
    null = false
    type = varchar(32)
  }
  column "user_id" {
    null = false
    type = varchar(32)
  }
  column "tenant_id" {
    null = false
    type = varchar(32)
  }
  column "role" {
    null    = false
    type    = varchar(16)
    default = "normal"
  }
  column "invited_by" {
    null = true
    type = varchar(32)
  }
  column "status" {
    null    = false
    type    = varchar(1)
    default = "1"
  }
  column "create_time" {
    null     = true
    type     = bigint
    unsigned = true
  }
  column "create_date" {
    null = true
    type = datetime
  }
  column "update_time" {
    null     = true
    type     = bigint
    unsigned = true
  }
  column "update_date" {
    null = true
    type = datetime
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_status" {
    columns = [column.status]
  }
  index "idx_tenant_id" {
    columns = [column.tenant_id]
  }
  index "idx_user_id" {
    columns = [column.user_id]
  }
  index "idx_user_tenant" {
    columns = [column.user_id, column.tenant_id]
  }
}
table "resource_folder_mapping" {
  schema  = schema.opencoze
  comment = "Resource to Folder Mapping Table"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "Primary Key ID"
    auto_increment = true
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Space ID"
  }
  column "resource_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Resource ID (workflow_id, knowledge_id, etc.)"
  }
  column "resource_type" {
    null     = false
    type     = tinyint
    unsigned = true
    comment  = "Resource Type: 1=agent, 2=workflow, 3=knowledge, 4=database, 5=plugin"
  }
  column "folder_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "Folder ID"
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
  index "idx_resource_id_type" {
    columns = [column.resource_id, column.resource_type]
  }
  index "idx_space_id_folder_id" {
    columns = [column.space_id, column.folder_id]
  }
  index "uniq_resource_mapping" {
    unique  = true
    columns = [column.resource_id, column.resource_type, column.space_id]
  }
}
table "run_record" {
  schema  = schema.opencoze
  comment = "run record"
  column "id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "id"
  }
  column "conversation_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "conversation id"
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
    comment  = "Execute source 0 API"
  }
  column "status" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "status,0 Unknown, 1-Created,2-InProgress,3-Completed,4-Failed,5-Expired,6-Cancelled,7-RequiresAction"
  }
  column "creator_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "creator id"
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
  column "failed_at" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Fail Time in Milliseconds"
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
    comment  = "Finish Time in Milliseconds"
  }
  column "chat_request" {
    null    = true
    type    = text
    comment = "Original request field"
    collate = "utf8mb4_general_ci"
  }
  column "ext" {
    null    = true
    type    = text
    comment = "ext"
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
  comment = "bot shortcut command table"
  collate = "utf8mb4_general_ci"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
    auto_increment = true
  }
  column "object_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "Entity ID, this command can be used for this entity"
  }
  column "command_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "command id"
  }
  column "command_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "command name"
  }
  column "shortcut_command" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "shortcut command"
  }
  column "description" {
    null    = false
    type    = varchar(2000)
    default = ""
    comment = "description"
  }
  column "send_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "send type 0:query 1:panel"
  }
  column "tool_type" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "Type 1 of tool used: WorkFlow 2: Plugin"
  }
  column "work_flow_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "workflow id"
  }
  column "plugin_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "plugin id"
  }
  column "plugin_tool_name" {
    null    = false
    type    = varchar(255)
    default = ""
    comment = "plugin tool name"
  }
  column "template_query" {
    null    = true
    type    = text
    comment = "template query"
  }
  column "components" {
    null    = true
    type    = json
    comment = "Panel parameters"
  }
  column "card_schema" {
    null    = true
    type    = text
    comment = "card schema"
  }
  column "tool_info" {
    null    = true
    type    = json
    comment = "Tool information includes name+variable list"
  }
  column "status" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "Status, 0 is invalid, 1 is valid"
  }
  column "creator_id" {
    null     = true
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "creator id"
  }
  column "is_online" {
    null     = false
    type     = tinyint
    default  = 0
    unsigned = true
    comment  = "Is online information: 0 draft 1 online"
  }
  column "created_at" {
    null    = false
    type    = bigint
    default = 0
    comment = "Create Time in Milliseconds"
  }
  column "updated_at" {
    null    = false
    type    = bigint
    default = 0
    comment = "Update Time in Milliseconds"
  }
  column "agent_id" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "When executing a multi instruction, which node executes the instruction"
  }
  column "shortcut_icon" {
    null    = true
    type    = json
    comment = "shortcut icon"
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
    null    = true
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
    comment = "variables meta table ID"
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
  column "external_knowledge" {
    null    = true
    type    = json
    comment = "External knowledge base configuration"
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
  column "bot_mode" {
    null    = false
    type    = tinyint
    default = 0
    comment = "bot mode,0:single mode 2:chatflow mode"
  }
  column "shortcut_command" {
    null    = true
    type    = json
    comment = "shortcut command"
  }
  column "layout_info" {
    null    = true
    type    = text
    comment = "chatflow layout info"
  }
  column "memory_tool_config" {
    null    = true
    type    = json
    comment = "Memory Tool Configuration"
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
  comment = "Bot connector and release version info"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "id"
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
    comment = "publish id"
    collate = "utf8mb4_general_ci"
  }
  column "connector_ids" {
    null    = true
    type    = json
    comment = "connector_ids"
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
    comment = "publish info"
    collate = "utf8mb4_general_ci"
  }
  column "publish_time" {
    null     = false
    type     = bigint
    default  = 0
    unsigned = true
    comment  = "publish time"
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
    comment  = "creator id"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 0
    comment = "Status 0: In use 1: Delete 3: Disabled"
  }
  column "extra" {
    null    = true
    type    = json
    comment = "extra"
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
    null    = true
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
    comment = "variables meta table ID"
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
  column "external_knowledge" {
    null    = true
    type    = json
    comment = "External knowledge base configuration"
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
  column "memory_tool_config" {
    null    = true
    type    = json
    comment = "Memory Tool Configuration"
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
  column "bot_mode" {
    null    = false
    type    = tinyint
    default = 0
    comment = "bot mode,0:single mode 2:chatflow mode"
  }
  column "shortcut_command" {
    null    = true
    type    = json
    comment = "shortcut command"
  }
  column "layout_info" {
    null    = true
    type    = text
    comment = "chatflow layout info"
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
table "space_model" {
  schema  = schema.opencoze
  comment = "空间模型关联表"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "space_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "空间ID"
  }
  column "model_entity_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "模型实体ID"
  }
  column "user_id" {
    null     = false
    type     = bigint
    unsigned = true
    comment  = "创建者ID"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 1
    comment = "状态: 1启用 2禁用"
  }
  column "custom_config" {
    null    = true
    type    = json
    comment = "空间自定义配置(覆盖默认配置)"
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
  column "deleted_at" {
    null     = true
    type     = bigint
    unsigned = true
    comment  = "删除时间"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_creator_id" {
    columns = [column.user_id]
  }
  index "idx_model_entity_id" {
    columns = [column.model_entity_id]
  }
  index "idx_space_id_status" {
    columns = [column.space_id, column.status]
  }
  index "uniq_space_model" {
    unique  = true
    columns = [column.space_id, column.model_entity_id]
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
table "statistics_export_file" {
  schema  = schema.opencoze
  comment = "Conversation statistics export files"
  collate = "utf8mb4_general_ci"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "primary key"
    auto_increment = true
  }
  column "agent_id" {
    null    = false
    type    = bigint
    comment = "agent id"
  }
  column "export_task_id" {
    null    = false
    type    = varchar(64)
    comment = "export task id"
  }
  column "file_name" {
    null    = false
    type    = varchar(255)
    comment = "exported file name"
  }
  column "object_key" {
    null    = false
    type    = varchar(512)
    comment = "object storage key"
  }
  column "created_at" {
    null    = false
    type    = datetime(3)
    default = sql("CURRENT_TIMESTAMP(3)")
    comment = "created time"
  }
  column "expire_at" {
    null    = false
    type    = datetime(3)
    comment = "expire time"
  }
  column "status" {
    null    = false
    type    = tinyint
    default = 0
    comment = "upload status"
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_agent_expire" {
    columns = [column.agent_id, column.expire_at]
  }
  index "idx_expire_at" {
    columns = [column.expire_at]
  }
  index "uk_export_task_id" {
    unique  = true
    columns = [column.export_task_id]
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
  column "plugin_extra" {
    null    = true
    type    = json
    comment = "Plugin Extra Info"
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
  index "uniq_agent_id_space_id" {
    unique  = true
    columns = [column.agent_id, column.space_id]
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
table "user_memory_config" {
  schema  = schema.opencoze
  comment = "用户记忆配置表，存储用户记忆功能的配置信息"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "user_id" {
    null    = false
    type    = varchar(255)
    comment = "用户ID"
  }
  column "connector_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "连接器ID"
  }
  column "memory_enabled" {
    null    = false
    type    = bool
    default = 0
    comment = "是否启用记忆功能，0=禁用，1=启用"
  }
  column "auto_learn" {
    null    = false
    type    = bool
    default = 1
    comment = "是否自动学习，0=不自动学习，1=自动学习用户偏好"
  }
  column "search_context_lines" {
    null    = false
    type    = int
    default = 10
    comment = "搜索上下文行数，默认前后10行"
  }
  column "max_document_lines" {
    null    = false
    type    = int
    default = 10000
    comment = "文档最大行数限制"
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
    comment = "创建时间"
  }
  column "updated_at" {
    null      = false
    type      = timestamp
    default   = sql("CURRENT_TIMESTAMP")
    comment   = "更新时间"
    on_update = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_memory_enabled" {
    columns = [column.memory_enabled]
    comment = "记忆启用状态索引"
  }
  index "idx_user_id_config" {
    columns = [column.user_id]
    comment = "用户ID索引"
  }
  index "uk_user_connector_config" {
    unique  = true
    columns = [column.user_id, column.connector_id]
    comment = "用户和连接器配置唯一索引"
  }
}
table "user_memory_document" {
  schema  = schema.opencoze
  comment = "用户记忆文档表，存储每个用户的完整记忆文档"
  column "id" {
    null           = false
    type           = bigint
    unsigned       = true
    comment        = "主键ID"
    auto_increment = true
  }
  column "user_id" {
    null    = false
    type    = varchar(255)
    comment = "用户ID，全局唯一标识"
  }
  column "connector_id" {
    null    = false
    type    = bigint
    default = 0
    comment = "连接器ID"
  }
  column "document_content" {
    null    = false
    type    = longtext
    comment = "记忆文档内容，完整的文本记录用户的所有记忆"
  }
  column "line_count" {
    null    = false
    type    = int
    default = 0
    comment = "文档行数，用于上下文检索"
  }
  column "version" {
    null    = false
    type    = int
    default = 1
    comment = "文档版本号，每次更新递增"
  }
  column "enabled" {
    null    = false
    type    = bool
    default = 1
    comment = "是否启用记忆功能，0=禁用，1=启用"
  }
  column "created_at" {
    null    = false
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
    comment = "创建时间"
  }
  column "updated_at" {
    null      = false
    type      = timestamp
    default   = sql("CURRENT_TIMESTAMP")
    comment   = "更新时间"
    on_update = sql("CURRENT_TIMESTAMP")
  }
  primary_key {
    columns = [column.id]
  }
  index "idx_enabled" {
    columns = [column.enabled]
    comment = "启用状态索引"
  }
  index "idx_updated_at" {
    columns = [column.updated_at]
    comment = "更新时间索引"
  }
  index "idx_user_id" {
    columns = [column.user_id]
    comment = "用户ID索引"
  }
  index "uk_user_connector" {
    unique  = true
    columns = [column.user_id, column.connector_id]
    comment = "用户和连接器组合唯一索引"
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
    null    = true
    type    = mediumtext
    comment = "Front end schema"
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
table "workflow_meta_backup_20250812" {
  schema = schema.opencoze
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
    null    = true
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
    null    = true
    type    = mediumtext
    comment = "Front end schema"
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
