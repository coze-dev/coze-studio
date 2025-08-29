include "../base.thrift"

namespace go modelmgr

// 模型管理与空间模型配置相关接口

struct ModelParamOption {
    1: optional string label,
    2: optional string value,
}

struct ParamDisplayStyle {
    1: required string widget,
    2: required map<string,string> label,
}

struct ModelParameterInput {
    1: required string name,
    2: required map<string,string> label,
    3: required map<string,string> desc,
    4: required string type, // int | float | boolean | string
    5: optional string min,
    6: optional string max,
    7: required map<string,string> default_val,
    8: optional i32 precision,
    9: optional list<ModelParamOption> options,
    10: required ParamDisplayStyle style,
}

struct ModelParameterOutput {
    1: required string name,
    2: required map<string,string> label,
    3: required map<string,string> desc,
    4: required string type,
    5: optional string min,
    6: optional string max,
    7: required map<string,string> default_val,
    8: optional i32 precision,
    9: optional list<ModelParamOption> options,
    10: required ParamDisplayStyle style,
}

struct ModelCapability {
    1: optional bool          function_call,
    2: optional list<string>  input_modal,
    3: optional i32           input_tokens,
    4: optional bool          json_mode,
    5: optional i32           max_tokens,
    6: optional list<string>  output_modal,
    7: optional i32           output_tokens,
    8: optional bool          prefix_caching,
    9: optional bool          reasoning,
    10: optional bool         prefill_response,
}

// 新增：连接配置结构体，替代JSON字符串
struct ConnConfig {
    1: required string base_url,
    2: optional string api_key,
    3: optional string timeout,
    4: required string model,
    5: optional bool enable_thinking,
}

// 新增：自定义配置结构体，替代JSON字符串
struct CustomConfig {
    1: optional map<string,string> parameters,
    2: optional map<string,string> settings,
    3: optional list<string> features,
}

struct ModelMetaInput {
    1: required string          name,
    2: required string          protocol,
    3: required ModelCapability capability,
    4: required ConnConfig      conn_config, // 替换JSON字符串
}

struct ModelMetaOutput {
    1: required string          id,
    2: required string          name,
    3: required string          protocol,
    4: required ModelCapability capability,
    5: required ConnConfig      conn_config, // 替换JSON字符串
    6: required i32             status,
}

struct ModelDetailInput {
    1: required string                       id,
    2: required string                       name,
    3: optional map<string,string>           description,
    4: optional string                       icon_uri,
    5: optional string                       icon_url,
    6: optional list<ModelParameterInput>    default_parameters,
    7: required ModelMetaInput               meta,
}

struct ModelDetailOutput {
    1: required string                       id,
    2: required string                       name,
    3: optional map<string,string>           description,
    4: optional string                       icon_uri,
    5: optional string                       icon_url,
    6: optional list<ModelParameterOutput>   default_parameters,
    7: required ModelMetaOutput              meta,
    8: required i64                          created_at,
    9: required i64                          updated_at,
}

//  请求和响应结构 

struct CreateModelRequest {
    1: required string                       name,
    2: optional map<string,string>           description,
    3: optional string                       icon_uri,
    4: optional string                       icon_url,
    5: optional list<ModelParameterInput>    default_parameters,
    6: required ModelMetaInput               meta,

    255: optional base.Base Base (api.none="true"),
}

struct CreateModelResponse {
    1: optional ModelDetailOutput data,
    2: required i64               code,
    3: required string            msg,
    255: required base.BaseResp   BaseResp (api.none="true"),
}

struct GetModelRequest {
    1: required string model_id,

    255: optional base.Base Base (api.none="true"),
}

struct GetModelResponse {
    1: optional ModelDetailOutput data,
    2: required i64               code,
    3: required string            msg,
    255: required base.BaseResp   BaseResp (api.none="true"),
}

struct ListModelsRequest {
    1: optional i32    page_size,
    2: optional string page_token,
    3: optional string filter,
    4: optional string sort_by,
    5: optional string space_id,

    255: optional base.Base Base (api.none="true"),
}

struct ListModelsResponse {
    1: optional list<ModelDetailOutput> data,
    2: optional string                  next_page_token,
    3: optional i32                     total_count,
    4: required i64                     code,
    5: required string                  msg,
    255: required base.BaseResp         BaseResp (api.none="true"),
}

struct UpdateModelRequest {
    1: required string                    model_id,
    2: optional string                    name,
    3: optional map<string,string>        description,
    4: optional string                    icon_uri,
    5: optional string                    icon_url,
    6: optional list<ModelParameterInput> default_parameters,
    7: optional i32                       status,
    8: optional ConnConfig                conn_config,

    255: optional base.Base Base (api.none="true"),
}

struct UpdateModelResponse {
    1: optional ModelDetailOutput data,
    2: required i64               code,
    3: required string            msg,
    255: required base.BaseResp   BaseResp (api.none="true"),
}

struct DeleteModelRequest {
    1: required string model_id,

    255: optional base.Base Base (api.none="true"),
}

