namespace go ocean.cloud.playground
include "../base.thrift"

struct CreateShortcutCommandRequest {
     1:   string object_id
     2:   ShortcutCommand shortcuts
     255: base.Base Base
}


struct CreateShortcutCommandResponse {

    1:   ShortcutCommand shortcuts
    255: required base.BaseResp BaseResp
}



struct ShortcutStruct {
    16: optional list<string> shortcut_sort // 快捷指令ID列表 实体上绑定的
    17: optional list<ShortcutCommand> shortcut_list // 快捷指令内容list
}

struct ShortcutCommand {
   2 : i64 object_id    (api.js_conv="true")         // 绑定实体ID
   3 : string command_name       // 命令名称
   4 : string shortcut_command   // 快捷指令
   5 : string description        // 描述
   6 : SendType send_type          // 发送类型
   7 : ToolType tool_type          // 使用工具type
   8 : string work_flow_id
   9 : string plugin_id
   10: string plugin_api_name
   11 : string template_query     // 模板query
   12 : list<Components> components_list     // panel参数
   15 : string card_schema // 表单的schema
   16 : i64 command_id  (api.js_conv="true") // 指令ID
   17 : ToolInfo  tool_info //工具信息 包含name+变量列表+...
   18 : ShortcutFileInfo shortcut_icon // 指令图标
   21 : optional string agent_id //multi的指令时，该指令由哪个节点执行
   22 : i64 plugin_api_id  (api.js_conv="true")
}

struct ShortcutFileInfo {
    1 : string url
    2 : string uri
}


struct Components { // panel参数
    1 : string name
    2 : string description
    3 : InputType input_type
    4 : string parameter  // 请求工具时，参数的key
    5 : list<string> options
    6 : DefaultValue default_value
    7 : bool hide // 是否隐藏不展示
    8 : list<InputType> upload_options // input_type为MixUpload时，支持哪些类型
}

struct DefaultValue {
    1: string value
    2: InputType type
}

struct ToolInfo {
    1:string tool_name
    2:list<ToolParams> tool_params_list // 变量列表 插件&workFLow
}

struct ToolParams { // 参数列表
   1 : string name
   2 : bool   required
   3 : string desc
   4 : string type
   6 : string default_value // 默认值
   8 : bool   refer_component // 是否是panel参数
}

enum SendType {
    SendTypeQuery =  0 // 直接发query
    SendTypePanel =  1 // 使用面板
}

enum ToolType {
    ToolTypeWorkFlow = 1 // 使用WorkFlow
    ToolTypePlugin = 2   // 使用插件
}

enum InputType {
  TextInput = 0,
  Select = 1,
  UploadImage = 2,
  UploadDoc = 3,
  UploadTable = 4,
  UploadAudio = 5,
  MixUpload = 6,
  VIDEO = 7,
  ARCHIVE = 8,
  CODE = 9,
  TXT = 10,
  PPT = 11,
}

struct CreateUpdateShortcutCommandRequest {
     1: required  i64 object_id (api.js_conv="true")
     2: required  i64 space_id  (api.js_conv="true")
     3: required  ShortcutCommand shortcuts
     255: base.Base Base
}
struct CreateUpdateShortcutCommandResponse {
    1:   ShortcutCommand shortcuts

    
    253: required i64    code
    254: required string msg
    255: required base.BaseResp BaseResp
}

