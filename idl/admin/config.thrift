include "../base.thrift"
include "../app/developer_api.thrift"

namespace go admin.config


struct GetModelListReq  {
   255: optional base.Base Base
}

struct GetModelListResp {
    1: list<ProviderModelList> provider_model_list

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct ProviderModelList {
    1: ModelProvider provider
    2: list<Model> model_list
}

struct I18nText {
    1: string zh_cn
    2: string en_us
}

struct ModelProvider {
    1: I18nText name
    2: string icon_uri
    3: string icon_url
    4: I18nText description
    5: developer_api.ModelClass model_class
}

struct DisplayInfo {
    1: string name
    3: I18nText description
    4: i64 output_tokens
    5: i64 max_tokens
}



enum ModelType {
    LLM = 0 
    TextEmbedding = 1
    Rerank = 2
}

struct Model {
    1: i64 id
    2: ModelProvider provider
    3: DisplayInfo display_info
    4: developer_api.ModelAbility capability  
    5: Connection  connection
    6: ModelType type
    7: list<developer_api.ModelParameter> parameters
    8: ModelStatus status
    9: bool enable_base64_url
    10: i64 delete_at_ms
}

enum ThinkingType {
    Default = 0 
    Enable = 1
    Disable = 2
    Auto = 3
}


enum ModelStatus {
    StatusDefault = 0  // Default state when not configured, equivalent to StatusInUse
    StatusInUse   = 1  // In the application, it can be used to create new
    StatusDeleted = 2 // It is offline, unusable, and cannot be created.
}

struct Connection {
    1: BaseConnectionInfo base_conn_info
    2: optional ArkConnInfo ark
    3: optional OpenAIConnInfo openai
    4: optional DeepseekConnInfo deepseek
    5: optional GeminiConnInfo gemini
    6: optional QwenConnInfo qwen
    7: optional OllamaConnInfo ollama
    8: optional ClaudeConnInfo claude
}

struct BaseConnectionInfo {
    1: string base_url
    2: string api_key
    3: string model
    4: ThinkingType thinking_type
}

struct EmbeddingInfo {
    1: i32 dims
}


struct ArkConnInfo {
    1: string region
    3: string api_type
}

struct OpenAIConnInfo {
    6: bool by_azure
    7: string api_version
}


struct GeminiConnInfo {
    1: i32 backend // "1" for BackendGeminiAPI / "2" for BackendVertexAI
    2: string project
    3: string location
}

struct DeepseekConnInfo {}

struct QwenConnInfo {}

struct OllamaConnInfo {}

struct ClaudeConnInfo {}

struct CreateModelReq {
    1: developer_api.ModelClass model_class
    2: string model_name
    3: Connection connection
    4: bool enable_base64_url


    255: optional base.Base Base
}

struct CreateModelResp {
    1: i64 id (agw.js_conv="str", api.js_conv="true")

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct DeleteModelReq {
    1: i64 id (agw.js_conv="str", api.js_conv="true")
    255: optional base.Base Base
}

struct DeleteModelResp {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct UpdateModelReq {
    1: Model model
    255: optional base.Base Base
}

struct UpdateModelResp {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}


struct SaveBasicConfigurationReq {
    1: BasicConfiguration configuration
    255: optional base.Base Base
}

struct SaveBasicConfigurationResp {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct GetBasicConfigurationReq {
    255: optional base.Base Base
}

struct GetBasicConfigurationResp {
    1: BasicConfiguration configuration

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

enum CodeRunnerType {
    Local = 0 
    Sandbox = 1
}

struct SandboxConfig {
    1: string allow_env
    2: string allow_read
    3: string allow_write
    4: string allow_run
    5: string allow_net
    6: string allow_ffi
    7: string node_modules_dir
    8: double timeout_seconds
    9: i64 memory_limit_mb
}

struct BasicConfiguration {
    1: string admin_emails
    2: bool disable_user_registration
    3: string allow_registration_email
    4: PluginConfiguration plugin_configuration
    5: CodeRunnerType code_runner_type
    6: optional SandboxConfig sandbox_config
    7: string server_host
}

struct PluginConfiguration {
    1: bool coze_saas_plugin_enabled
    2: string coze_api_token
    3: string coze_saas_api_base_url
}

struct UpdateKnowledgeConfigReq {
    1: KnowledgeConfig knowledge_config

    255: optional base.Base Base
}

struct UpdateKnowledgeConfigResp {
    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}



struct GetKnowledgeConfigReq {
    255: optional base.Base Base
}

struct GetKnowledgeConfigResp {
    1: KnowledgeConfig knowledge_config

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

struct KnowledgeConfig {
    1: EmbeddingConfig embedding_config
    2: RerankConfig rerank_config
    3: OCRConfig ocr_config
    4: ParserConfig parser_config
    5: i64 builtin_model_id
}

struct EmbeddingConfig {
    1: EmbeddingType type
    2: i32 max_batch_size
    3: EmbeddingConnection connection
}

enum EmbeddingType {
    Ark = 0 
    OpenAI = 1
    Ollama = 2
    Gemini = 3
    HTTP = 4
}

struct EmbeddingConnection {
    1: BaseConnectionInfo base_conn_info
    2: EmbeddingInfo embedding_info
    3: optional ArkConnInfo ark
    4: optional OpenAIConnInfo openai
    5: optional OllamaConnInfo ollama
    6: optional GeminiConnInfo gemini
    7: optional HttpConnection http
}

struct HttpConnection {
    1: string address
}

enum RerankType {
    VikingDB = 0 
    RRF = 1
}


struct RerankConfig {
    1: RerankType type
    2: VikingDBConfig vikingdb_config
}

struct VikingDBConfig {
    1: string ak
    2: string sk
    3: string host
    4: string region
    5: string model
}

enum OCRType {
    Volcengine = 0 
    Paddleocr = 1
}

struct OCRConfig {
    1: OCRType type
    2: string volcengine_ak
    3: string volcengine_sk
    4: string paddleocr_api_url
}

enum ParserType {
   builtin = 0 
   Paddleocr = 1
}

struct ParserConfig {
    1: ParserType type
    2: string paddleocr_structure_api_url
}



service ConfigService {
    GetBasicConfigurationResp GetBasicConfiguration(1:GetBasicConfigurationReq req)(api.get='/api/admin/config/basic/get', api.category="admin")
    SaveBasicConfigurationResp SaveBasicConfiguration(1:SaveBasicConfigurationReq req)(api.post='/api/admin/config/basic/save', api.category="admin")
    GetKnowledgeConfigResp GetKnowledgeConfig(1:GetKnowledgeConfigReq req)(api.get='/api/admin/config/knowledge/get', api.category="admin")
    UpdateKnowledgeConfigResp UpdateKnowledgeConfig(1:UpdateKnowledgeConfigReq req)(api.post='/api/admin/config/knowledge/save', api.category="admin")
    GetModelListResp GetModelList(1:GetModelListReq req)(api.get='/api/admin/config/model/list', api.category="admin")
    CreateModelResp CreateModel(1:CreateModelReq req)(api.post='/api/admin/config/model/create', api.category="admin")
    DeleteModelResp DeleteModel(1:DeleteModelReq req)(api.post='/api/admin/config/model/delete', api.category="admin")
}
