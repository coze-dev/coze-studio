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
    16: optional list<string> shortcut_sort // Shortcut ID list, bound on the entity
    17: optional list<ShortcutCommand> shortcut_list // Quick command content list
}

struct ShortcutCommand {
   2 : i64 object_id    (api.js_conv="true")         // Binding Entity ID
   3 : string command_name       // command name
   4 : string shortcut_command   // Quick Instruction
   5 : string description        // describe
   6 : SendType send_type          // Send type
   7 : ToolType tool_type          // Use tool type
   8 : string work_flow_id
   9 : string plugin_id
   10: string plugin_api_name
   11 : string template_query     // Template query
   12 : list<Components> components_list     // Panel parameters
   15 : string card_schema // Form schema
   16 : i64 command_id  (api.js_conv="true") // Instruction ID
   17 : ToolInfo  tool_info //Tool information, including name + variable list +...
   18 : ShortcutFileInfo shortcut_icon // command icon
   21 : optional string agent_id //Multi instruction, which node executes the instruction
   22 : i64 plugin_api_id  (api.js_conv="true")
}

struct ShortcutFileInfo {
    1 : string url
    2 : string uri
}


struct Components { // Panel parameters
    1 : string name
    2 : string description
    3 : InputType input_type
    4 : string parameter  // When requesting the tool, the key of the parameter
    5 : list<string> options
    6 : DefaultValue default_value
    7 : bool hide // Whether to hide or not to show
    8 : list<InputType> upload_options // What types are supported input_type MixUpload
}

struct DefaultValue {
    1: string value
    2: InputType type
}

struct ToolInfo {
    1:string tool_name
    2:list<ToolParams> tool_params_list // Variable lists, plugins & workFLow
}

struct ToolParams { // parameter list
   1 : string name
   2 : bool   required
   3 : string desc
   4 : string type
   6 : string default_value // default value
   8 : bool   refer_component // Is it a panel parameter?
}

enum SendType {
    SendTypeQuery =  0 // Send query directly
    SendTypePanel =  1 // use panel
}

enum ToolType {
    ToolTypeWorkFlow = 1 // Using WorkFlow
    ToolTypePlugin = 2   // use plug-ins
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