struct DeleteModelResponse {
    1: required i64             code,
    2: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

//  空间模型配置相关 

struct AddModelToSpaceRequest {
    1: required string space_id,
    2: required string model_id,

    255: optional base.Base Base (api.none="true"),
}

struct AddModelToSpaceResponse {
    1: required i64             code,
    2: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

struct RemoveModelFromSpaceRequest {
    1: required string space_id,
    2: required string model_id,

    255: optional base.Base Base (api.none="true"),
}

struct RemoveModelFromSpaceResponse {
    1: required i64             code,
    2: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

struct UpdateSpaceModelConfigRequest {
    1: required string       space_id,
    2: required string       model_id,
    3: required CustomConfig custom_config, // 替换JSON字符串

    255: optional base.Base Base (api.none="true"),
}

struct UpdateSpaceModelConfigResponse {
    1: required i64             code,
    2: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

struct GetSpaceModelConfigRequest {
    1: required string space_id,
    2: required string model_id,

    255: optional base.Base Base (api.none="true"),
}

struct GetSpaceModelConfigResponse {
    1: optional CustomConfig    data,
    2: required i64             code,
    3: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

//  模型模板相关结构 

struct ModelTemplate {
    1: required string id,
    2: required string name,
    3: required string provider,
    4: required string description,
    5: optional string model_name,
    6: optional string model_type,
}

struct GetModelTemplatesRequest {
    255: optional base.Base Base (api.none="true"),
}

struct GetModelTemplatesResponse {
    1: optional list<ModelTemplate> templates,
    2: required i64                 code,
    3: required string              msg,
    255: required base.BaseResp     BaseResp (api.none="true"),
}

struct GetModelTemplateContentRequest {
    1: required string template_id (api.query="template_id"),
    
    255: optional base.Base Base (api.none="true"),
}

struct GetModelTemplateContentResponse {
    1: optional string          content,
    2: required i64             code,
    3: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

struct ImportModelFromTemplateRequest {
    1: required string space_id,
    2: required string json_content,
    
    255: optional base.Base Base (api.none="true"),
}

struct ImportModelFromTemplateResponse {
    1: optional string          model_id,
    2: required i64             code,
    3: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

//  空间模型启用/禁用相关 

struct EnableSpaceModelRequest {
    1: required string space_id,
    2: required string model_id,
    
    255: optional base.Base Base (api.none="true"),
}

struct EnableSpaceModelResponse {
    1: required i64             code,
    2: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

struct DisableSpaceModelRequest {
    1: required string space_id,
    2: required string model_id,
    
    255: optional base.Base Base (api.none="true"),
}

struct DisableSpaceModelResponse {
    1: required i64             code,
    2: required string          msg,
    255: required base.BaseResp BaseResp (api.none="true"),
}

//  服务定义 

service ModelManagementService {
    // 模型管理 - 统一使用 /api/model/* 路径
    CreateModelResponse CreateModel(1: CreateModelRequest request) (api.post='/api/model/create', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    GetModelResponse    GetModel(1: GetModelRequest request)       (api.post='/api/model/detail', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    ListModelsResponse  ListModels(1: ListModelsRequest request)   (api.post='/api/model/list', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    UpdateModelResponse UpdateModel(1: UpdateModelRequest request) (api.post='/api/model/update', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    DeleteModelResponse DeleteModel(1: DeleteModelRequest request) (api.post='/api/model/delete', api.category="model", api.gen_path="model", agw.preserve_base = "true")

    // 空间模型配置 - 统一使用 /api/model/space/* 路径
    AddModelToSpaceResponse        AddModelToSpace(1: AddModelToSpaceRequest request)               (api.post='/api/model/space/add', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    RemoveModelFromSpaceResponse   RemoveModelFromSpace(1: RemoveModelFromSpaceRequest request)     (api.post='/api/model/space/remove', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    UpdateSpaceModelConfigResponse UpdateSpaceModelConfig(1: UpdateSpaceModelConfigRequest request) (api.post='/api/model/space/config/update', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    GetSpaceModelConfigResponse    GetSpaceModelConfig(1: GetSpaceModelConfigRequest request)       (api.post='/api/model/space/config/get', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    EnableSpaceModelResponse       EnableSpaceModel(1: EnableSpaceModelRequest request)             (api.post='/api/model/space/enable', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    DisableSpaceModelResponse      DisableSpaceModel(1: DisableSpaceModelRequest request)           (api.post='/api/model/space/disable', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    
    // 模型模板管理 - 使用 /api/model/template/* 路径
    GetModelTemplatesResponse        GetModelTemplates(1: GetModelTemplatesRequest request)               (api.get='/api/model/templates', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    GetModelTemplateContentResponse  GetModelTemplateContent(1: GetModelTemplateContentRequest request)   (api.get='/api/model/template/content', api.category="model", api.gen_path="model", agw.preserve_base = "true")
    ImportModelFromTemplateResponse  ImportModelFromTemplate(1: ImportModelFromTemplateRequest request)   (api.post='/api/model/import', api.category="model", api.gen_path="model", agw.preserve_base = "true")
}

