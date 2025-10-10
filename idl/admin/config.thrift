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
    2: string icon_url
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
}

struct Connection {
    1: optional ArkConnInfo ark
    2: optional OpenAIConnInfo openai
    3: optional DeepseekConnInfo deepseek
    4: optional GeminiConnInfo gemini
    5: optional QwenConnInfo qwen
    6: optional OllamaConnInfo ollama
    7: optional ClaudeConnInfo claude
}

struct ArkConnInfo {
    1: string base_url
    2: string api_key
    3: string region
    4: string model
}

struct OpenAIConnInfo {
    1: string base_url
    2: string api_key
}

struct DeepseekConnInfo {
    1: string base_url
    2: string api_key
    3: string model
}

struct GeminiConnInfo {
    1: string base_url
    2: string api_key
    3: string model
}

struct QwenConnInfo {
    1: string base_url
    2: string api_key
    3: string model
    4: i32 max_tokens
}

struct OllamaConnInfo {
    1: string base_url
    2: string api_key
    3: string model
    4: i32 max_tokens
}

struct ClaudeConnInfo {
    1: string base_url
    2: string api_key
    3: string model
}

struct CreateModelReq {
    1: developer_api.ModelClass model_class
    2: string model_name
    3: Connection connection

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
    4: string coze_api_token
    5: CodeRunnerType code_runner_type
    6: optional SandboxConfig sandbox_config
    7: string server_host
}

struct UpdateKnowledgeConfigReq {
    1: EmbeddingConfig embedding_config
    2: RerankConfig rerank_config
    3: OCRConfig ocr_config
    4: ParserConfig parser_config
    5: i64 builtin_model_id
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
    1: EmbeddingConfig embedding_config
    2: RerankConfig rerank_config
    3: OCRConfig ocr_config
    4: ParserConfig parser_config
    5: i64 builtin_model_id

    253: required i64 code
    254: required string msg
    255: required base.BaseResp BaseResp(api.none="true")
}

enum EmbeddingType {
    LLM = 0 
    HTTP = 1
}

struct EmbeddingConfig {
    1: EmbeddingType type
    2: i64 model_id
    3: string address
    4: i64 dimension
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
    1: string vikingdb_rerank_ak
    2: string vikingdb_rerank_sk
    3: string vikingdb_rerank_host
    4: string vikingdb_rerank_region
    5: string vikingdb_rerank_model
}

enum OCRType {
    ARK = 0 
    Paddleocr = 1
}

struct OCRConfig {
    1: OCRType type
    2: string ark_ak
    3: string ark_sk
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
    UpdateKnowledgeConfigResp UpdateKnowledgeConfig(1:UpdateKnowledgeConfigReq req)(api.post='/api/admin/config/knowledge/update', api.category="admin")
    GetModelListResp GetModelList(1:GetModelListReq req)(api.get='/api/admin/config/model/list', api.category="admin")
    CreateModelResp CreateModel(1:CreateModelReq req)(api.post='/api/admin/config/model/create', api.category="admin")
    DeleteModelResp DeleteModel(1:DeleteModelReq req)(api.post='/api/admin/config/model/delete', api.category="admin")
}
