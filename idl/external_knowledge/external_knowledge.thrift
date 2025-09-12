namespace go external_knowledge

// 外部知识库绑定信息
struct ExternalKnowledgeBinding {
    1: required i64 id (api.js_conv='true',agw.js_conv="str")
    2: required string user_id
    3: required string binding_key
    4: optional string binding_name
    5: optional string binding_type
    6: optional string extra_config  // JSON string
    7: required i32 status  // 0: disabled, 1: enabled
    8: optional i64 last_sync_at
    9: required i64 created_at
    10: optional i64 updated_at
}

// 创建绑定请求
struct CreateBindingRequest {
    1: required string binding_key (api.body="binding_key")
    2: optional string binding_name (api.body="binding_name")
    3: optional string binding_type (api.body="binding_type")
    4: optional string extra_config (api.body="extra_config")
}

// 创建绑定响应
struct CreateBindingResponse {
    253: required i32 code
    254: required string msg
    1: required ExternalKnowledgeBinding data
}

// 获取绑定列表请求
struct GetBindingListRequest {
    1: optional i32 page (api.query="page")
    2: optional i32 page_size (api.query="page_size")
    3: optional i32 status (api.query="status")  // filter by status
}

// 获取绑定列表响应
struct GetBindingListResponse {
    253: required i32 code
    254: required string msg
    1: required list<ExternalKnowledgeBinding> data
    2: required i64 total
}

// 更新绑定请求
struct UpdateBindingRequest {
    1: required string id (api.path="id")  // binding id
    2: optional string binding_name (api.body="binding_name")
    3: optional i32 status (api.body="status")
    4: optional string extra_config (api.body="extra_config")
}

// 更新绑定响应
struct UpdateBindingResponse {
    253: required i32 code
    254: required string msg
    1: required ExternalKnowledgeBinding data
}

// 删除绑定请求
struct DeleteBindingRequest {
    1: required string id (api.path="id")  // binding id
}

// 删除绑定响应
struct DeleteBindingResponse {
    253: required i32 code
    254: required string msg
}

// 验证绑定密钥请求
struct ValidateBindingKeyRequest {
    1: required string binding_key (api.body="binding_key")
}

// 验证绑定密钥响应
struct ValidateBindingKeyResponse {
    253: required i32 code
    254: required string msg
    1: required bool is_valid
    2: optional string message  // validation message
}

// RAGFlow知识库信息
struct RAGFlowDataset {
    1: required string id
    2: required string name
    3: optional string description
    4: optional string avatar
    5: required i32 document_count
    6: required i32 chunk_count
    7: required i64 token_num
    8: required string language
    9: required string embedding_model
    10: required string create_date
    11: required i64 create_time
    12: required string update_date
    13: required i64 update_time
    14: required i32 status  // "1" for active
}

// 获取RAGFlow知识库列表请求
struct GetRAGFlowDatasetsRequest {
    // 空请求体，使用header中的Authorization
}

// 获取RAGFlow知识库列表响应
struct GetRAGFlowDatasetsResponse {
    253: required i32 code
    254: required string msg
    1: required list<RAGFlowDataset> data
}

// 知识库检索请求
struct RetrievalRequest {
    1: required string question (api.body="question")
    2: required string bot_id (api.body="bot_id")
    3: optional bool draft_mode (api.body="draft_mode")
}

// 知识库检索响应（保持RAGFlow返回格式）
struct RetrievalResponse {
    253: required i32 code
    254: required string msg
    1: optional RetrievalData data
}

struct RetrievalData {
    1: optional list<RetrievalChunk> chunks
    2: optional i32 total
}

struct RetrievalChunk {
    1: optional string id
    2: optional string content
    3: optional string document_id
    4: optional string document_name
    5: optional string dataset_id
    6: optional string dataset_name
    7: optional double similarity
    8: optional map<string, string> metadata
    9: optional string highlight
    10: optional i32 position
}

// 外部知识库服务
service ExternalKnowledgeService {
    // 创建绑定
    CreateBindingResponse CreateBinding(1: CreateBindingRequest req) (api.post="/api/external-knowledge/binding/create")
    
    // 获取绑定列表
    GetBindingListResponse GetBindingList(1: GetBindingListRequest req) (api.get="/api/external-knowledge/binding/list")
    
    // 更新绑定
    UpdateBindingResponse UpdateBinding(1: UpdateBindingRequest req) (api.put="/api/external-knowledge/binding/:id")
    
    // 删除绑定
    DeleteBindingResponse DeleteBinding(1: DeleteBindingRequest req) (api.delete="/api/external-knowledge/binding/:id")
    
    // 验证绑定密钥
    ValidateBindingKeyResponse ValidateBindingKey(1: ValidateBindingKeyRequest req) (api.post="/api/external-knowledge/binding/validate")
    
    // 获取RAGFlow知识库列表
    GetRAGFlowDatasetsResponse GetRAGFlowDatasets(1: GetRAGFlowDatasetsRequest req) (api.get="/api/external-knowledge/ragflow/datasets")
    
    // 知识库检索接口
    RetrievalResponse Retrieval(1: RetrievalRequest req) (api.post="/api/external-knowledge/retrieval")
}