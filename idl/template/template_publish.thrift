namespace go template_publish

struct PublishAsTemplateRequest {
    1: required i64 agent_id (api.body="agent_id",api.js_conv='true',agw.js_conv="str")
    2: required string title (api.body="title") 
    3: optional string description (api.body="description")
    4: optional i64 category_id (api.body="category_id",api.js_conv='true',agw.js_conv="str")
    5: optional list<string> labels (api.body="labels")
    6: required bool is_public (api.body="is_public")
    7: optional string cover_uri (api.body="cover_uri")
}

struct PublishAsTemplateResponse {
    1: required i64 template_id (api.js_conv='true',agw.js_conv="str")
    2: required string status
    253: required i32 code
    254: required string msg
}

struct GetMyTemplateListRequest {
    1: optional i32 page_num (api.query="page_num")
    2: optional i32 page_size (api.query="page_size")
}

struct GetMyTemplateListResponse {
    1: required list<TemplateInfo> templates
    2: required bool has_more
    3: required i32 total
    253: required i32 code
    254: required string msg
}

struct TemplateInfo {
    1: required i64 template_id (api.js_conv='true',agw.js_conv="str")
    2: required i64 agent_id (api.js_conv='true',agw.js_conv="str")
    3: required string title
    4: optional string description
    5: required string status
    6: required i64 created_at (api.js_conv='true',agw.js_conv="str")
    7: optional i64 heat (api.js_conv='true',agw.js_conv="str")
    8: optional string cover_uri
    9: optional string cover_url
}

struct DeleteTemplateRequest {
    1: required i64 template_id (api.path="template_id",api.js_conv='true',agw.js_conv="str")
}

struct DeleteTemplateResponse {
    253: required i32 code
    254: required string msg
}

struct UnpublishTemplateRequest {
    1: required i64 agent_id (api.body="agent_id",api.js_conv='true',agw.js_conv="str")
}

struct UnpublishTemplateResponse {
    253: required i32 code
    254: required string msg
}

struct CheckPublishStatusRequest {
    1: required i64 agent_id (api.query="agent_id",api.js_conv='true',agw.js_conv="str")
}

struct CheckPublishStatusResponse {
    1: required bool is_published
    2: optional TemplateInfo template_info
    253: required i32 code
    254: required string msg
}

struct UploadTemplateIconRequest {
    1: required CommonFileInfo file_head (api.body="file_head")
    2: required string data (api.body="data")
}

struct CommonFileInfo {
    1: required string file_type (api.body="file_type")
    2: required FileBizType biz_type (api.body="biz_type")
}

enum FileBizType {
    BIZ_UNKNOWN = 0
    BIZ_TEMPLATE_ICON = 11
}

struct UploadTemplateIconResponse {
    1: required TemplateIconData data
    253: required i32 code
    254: required string msg
}

struct TemplateIconData {
    1: required string upload_url
    2: required string upload_uri
}

// 发布到商店的请求结构
struct PublishToStoreRequest {
    1: required i64 agent_id (api.body="agent_id",api.js_conv='true',agw.js_conv="str")
    2: required string title (api.body="title") 
    3: optional string description (api.body="description")
    4: optional list<string> tags (api.body="tags")
    5: optional string cover_uri (api.body="cover_uri")
}

struct PublishToStoreResponse {
    1: required i64 store_template_id (api.js_conv='true',agw.js_conv="str")
    2: required string status
    253: required i32 code
    254: required string msg
}

// 获取商店模板列表的请求结构
struct GetStoreTemplateListRequest {
    1: optional i32 page_num (api.query="page_num")
    2: optional i32 page_size (api.query="page_size")
    3: optional string search_keyword (api.query="search_keyword")
    4: optional list<string> tags (api.query="tags")
}

struct GetStoreTemplateListResponse {
    1: required list<StoreTemplateInfo> templates
    2: required bool has_more
    3: required i32 total
    253: required i32 code
    254: required string msg
}

// 商店模板信息结构
struct StoreTemplateInfo {
    1: required i64 template_id (api.js_conv='true',agw.js_conv="str")
    2: required i64 agent_id (api.js_conv='true',agw.js_conv="str")
    3: required string title
    4: optional string description
    5: required string status
    6: required i64 created_at (api.js_conv='true',agw.js_conv="str")
    7: optional i64 heat (api.js_conv='true',agw.js_conv="str")
    8: optional string cover_uri
    9: optional string cover_url
    10: optional list<string> tags
    11: optional string author_name
    12: optional string author_avatar
}

// 从商店取消发布的请求结构
struct UnpublishFromStoreRequest {
    1: required i64 agent_id (api.body="agent_id",api.js_conv='true',agw.js_conv="str")
}

struct UnpublishFromStoreResponse {
    253: required i32 code
    254: required string msg
}

// 检查商店发布状态的请求结构
struct CheckStorePublishStatusRequest {
    1: required i64 agent_id (api.query="agent_id",api.js_conv='true',agw.js_conv="str")
}

struct CheckStorePublishStatusResponse {
    1: required bool is_published
    2: optional StoreTemplateInfo template_info
    253: required i32 code
    254: required string msg
}

service TemplatePublishService {
    PublishAsTemplateResponse PublishAsTemplate(1: PublishAsTemplateRequest req) 
        (api.post="/api/template/publish")
    
    GetMyTemplateListResponse GetMyTemplateList(1: GetMyTemplateListRequest req)
        (api.get="/api/template/my-list")
        
    DeleteTemplateResponse DeleteTemplate(1: DeleteTemplateRequest req)
        (api.delete="/api/template/{template_id}")
        
    UnpublishTemplateResponse UnpublishTemplate(1: UnpublishTemplateRequest req)
        (api.post="/api/template/unpublish")
        
    CheckPublishStatusResponse CheckPublishStatus(1: CheckPublishStatusRequest req)
        (api.get="/api/template/check-status")
        
    UploadTemplateIconResponse UploadTemplateIcon(1: UploadTemplateIconRequest req)
        (api.post="/api/template/upload_icon")
    
    // 商店相关接口
    PublishToStoreResponse PublishToStore(1: PublishToStoreRequest req)
        (api.post="/api/template/store/publish")
        
    GetStoreTemplateListResponse GetStoreTemplateList(1: GetStoreTemplateListRequest req)
        (api.get="/api/template/store/list")
        
    UnpublishFromStoreResponse UnpublishFromStore(1: UnpublishFromStoreRequest req)
        (api.post="/api/template/store/unpublish")
        
    CheckStorePublishStatusResponse CheckStorePublishStatus(1: CheckStorePublishStatusRequest req)
        (api.get="/api/template/store/check-status")
}