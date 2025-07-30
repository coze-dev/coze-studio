include "../../base.thrift"

namespace go ocean.cloud.workflow

enum PersistenceModel {
    DB  = 1,
    VCS = 2,
    External = 3,
}

// WorkflowMode 用来区分 Workflow 和 chatflow
enum WorkflowMode {
    Workflow  = 0   ,
    Imageflow = 1   ,
    SceneFlow = 2   ,
    ChatFlow  = 3   ,
    All       = 100 , // 仅在查询时使用
}

// workflow 商品审核草稿状态
enum ProductDraftStatus {
    Default   = 0, // 默认
    Pending   = 1, // 审核中
    Approved  = 2, // 审核通过
    Rejected  = 3, // 审核不通过
    Abandoned = 4, // 已废弃
}

enum CollaboratorMode {
    Close = 0, // 关闭多人协作模式
    Open  = 1, // 开启多人协作模式
}

struct Workflow{
    1 :          string             workflow_id                ,
    2 :          string             name                       ,
    3 :          string             desc                       ,
    4 :          string             url                        ,
    5 :          string             icon_uri                   ,
    6 :          WorkFlowDevStatus  status                     ,
    7 :          WorkFlowType       type                       , // 类型，1:官方模版
    8 :          string             plugin_id                  , // workflow对应的插件id
    9 :          i64                create_time                ,
    10:          i64                update_time                ,
    11:          SchemaType         schema_type                ,
    12: optional Node               start_node                 ,
    13: optional Tag                tag                        ,
    14: optional string             template_author_id         , // 模版创作者id
    15: optional string             template_author_name       , // 模版创作者昵称
    16: optional string             template_author_picture_url, // 模版创作者头像
    17: optional string             space_id                   , // 空间id
    18: optional string             interface_str              , // 流程出入参
    19: optional string             schema_json                , // 新版workflow的定义 schema
    20:          Creator            creator                    , // workflow创作者信息
    21:          PersistenceModel   persistence_model          , // 存储模型
    22:          WorkflowMode       flow_mode                  , // workflow or imageflow，默认值为workflow
    23:          ProductDraftStatus product_draft_status       , // workflow商品审核版本状态
    24: optional string             external_flow_info         , // {"project_id":"xxx","flow_id":xxxx}
    25:          CollaboratorMode   collaborator_mode          , // workflow多人协作按钮状态
    26: list<CheckResult> check_result,
    27: optional string project_id,
    28: optional string dev_plugin_id, // project 下的 workflow 才有
}

struct CheckResult {
    1: CheckType type, // 校验类型
    2: bool is_pass, // 是否通过
    3: string reason, // 不通过原因
}

struct Creator {
    1: string id                                  ,
    2: string name                                ,
    3: string avatar_url                          ,
    4: bool   self       (pilota.name="rust_self"), // 是否是自己创建的
}

enum SchemaType{
    DAG = 0, // 废弃
    FDL = 1,
    BlockWise = 2, // 废弃
}

enum WorkFlowType{
    User     = 0, // 用户自定义
    GuanFang = 1, // 官方模板
}

enum Tag{
    All           = 1  ,
    Hot           = 2  ,
    Information   = 3  ,
    Music         = 4  ,
    Picture       = 5  ,
    UtilityTool   = 6  ,
    Life          = 7  ,
    Traval        = 8  ,
    Network       = 9  ,
    System        = 10 ,
    Movie         = 11 ,
    Office        = 12 ,
    Shopping      = 13 ,
    Education     = 14 ,
    Health        = 15 ,
    Social        = 16 ,
    Entertainment = 17 ,
    Finance       = 18 ,

    Hidden        = 100,
}

//节点结构
enum NodeType{
    Start           = 1 ,
    End             = 2 ,
    LLM             = 3 ,
    Api             = 4 ,
    Code            = 5 ,
    Dataset         = 6 ,
    If              = 8 ,
    SubWorkflow     = 9 ,
    Variable        = 11,
    Database        = 12,
    Message         = 13,
    Text            = 15,
    ImageGenerate   = 16,
    ImageReference  = 17,
    Question        = 18,
    Break           = 19,
    LoopSetVariable = 20,
    Loop            = 21,
    Intent          = 22,
    DrawingBoard    = 23,
    SceneVariable   = 24,
    SceneChat       = 25,
    DatasetWrite    = 27
    Input           = 30,
    Batch           = 28,
    Continue        = 29,
    AssignVariable  = 40,
    JsonSerialization   = 58,
    JsonDeserialization = 59,
    DatasetDelete       = 60,
}

//节点模版类型，与NodeType基本保持一致，copy一份是因为新增了一个Imageflow类型，避免影响原来NodeType的业务语意
enum NodeTemplateType{
    Start           = 1 ,
    End             = 2 ,
    LLM             = 3 ,
    Api             = 4 ,
    Code            = 5 ,
    Dataset         = 6 ,
    If              = 8 ,
    SubWorkflow     = 9 ,
    Variable        = 11,
    Database        = 12,
    Message         = 13,
    Imageflow       = 14,
    Text            = 15,
    ImageGenerate   = 16,
    ImageReference  = 17,
    Question        = 18,
    Break           = 19,
    LoopSetVariable = 20,
    Loop            = 21,
    Intent          = 22,
    DrawingBoard    = 23,
    SceneVariable   = 24,
    SceneChat       = 25,
    DatasetWrite    = 27
    Input           = 30,
    Batch           = 28,
    Continue        = 29,
    AssignVariable  = 40,
    DatabaseInsert = 41,
    DatabaseUpdate = 42,
    DatabasesELECT = 43,
    DatabaseDelete = 44,
    JsonSerialization   = 58,
    JsonDeserialization = 59,
    DatasetDelete       = 60,
}

enum IfConditionRelation {
    And = 1,
    Or  = 2,
}

enum ConditionType {
    Equal         = 1 ,
    NotEqual      = 2 ,
    LengthGt      = 3 ,
    LengthGtEqual = 4 ,
    LengthLt      = 5 ,
    LengthLtEqual = 6 ,
    Contains      = 7 ,
    NotContains   = 8 ,
    Null          = 9 ,
    NotNull       = 10,
    True          = 11,
    False         = 12,
    Gt            = 13,
    GtEqual       = 14,
    Lt            = 15,
    LtEqual       = 16,
}

enum InputType{
    String  = 1,
    Integer = 2,
    Boolean = 3,
    Number  = 4,
    Array   = 5,
    Object  = 6,
}
enum ParamRequirementType{
    CanNotDelete         = 1,
    CanNotChangeName     = 2,
    CanChange            = 3,
    CanNotChangeAnything = 4,
}
struct Param{
    1:          list<string>         key         ,
    2:          string               desc        ,
    3:          InputType            type        ,
    4:          bool                 required    ,
    5:          string               value       ,
    6:          ParamRequirementType requirement , // 要求  1不允许删除 2不允许更改名称 3什么都可修改 4只显示，全部不允许更改
    7: optional string               from_node_id,
    8: optional list<string>         from_output ,
}

struct APIParam{
    1: string plugin_id     ,
    2: string api_id        ,
    3: string plugin_version,
    4: string plugin_name   ,
    5: string api_name      ,
    6: string out_doc_link  ,
    7: string tips          ,
}

struct CodeParam{
    1: string code_snippet,
}

struct LLMParam{
    1: i32    model_type ,
    2: double temperature,
    3: string prompt     ,
    4: string model_name ,
}

struct DatasetParam{
    1: list<string> dataset_list,
}

struct IfParam {
    1: optional IfBranch if_branch  ,
    2: optional IfBranch else_branch,
}

struct IfBranch {
    1: optional list<IfCondition>   if_conditions        , // 该分支的条件
    2: optional IfConditionRelation if_condition_relation, // 该分支各条件的关系
    3: optional list<string>        next_node_id         , // 该分支对应的下一个节点
}

struct IfCondition {
    1: required Parameter     first_parameter ,
    2: required ConditionType condition       ,
    3: required Parameter     second_parameter,
}

struct LayOut{
    1: double x,
    2: double y,
}

enum TerminatePlanType{
    USELLM     = 1,
    USESETTING = 2,
}

struct TerminatePlan{//结束方式
    1: TerminatePlanType plan   ,
    2: string            content,
}

struct NodeParam{
    1 : optional list<Param>     input_list       , // 输入参数列表，支持多级；支持mapping
    2 : optional list<Param>     output_list      , // 输出参数列表，支持多级
    3 : optional APIParam        api_param        , // 如果是API类型的Node，插件名、API名、插件版本、API的描述
    4 : optional CodeParam       code_param       , // 如果是代码片段，则包含代码内容
    5 : optional LLMParam        llm_param        , // 如果是模型，则包含模型的基础信息
    6 : optional DatasetParam    dataset_param    , // 如果是数据集，选择数据集的片段
    7 : optional TerminatePlan   terminate_plan   , // end节点，如何结束
    8 : optional list<Parameter> input_parameters , // （新）输入参数列表
    9 : optional list<Parameter> output_parameters, // （新）输出参数列表
    10: optional Batch           batch            , // 批量设置情况
    11: optional IfParam         if_param         , // if节点参数
}

struct NodeDesc{
    1: string desc         ,
    2: string name         , // 副标题名称
    3: string icon_url     , // 该类型的icon
    4: i32    support_batch, // 是否支持批量，1不支持，2支持
    5: i32    link_limit   , // 连接要求 1左右都可连接 2只支持右侧
}
struct OpenAPI{
    1: list<Parameter> input_list ,
    2: list<Parameter> output_list,
}

struct Batch{
    1: bool      is_batch   , // batch开关是否打开
    2: i64       take_count , // 只处理数组[0,take_count)范围的输入
    3: Parameter input_param, // 需要Batch的输入
}

struct Node{
    1: string       workflow_id,
    2: string       node_id    , // 节点id
    3: string       node_name  , // 更改node名称
    4: NodeType     node_type  , // 节点类型
    5: NodeParam    node_param , // 节点的核心参数
    6: LayOut       lay_out    , // Node的位置
    7: NodeDesc     desc       , // Node的描述，说明链接
    8: list<string> depends_on , // 依赖的上游节点
    9: OpenAPI      open_api   , // 所有的输入和输出
}

enum SupportBatch{
    NOT_SUPPORT = 1, // 1:不支持
    SUPPORT     = 2, // 2:支持
}

enum PluginParamTypeFormat {
    ImageUrl = 1,
}

struct Parameter {
    1 :          string                name          ,
    2 :          string                desc          ,
    3 :          bool                  required      ,
    4 :          InputType             type          ,
    5 :          list<Parameter>       sub_parameters,
    6 :          InputType             sub_type      , // 如果Type是数组，则有subtype
    7 : optional string                from_node_id  , // 如果入参的值是引用的则有fromNodeId
    8 : optional list<string>          from_output   , // 具体引用哪个节点的key
    9 : optional string                value         , // 如果入参是用户手输 就放这里
    10: optional PluginParamTypeFormat format        ,
    11: optional i64                   assist_type   , // 辅助类型；type=string生效，0 为unset
    12: optional i64                   sub_assist_type, // 如果Type是数组，表示子元素的辅助类型；sub_type=string生效，0 为unset
}

//状态，1不可提交 2可提交  3已提交 4废弃
enum WorkFlowDevStatus{
    CanNotSubmit = 1, // 不可提交
    CanSubmit    = 2, // 可提交
    HadSubmit    = 3, // 已提交
    Deleted      = 4, // 删除
}
//状态，1不可发布 2可发布  3已发布 4删除 5下架
enum WorkFlowStatus{
    CanNotPublish = 1, // 不可发布
    CanPublish    = 2, // 可发布
    HadPublished  = 3, // 已发布
    Deleted       = 4, // 删除
    Unlisted      = 5, // 下架
}



struct CreateWorkflowRequest{
    1  : required string       name         , // 流程名
    2  : required string       desc         , // 流程描述，不可为空
    3  : required string       icon_uri     , // 流程图标uri，不可为空
    4  : required string       space_id     , // 空间id，不可为空
    5  : optional WorkflowMode flow_mode    , // workflow or chatflow，默认值为workflow
    6  : optional SchemaType   schema_type  ,
    7  : optional string       bind_biz_id  ,
    8  : optional i32          bind_biz_type, // 绑定业务类型，非必要不填写。参考BindBizType结构体，值为3时代表抖音分身
    9  : optional string       project_id   , // 应用id，填写时代表流程是project下的流程，需要跟随project发布
    10 : optional bool         create_conversation, // 是否创建会话，仅当flow_mode=chatflow时生效
    255: optional base.Base    Base     ,
}

struct CreateWorkflowData{
    1:          string         workflow_id       , // 流程的id，用来标识唯一的流程
    2:          string         name              , // 流程名
    3:          string         url               ,
    4:          WorkFlowStatus status            ,
    5:          SchemaType     type              ,
    6:          list<Node>     node_list         ,
    7: optional string         external_flow_info, // {"project_id":"xxx","flow_id":xxxx}
}

struct CreateWorkflowResponse{
    1  : required CreateWorkflowData data    ,

    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

struct SaveWorkflowRequest{
    1  : required string    workflow_id           , // 流程的id，用来标识唯一的流程
    2  : optional string    schema                , // 流程的schema
    3  : optional string    space_id              , // required，空间id，不可为空
    4  : optional string    name                  ,
    5  : optional string    desc                  ,
    6  : optional string    icon_uri              ,
    7  : required string    submit_commit_id      , // 提交的 commit_id。其作用是唯一标识一个流程的单个提交版本（每个 commit_id 仅对应且仅能对应一个流程的一次提交版本）。
    8  : optional bool      ignore_status_transfer,

    255: optional base.Base Base                  ,
}

struct SaveWorkflowData{
    1: string            name  ,
    2: string            url   ,
    3: WorkFlowDevStatus status,
    4: WorkFlowStatus    workflow_status,
}

struct SaveWorkflowResponse{
    1  : required SaveWorkflowData data    ,

    253: required i64              code    ,
    254: required string           msg     ,
    255: required base.BaseResp    BaseResp,
}

struct UpdateWorkflowMetaRequest {
    1  : required string    workflow_id           ,
    2  : required string    space_id              ,
    3  : optional string    name                  ,
    4  : optional string    desc                  ,
    5  : optional string    icon_uri              ,
    6  : optional WorkflowMode flow_mode  ,

    255: optional base.Base Base                  ,
}

struct UpdateWorkflowMetaResponse {
    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

struct MergeWorkflowRequest{
    1  : required string    workflow_id     ,
    2  : optional string    schema          ,
    3  : optional string    space_id        ,
    4  : optional string    name            ,
    5  : optional string    desc            ,
    6  : optional string    icon_uri        ,
    7  : required string    submit_commit_id,

    255: optional base.Base Base            ,
}

struct MergeWorkflowData{
    1: string            name  ,
    2: string            url   ,
    3: WorkFlowDevStatus status,
}

struct MergeWorkflowResponse{
    1  : required MergeWorkflowData data    ,

    253: required i64               code    ,
    254: required string            msg     ,
    255: required base.BaseResp     BaseResp,
}

enum VCSCanvasType {
    Draft   = 1,
    Submit  = 2,
    Publish = 3,
}
struct VCSCanvasData {
    1:          string        submit_commit_id ,
    2:          string        draft_commit_id  ,
    3:          VCSCanvasType type             ,
    4:          bool          can_edit         ,
    5: optional string        publish_commit_id,
}
struct DBCanvasData {
    1: WorkFlowStatus status,
}

struct OperationInfo {
    1: Creator operator     ,
    2: i64     operator_time,
}

struct CanvasData {
    1:          Workflow      workflow          ,
    2:          VCSCanvasData vcs_data          ,
    3:          DBCanvasData  db_data           ,
    4:          OperationInfo operation_info    ,
    5: optional string        external_flow_info,
    6: optional bool          is_bind_agent     , // 是否绑定了Agent
    7: optional string        bind_biz_id       ,
    8: optional i32           bind_biz_type     ,
    9: optional string        workflow_version  ,
}

struct GetCanvasInfoRequest {
    1  : required string    space_id   , // 空间id，不可为空
    2  : optional string    workflow_id, // required，流程id，不可为空

    255: optional base.Base Base       ,
}

struct GetCanvasInfoResponse {
    1  : required CanvasData    data    ,

    253: required i64           code    ,
    254: required string        msg     ,
    255: required base.BaseResp BaseResp,
}

enum OperateType {
    DraftOperate   = 0,
    SubmitOperate  = 1,
    PublishOperate = 2,
    PubPPEOperate  = 3,
    SubmitPublishPPEOperate = 4,
}

struct GetHistorySchemaRequest {
    1  : required string      space_id   ,
    2  : required string      workflow_id,
    3  : optional string      commit_id  , // 多次分页的时候需要传入
    4  : required OperateType type       ,
    5  : optional string      env        ,
    6  : optional string      workflow_version,
    7  : optional string      project_version,
    8  : optional string      project_id,

    51 : optional string      execute_id ,
    52 : optional string      sub_execute_id,
    53 : optional string      log_id,

    255: optional base.Base   Base       ,
}

struct GetHistorySchemaData {
    1: string name    ,
    2: string describe,
    3: string url     ,
    4: string schema  ,
    5: WorkflowMode flow_mode,
    6: optional string       bind_biz_id  ,
    7: optional BindBizType          bind_biz_type,
    8: string workflow_id,
    9: string commit_id,

    51: optional string execute_id,
    52: optional string sub_execute_id,
    53: optional string log_id,
}

struct GetHistorySchemaResponse{
    1  : required GetHistorySchemaData data    ,

    253: required i64                  code    ,
    254: required string               msg     ,
    255: required base.BaseResp        BaseResp,
}

enum DeleteAction{
    BlockwiseUnbind = 1, // Blockwise的解绑
    BlockwiseDelete = 2, // Blockwise的删除
}

struct DeleteWorkflowRequest{
    1  : required string       workflow_id,
    2  : required string       space_id   ,
    3  : optional DeleteAction action     ,
    255: optional base.Base    Base       ,
}

enum DeleteStatus{
    SUCCESS = 0,
    FAIL    = 1,
}
struct DeleteWorkflowData{
    1: DeleteStatus status,
}
struct DeleteWorkflowResponse{
    1  : required DeleteWorkflowData data    ,

    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}


struct BatchDeleteWorkflowResponse{
    1  : required DeleteWorkflowData data    ,

    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

struct BatchDeleteWorkflowRequest{
    1  : required list<string>       workflow_id_list,
    2  : required string       space_id   ,
    3  : optional DeleteAction action     ,
    255: optional base.Base    Base       ,
}

struct GetDeleteStrategyRequest {
    1  : required string    workflow_id,
    2  : required string    space_id   ,
    255: optional base.Base Base       ,
}

struct GetDeleteStrategyResponse{
    1  : required DeleteType    data    ,

    253: required i64           code    ,
    254: required string        msg     ,
    255: required base.BaseResp BaseResp,
}

enum DeleteType{
    CanDelete          = 0, // 可以删除：无workflow商品/商品下架/第一次上架且审核失败
    RejectProductDraft = 1, // 删除后审核失败：workflow商品第一次上架并处于审核中
    UnListProduct      = 2, // 需要商品先下架：workflow商品已上架
}

struct PublishWorkflowRequest{
    1  : required string    workflow_id     ,
    2  : required string    space_id        ,
    3  : required bool      has_collaborator,
    4  : optional string    env             ,     // 发布到哪个环境，不填默认线上
    5  : optional string    commit_id       ,    // 使用哪个版本发布，不填默认最新提交版本
    6  : optional bool      force           ,    // 强制发布。若流程发布前执行了 TestRun 步骤，“force” 参数值应为 false，或不传递该参数；若流程发布前未执行 TestRun 步骤，“force” 参数值应为 true 。
    7  : optional string    workflow_version,    // required, 发布workflow的版本号，遵循 SemVer 格式为"vx.y.z"，必须比当前版本大，可通过 GetCanvasInfo 获取当前版本
    8  : optional string    version_description, // workflow的版本描述

    255: optional base.Base Base            ,
}

struct PublishWorkflowData{
    1: string workflow_id      ,
    2: string publish_commit_id,
    3: bool   success          ,
}

struct PublishWorkflowResponse{
    1  : required PublishWorkflowData data    ,

    253: required i64                 code    ,
    254: required string              msg     ,
    255: required base.BaseResp       BaseResp,
}

struct CopyWorkflowRequest {
    1  : required string    workflow_id,
    2  : required string    space_id   ,

    255: optional base.Base Base       ,
}

struct CopyWorkflowData {
    1: required string     workflow_id,
    2: required SchemaType schema_type,
}
struct CopyWorkflowResponse {
    1  : required CopyWorkflowData data    ,

    253: required i64              code    ,
    254: required string           msg     ,
    255: required base.BaseResp    BaseResp,
}

struct UserInfo {
    1: i64    user_id    ,
    2: string user_name  ,
    3: string user_avatar,
    4: string nickname, // 用户昵称
}

struct ReleasedWorkflowData {
    1: list<ReleasedWorkflow> workflow_list,
    2: i64                    total        ,
}

struct ReleasedWorkflow {
    1 : string            plugin_id                                    ,
    2 : string            workflow_id                                  ,
    3 : string            space_id                                     ,
    4 : string            name                                         ,
    5 : string            desc                                         ,
    6 : string            icon                                         ,
    7 : string            inputs            (agw.target="body_dynamic"),
    8 : string            outputs           (agw.target="body_dynamic"),
    9 : i32               end_type                                     ,
    10: i32               type                                         ,
    11: list<SubWorkflow> sub_workflow_list                            ,
    12: string            version                                      ,
    13: i64               create_time                                  ,
    14: i64               update_time                                  ,
    15: Creator           creator                                      , // workflow创作者信息
    16: WorkflowMode      flow_mode                                    ,
    17: string            flow_version                                 ,
    18: string            flow_version_desc                            ,
    19: string            latest_flow_version                          ,
    20: string            latest_flow_version_desc                     ,
    21: string            commit_id                                    ,
    22: list<NodeInfo> output_nodes,
}

struct SubWorkflow {
    1: string id  ,
    2: string name,
}

enum OrderBy {
    CreateTime  = 0,
    UpdateTime  = 1,
    PublishTime = 2,
    Hot         = 3,
    Id          = 4,
}

// Workflow 过滤条件
struct WorkflowFilter {
    1: string workflow_id,
    2: optional string workflow_version,
}

struct GetReleasedWorkflowsRequest {
    1  : optional i32          page             ,
    2  : optional i32          size             ,
    4  : optional WorkFlowType type             ,
    5  : optional string       name             ,
    6  : optional list<string> workflow_ids     ,
    7  : optional Tag          tags             ,
    8  : optional string       space_id         ,
    9  : optional OrderBy      order_by         ,
    10 : optional bool         login_user_create,
    11 : optional WorkflowMode flow_mode        , // workflow or imageflow, 默认为workflow
    12 : optional list<WorkflowFilter> workflow_filter_list, // 过滤条件，支持workflow_id和workflow_version

    255: optional base.Base    Base             ,
}
struct GetReleasedWorkflowsResponse {
    1  : required ReleasedWorkflowData data    ,

    253: required i64                  code    ,
    254: required string               msg     ,
    255: required base.BaseResp        BaseResp,
}

struct WorkflowReferencesData {
    1: list<Workflow> workflow_list,
}

struct GetWorkflowReferencesRequest {
    1  : required string    workflow_id,
    2  : required string    space_id   ,

    255: optional base.Base Base       ,
}

struct GetWorkflowReferencesResponse {
    1  : required WorkflowReferencesData data    ,

    253: required i64                    code    ,
    254: required string                 msg     ,
    255: required base.BaseResp          BaseResp,
}

struct GetExampleWorkFlowListResponse {
    1  : required WorkFlowListData data    ,

    253: required i64              code    ,
    254: required string           msg     ,
    255: required base.BaseResp    BaseResp,
}

struct GetExampleWorkFlowListRequest {
    1  : optional i32                page  , // 分页功能，指定希望获取的结果列表的页码。
    2  : optional i32                size  , // 分页功能，指定每页返回的条目数量, 必须大于0，小于等于100
    5  : optional string             name             , // 根据工作流的名称来筛选示例工作流列表。
    11 : optional WorkflowMode       flow_mode        , // 根据工作流的模式（例如：标准工作流、对话流等）筛选示例工作流列表。
    14 : optional list<CheckType>    checker          , // Bot的 Workflow as Agent模式会使用，只会使用BotAgent = 3的场景

    255: optional base.Base          Base             ,
}

enum WorkFlowListStatus {
    UnPublished  = 1,
    HadPublished = 2,
}

enum CheckType {
    WebSDKPublish = 1,
    SocialPublish = 2,
    BotAgent = 3,
    BotSocialPublish = 4,
    BotWebSDKPublish = 5,
}

enum BindBizType {
    Agent = 1 ,
    Scene = 2 ,
    DouYinBot = 3, // 抖音分身
}

struct GetWorkFlowListRequest {
    1  : optional i32                page             ,
    2  : optional i32                size             , // 分页大小，一般为10
    3  : optional list<string>       workflow_ids     , // 根据流程id列表查询对应的流程
    4  : optional WorkFlowType       type             , // 根据流程类型筛选流程
    5  : optional string             name             , // 根据流程名称筛选流程
    6  : optional Tag                tags             , // 根据标签筛选流程
    7  : optional string             space_id         , // required，空间id
    8  : optional WorkFlowListStatus status           , // 根据流程是否已发布筛选流程
    9  : optional OrderBy            order_by         ,
    10 : optional bool               login_user_create, // 根据接口请求人是否为流程创建人筛选流程
    11 : optional WorkflowMode       flow_mode        , // workflow or chatflow, 默认为workflow。根据流程类型筛选流程
    12 : optional list<SchemaType>   schema_type_list , // 新增字段，用于筛选schema_type
    13 : optional string             project_id       , // 在对应project下查询流程
    14 : optional list<CheckType>    checker, // 用于project发布过滤，此列表中的每个 CheckType 元素可指定特定规则，决定了返回的流程是否通过检查。
    15 : optional string            bind_biz_id  ,
    16 : optional BindBizType       bind_biz_type,
    17 : optional string            project_version,

    255: optional base.Base          Base             ,
}

struct ResourceActionAuth{
    1: bool can_edit  ,
    2: bool can_delete,
    3: bool can_copy  ,
}

struct ResourceAuthInfo{
    1: string             workflow_id, // 资源id
    2: string             user_id    , // 用户id
    3: ResourceActionAuth auth       , // 用户资源操作权限
}

struct WorkFlowListData {
    1: list<Workflow>         workflow_list,
    2: list<ResourceAuthInfo> auth_list    ,
    3: i64                    total        ,
}

struct GetWorkFlowListResponse {
    1  : required WorkFlowListData data    ,

    253: required i64              code    ,
    254: required string           msg     ,
    255: required base.BaseResp    BaseResp,
}

struct QueryWorkflowNodeTypeRequest{
    1  :          string    space_id   ,
    2  :          string    workflow_id,

    255: optional base.Base Base       ,
}

struct QueryWorkflowNodeTypeResponse{
    1  :          WorkflowNodeTypeData data    ,

    253: required i64                  code    ,
    254: required string               msg     ,
    255: required base.BaseResp        BaseResp,
}
struct NodeProps {
    1: string id                    ,
    2: string type                  ,
    3: bool   is_enable_chat_history,
    4: bool   is_enable_user_query  ,
    5: bool   is_ref_global_variable,
}

struct WorkflowNodeTypeData{
    1: optional list<string>    node_types                   ,
    2: optional list<string>    sub_workflow_node_types      ,
    3: optional list<NodeProps> nodes_properties             ,
    4: optional list<NodeProps> sub_workflow_nodes_properties,
}

struct WorkFlowTestRunRequest {
    1  : required string             workflow_id     ,
    2  :          map<string,string> input           ,
    3  : optional string             space_id        ,
    4  : optional string             bot_id          ,  // agent的id，非project下的流程，涉及变量节点、数据库的流程
    5  : optional string             submit_commit_id,  // 废弃
    6  : optional string             commit_id       ,  // 指定vcs commit_id，默认为空
    7  : optional string             project_id,

    255: optional base.Base          Base            ,
}
struct WorkFlowTestRunData{
    1: string workflow_id,
    2: string execute_id ,
    3: string session_id ,
}
struct WorkFlowTestRunResponse{
    1  : required WorkFlowTestRunData data    ,

    253: required i64                 code    ,
    254: required string              msg     ,
    255: required base.BaseResp       BaseResp,
}

struct WorkflowTestResumeRequest {
    1: required string workflow_id,
    2: required string execute_id,
    3: required string event_id,
    4: required string data,
    5: optional string space_id,

    255: optional base.Base          Base            ,
}

struct WorkflowTestResumeResponse{
    253: required i64                 code    ,
    254: required string              msg     ,
    255: required base.BaseResp       BaseResp,
}

enum WorkflowExeStatus{
    Running = 1,
    Success = 2,
    Fail    = 3,
    Cancel  = 4,
}

struct CancelWorkFlowRequest {
    1  : required string    execute_id ,
    2  : required string    space_id   ,
    3  : optional string    workflow_id,

    255: optional base.Base Base       ,
}

struct CancelWorkFlowResponse {
    253: required i64           code    ,
    254: required string        msg     ,
    255: required base.BaseResp BaseResp,
}

// workflow快照基本信息
struct WkPluginBasicData{
    1 : i64            workflow_id   (api.js_conv="true"),
    2 : i64            space_id      (api.js_conv="true"),
    3 : string         name  ,
    4 : string         desc ,
    5 : string         url  ,
    6 : string         icon_uri  ,
    7 : WorkFlowStatus status,
    8 : i64            plugin_id     (api.js_conv="true"), // workflow 对应的插件id
    9 : i64            create_time  ,
    10: i64            update_time  ,
    11: i64            source_id     (api.js_conv="true"),
    12: Creator        creator ,
    13: string         schema ,
    14: Node           start_node ,
    15: WorkflowMode   flow_mode ,
    16: list<i64>      sub_workflows ,
    17: string         latest_publish_commit_id,
    18: Node           end_node ,
}

struct CopyWkTemplateApiRequest{
    1  : required list<string> workflow_ids,
    2  : required i64  target_space_id (api.js_conv='true'), // 拷贝的目标空间

    255: optional base.Base Base                               ,
}

struct CopyWkTemplateApiResponse{
    1  : required map<i64,WkPluginBasicData> data     (api.js_conv='true'), // 模板ID：拷贝副本的数据

    253: required i64                        code                        ,
    254: required string                     msg                         ,
    255: required base.BaseResp              BaseResp                    ,
}

// === node history ===
struct GetWorkflowProcessRequest{
    1  : required string    workflow_id, // 流程id，不为空
    2  : required string    space_id   , // 空间id，不为空
    3  : optional string    execute_id , // 流程的执行id
    4  : optional string    sub_execute_id, // 子流程的执行id
    5  : optional bool need_async, // 是否返回所有的batch节点内容
    6  : optional string log_id,  // 未传execute_id时，可通过log_id取到execute_id
    7  : optional i64 node_id (agw.key="node_id", agw.js_conv="str", api.js_conv='true'),

    255: optional base.Base Base       ,
}

struct GetWorkflowProcessResponse{
    1  :          i64                    code    ,
    2  :          string                 msg     ,
    3  :          GetWorkFlowProcessData data    ,

    255: required base.BaseResp          BaseResp,
}

enum WorkflowExeHistoryStatus{
    NoHistory  = 1,
    HasHistory = 2,
}

struct TokenAndCost{
    1: optional string inputTokens , // input消耗Token数
    2: optional string inputCost   , // input花费
    3: optional string outputTokens, // Output消耗Token数
    4: optional string outputCost  , // Output花费
    5: optional string totalTokens , // 总消耗Token数
    6: optional string totalCost   , // 总花费
}

enum NodeHistoryScene{
    Default = 0
    TestRunInput = 1
}

struct GetNodeExecuteHistoryRequest{
    1  : required string    workflow_id,
    2  : required string    space_id   ,
    3  : required string    execute_id ,
    5  : required string node_id, // 节点id
    6  : optional bool is_batch, // 是否批次节点
    7  : optional i32 batch_index, // 执行批次
    8  : required string node_type,
    9 : optional NodeHistoryScene node_history_scene,

    255: optional base.Base Base       ,
}

struct GetNodeExecuteHistoryResponse{
    1  :          i64                    code    ,
    2  :          string                 msg     ,
    3  :          NodeResult data    ,

    255: base.BaseResp          BaseResp,
}

struct GetWorkFlowProcessData{
    1 :          string                   workFlowId      ,
    2 :          string                   executeId       ,
    3 :          WorkflowExeStatus        executeStatus   ,
    4 :          list<NodeResult>         nodeResults     ,
    5 :          string                   rate            , // 执行进度
    6 :          WorkflowExeHistoryStatus exeHistoryStatus, // 现节点试运行状态 1：没有试运行 2：试运行过
    7 :          string                   workflowExeCost , // workflow试运行耗时
    8 : optional TokenAndCost             tokenAndCost    , // 消耗
    9 : optional string                   reason          , // 失败原因
    10: optional string                   lastNodeID      , // 最后一个节点的ID
    11:          string                   logID           ,
    12: list<NodeEvent> nodeEvents, // 只返回中断中的 event
    13: string projectId,
}

enum NodeExeStatus{
    Waiting = 1,
    Running = 2,
    Success = 3,
    Fail    = 4,
}

struct NodeResult{
    1 :          string        nodeId         ,
    2 :          string        NodeType       ,
    3 :          string        NodeName       ,
    5 :          NodeExeStatus nodeStatus     ,
    6 :          string        errorInfo      ,
    7 :          string        input          , // 入参 jsonstring类型
    8 :          string        output         , // 出参 jsonstring
    9 :          string        nodeExeCost    , // 运行耗时 eg：3s
    10: optional TokenAndCost  tokenAndCost   , // 消耗
    11: optional string        raw_output     , // 直接输出
    12:          string        errorLevel     ,
    13: optional i32           index          ,
    14: optional string        items          ,
    15: optional i32           maxBatchSize   ,
    16: optional string        limitVariable  ,
    17: optional i32           loopVariableLen,
    18: optional string        batch          ,
    19: optional bool          isBatch        ,
    20:          i32           logVersion     ,
    21:          string        extra          ,
    22: optional string        executeId      ,
    23: optional string        subExecuteId   ,
    24: optional bool needAsync
}

enum EventType {
    LocalPlugin  = 1
    Question     = 2
    RequireInfos = 3
    SceneChat    = 4
    InputNode    = 5
    WorkflowLocalPlugin = 6
    WorkflowOauthPlugin = 7
}

struct NodeEvent{
    1: string id,
    2: EventType type,
    3: string node_title,
    4: string data,
    5: string node_icon,
    6: string node_id, // 实际为node_execute_id
    7: string schema_node_id, // 与画布里的node_id对应
}

struct GetUploadAuthTokenRequest {
    1  :string scene,
    255: optional base.Base Base ,
}

struct GetUploadAuthTokenResponse {
    1  : GetUploadAuthTokenData data ,
    253: required i64                    code    ,
    254: required string                 msg     ,
    255:  base.BaseResp          BaseResp,
}

struct GetUploadAuthTokenData {
    1: string              service_id        ,
    2: string              upload_path_prefix,
    3: UploadAuthTokenInfo auth              ,
    4: string              upload_host       ,
    5: string              schema
}

struct UploadAuthTokenInfo {
    1: string access_key_id    ,
    2: string secret_access_key,
    3: string session_token    ,
    4: string expired_time     ,
    5: string current_time     ,
}


struct SignImageURLRequest {
    1  : required string    uri ,
    2  : optional string    Scene,

    255: optional base.Base Base,
}

struct SignImageURLResponse {
    1  : required string        url     ,

    253: required i64           code    ,
    254: required string        msg     ,
    255:          base.BaseResp BaseResp,
}

struct ValidateErrorData {
    1: NodeError         node_error,
    2: PathError         path_error,
    3: string            message   ,
    4: ValidateErrorType type      ,
}

enum ValidateErrorType {
    BotValidateNodeErr   = 1,
    BotValidatePathErr   = 2,
    BotConcurrentPathErr = 3,
}

struct NodeError {
    1: string node_id,
}

struct PathError {
    1: string       start,
    2: string       end  ,
    3: list<string> path , // 路径上的节点ID
}

struct NodeTemplate {
    1: string           id           ,
    2: NodeTemplateType type         ,
    3: string           name         ,
    4: string           desc         ,
    5: string           icon_url     ,
    6: SupportBatch     support_batch,
    7: string           node_type    ,
    8: string           color        ,
}

// 插件配置
struct PluginAPINode {
    // 实际的插件配置
    1: string plugin_id,
    2: string api_id   ,
    3: string api_name ,

    // 用于节点展示
    4: string name     ,
    5: string desc     ,
    6: string icon_url ,
    7: string node_type,
}

// 查看更多图像插件
struct PluginCategory {
    1: string plugin_category_id,
    2: bool   only_official,

    // 用于节点展示
    3: string name     ,
    4: string icon_url ,
    5: string node_type,
}

struct NodeTemplateListRequest {
    1  : optional list<NodeTemplateType> need_types, // 需要的节点类型 不传默认返回全部
    2  : optional list<string>           node_types, // 需要的节点类型, string 类型
    255: optional base.Base              Base,
}

struct NodeTemplateListData {
    1: list<NodeTemplate> template_list,
    2: list<NodeCategory> cate_list    , // 节点的展示分类配置
    3: list<PluginAPINode> plugin_api_list    ,
    4: list<PluginCategory> plugin_category_list,
}

struct NodeCategory {
    1: string           name , // 分类名，空字符串表示下面的节点不属于任何分类
    2: list<string>     node_type_list,
    3: optional list<string> plugin_api_id_list, // 插件的api_id列表
    4: optional list<string> plugin_category_id_list, // 跳转官方插件列表的分类配置
    // 5: optional NodeCategory sub_category, // 子分类，如需支持多层，可以用sub_category来实现
}

struct NodeTemplateListResponse {
    1  :          NodeTemplateListData data    ,

    253: required i64                  code    ,
    254: required string               msg     ,
    255: required base.BaseResp        BaseResp,
}

struct WorkflowNodeDebugV2Request{
    1  :          string             workflow_id,
    2  :          string             node_id    ,
    3  :          map<string,string> input      ,
    4  :          map<string,string> batch      ,
    5  : optional string             space_id   ,
    6  : optional string             bot_id     ,
    7  : optional string             project_id ,
    8  : optional map<string,string> setting    ,
    255:          base.Base          Base       ,
}

struct WorkflowNodeDebugV2Data{
    1: string workflow_id,
    2: string node_id    ,
    3: string execute_id ,
    4: string session_id ,
}

struct WorkflowNodeDebugV2Response{
    1  : i64                     code    ,
    2  : string                  msg     ,
    3  : WorkflowNodeDebugV2Data data    ,
    255: base.BaseResp           BaseResp,
}

struct GetApiDetailRequest {
    1  :          string    pluginID,
    2  :          string    apiName ,
    3  :          string    space_id,
    4  :          string    api_id  ,
    5  : optional string    project_id,
    6  : optional string    plugin_version,
    255: optional base.Base Base    ,
}

struct DebugExample {
    1: string ReqExample  (agw.key="req_example") ,
    2: string RespExample (agw.key="resp_example"),
}

enum PluginType {
	PLUGIN  = 1
	APP = 2
	FUNC = 3
	WORKFLOW = 4
	IMAGEFLOW = 5
	LOCAL = 6
}

struct ApiDetailData {
    1 :          string       pluginID                                           ,
    2 :          string       apiName                                            ,
    3 :          string       inputs                  (agw.target="body_dynamic"),
    4 :          string       outputs                 (agw.target="body_dynamic"),
    5 :          string       icon                                               ,
    6 :          string       name                                               ,
    7 :          string       desc                                               ,
    8 :          i64          pluginProductStatus                                ,
    9 :          i64          pluginProductUnlistType                            ,
    10:          string       spaceID                                            ,
    11: optional DebugExample debugExample            (agw.key="debug_example")  ,
    12:          i64          updateTime                                         ,
    13: optional string       projectID                                          ,
    14: optional string       version                                            ,
    16: PluginType pluginType,
    17: optional string       latest_version,
    18: optional string       latest_version_name,
    19: optional string       version_name,
}

struct GetApiDetailResponse {
    1  :          i64           code    ,
    2  :          string        msg     ,
    3  :          ApiDetailData data    ,
    255: required base.BaseResp BaseResp,
}

struct NodeInfo {
    1: string node_id   ,
    2: string node_type ,
    3: string node_title,
}

struct GetWorkflowDetailInfoRequest {
    1  : optional list<WorkflowFilter> workflow_filter_list, // 过滤条件，支持workflow_id和workflow_version
    2  : optional string       space_id         ,

    255: optional base.Base    Base             ,
}

struct GetWorkflowDetailInfoResponse {
    1  : required list<WorkflowDetailInfoData> data    ,

    253: required i64                  code    ,
    254: required string               msg     ,
    255: required base.BaseResp        BaseResp,
}

struct WorkflowDetailInfoData {
    1 : string            workflow_id                                  ,
    2 : string            space_id                                     ,
    3 : string            name                                         ,
    4 : string            desc                                         ,
    5 : string            icon                                         ,
    6 : string            inputs            (agw.target="body_dynamic"),
    7 : string            outputs           (agw.target="body_dynamic"),
    8: string             version                                      ,
    9: i64                create_time                                  ,
    10: i64               update_time                                  ,
    11: string            project_id                                  ,
    12: i32               end_type                                     ,
    13: string            icon_uri                                ,
    14: WorkflowMode      flow_mode                  ,
    15: string            plugin_id                  ,
    16: Creator           creator                                      , // workflow创作者信息
    17: string            flow_version                                 ,
    18: string            flow_version_desc                            ,
    19: string            latest_flow_version                          ,
    20: string            latest_flow_version_desc                     ,
    21: string            commit_id                                    ,
    22: bool              is_project                                    ,
}

struct GetWorkflowDetailRequest {
    1  : optional list<string> workflow_ids     ,
    2  : optional string       space_id         ,

    255: optional base.Base    Base             ,
}

struct GetWorkflowDetailResponse {
    1  : required list<WorkflowDetailData> data    ,

    253: required i64                  code    ,
    254: required string               msg     ,
    255: required base.BaseResp        BaseResp,
}

struct WorkflowDetailData {
    1 : string            workflow_id                                  ,
    2 : string            space_id                                     ,
    3 : string            name                                         ,
    4 : string            desc                                         ,
    5 : string            icon                                         ,
    6 : string            inputs            (agw.target="body_dynamic"),
    7 : string            outputs           (agw.target="body_dynamic"),
    8: string            version                                      ,
    9: i64               create_time                                  ,
    10: i64               update_time                                  ,
    11: string            project_id                                  ,
    12: i32               end_type                                     ,
    13: string            icon_uri                                ,
    14: WorkflowMode       flow_mode                  ,
    15: list<NodeInfo> output_nodes,
}

enum ParameterType{
    String  = 1,
    Integer = 2,
    Number  = 3,
    Object  = 4,
    Array   = 5,
    Bool    = 6,
}

enum ParameterLocation{
    Path   = 1,
    Query  = 2,
    Body   = 3,
    Header = 4,
}

// 默认入参的设置来源
enum DefaultParamSource {
    Input    = 0, // 默认用户输入
    Variable = 1, // 引用变量
}

// 针对File类型参数的细分类型
enum AssistParameterType {
    DEFAULT = 1,
    IMAGE   = 2,
    DOC     = 3,
    CODE    = 4,
    PPT     = 5,
    TXT     = 6,
    EXCEL   = 7,
    AUDIO   = 8,
    ZIP     = 9,
    VIDEO   = 10,
    SVG     = 11,
    Voice   = 12,
}


struct APIParameter {
    1 :          string             id                    , // for前端，无实际意义
    2 :          string             name                  ,
    3 :          string             desc                  ,
    4 :          ParameterType      type                  ,
    5 : optional ParameterType      sub_type              ,
    6 :          ParameterLocation  location              ,
    7 :          bool               is_required           ,
    8 :          list<APIParameter> sub_parameters        ,
    9 : optional string             global_default        ,
    10:          bool               global_disable        ,
    11: optional string             local_default         ,
    12:          bool               local_disable         ,
    13: optional string             format                ,
    14: optional string             title                 ,
    15:          list<string>       enum_list             ,
    16: optional string             value                 ,
    17:          list<string>       enum_var_names        ,
    18: optional double             minimum               ,
    19: optional double             maximum               ,
    20: optional bool               exclusive_minimum     ,
    21: optional bool               exclusive_maximum     ,
    22: optional string             biz_extend            ,
    23: optional DefaultParamSource default_param_source  , // 默认入参的设置来源
    24: optional string             variable_ref          , // 引用variable的key
    25: optional AssistParameterType assist_type          ,
}

struct AsyncConf {
    1: bool switch_status,
    2: string message,
}

struct ResponseStyle{
    1: i32 mode
}

struct FCPluginSetting {
    1: string plugin_id,
    2: string api_id,
    3: string api_name,
    4: list<APIParameter> request_params  ,
    5: list<APIParameter> response_params ,
    6: ResponseStyle response_style,
    7: optional AsyncConf async_conf,  // 本期暂时不支持
    8: bool is_draft,
    9: string plugin_version,
}

struct FCWorkflowSetting {
    1: string workflow_id,
    2: string plugin_id,
    3: list<APIParameter> request_params  ,
    4: list<APIParameter> response_params ,
    5: ResponseStyle response_style,
    6: optional AsyncConf async_conf,  // 本期暂时不支持
    7: bool is_draft,
    8: string workflow_version,
}

struct FCDatasetSetting {
    1: string dataset_id,
}

struct GetLLMNodeFCSettingsMergedRequest {
        1  : required string    workflow_id ,
        2  : required string    space_id   ,
        3  : optional FCPluginSetting plugin_fc_setting ,
        4  : optional FCWorkflowSetting workflow_fc_setting ,
        5  : optional FCDatasetSetting dataset_fc_setting ,

        255: optional base.Base Base       ,
}

struct GetLLMNodeFCSettingsMergedResponse {
    1  : optional FCPluginSetting plugin_fc_setting ,
    2  : optional FCWorkflowSetting worflow_fc_setting ,
    3  : optional FCDatasetSetting dataset_fc_setting ,

    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}


struct PluginFCItem {
    1: string plugin_id,
    2: string api_id,
    3: string api_name,
    4: bool is_draft,
    5: optional string plugin_version,
}

struct WorkflowFCItem {
    1: string workflow_id,
    2: string plugin_id,
    3: bool is_draft,
    4: optional string workflow_version,
}

struct DatasetFCItem {
    1: string dataset_id,
    2: bool is_draft,
}

struct GetLLMNodeFCSettingDetailRequest {
     1  : required string  workflow_id ,
     2  : required string  space_id   ,
     3  : optional list<PluginFCItem> plugin_list,
     4  : optional list<WorkflowFCItem> workflow_list,
     5  : optional list<DatasetFCItem> dataset_list,

     255: optional base.Base Base       ,
}

struct PluginDetail {
    1: string id ,
    2: string icon_url,
    3: string description,
    4: bool is_official,
    5: string name,
    6: i64 plugin_status,
    7: i64 plugin_type,
    8: i64 latest_version_ts,
    9: string latest_version_name,
    10: string version_name,
}

struct APIDetail {
    1: string id , // api的id
    2: string name,
    3: string description,
    4: list<APIParameter> parameters,
    5: string plugin_id,
}

struct WorkflowDetail {
    1: string id,
    2: string plugin_id,
    3: string description,
    4: string icon_url,
    5: bool is_official,
    6: string name,
    7: i64 status,
    8: i64 type,
    9: APIDetail api_detail,
    10: string latest_version_name,
    11: i64 flow_mode,
}
struct DatasetDetail{
    1: string id ,
    2: string icon_url,
    3: string name,
    4: i64 format_type,
}
struct GetLLMNodeFCSettingDetailResponse {
    1: map<string, PluginDetail> plugin_detail_map,   // pluginid -> value
    2: map<string, APIDetail> plugin_api_detail_map,   // apiid -> value
    3: map<string, WorkflowDetail> workflow_detail_map, // workflowid-> value
    4: map<string, DatasetDetail> dataset_detail_map, // datasetid -> value

    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

struct CreateProjectConversationDefRequest {
    1: required string project_id   ,
    2: required string conversation_name,
    3: required string space_id,

    255: optional base.Base    Base     ,
}

struct CreateProjectConversationDefResponse {
    1: string unique_id,
    2: required string space_id,
    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

struct UpdateProjectConversationDefRequest {
    1: required string project_id   ,
    2: required string unique_id,
    3: required string conversation_name,
    4: required string space_id,

    255: optional base.Base    Base     ,
}

struct UpdateProjectConversationDefResponse {
    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

struct DeleteProjectConversationDefRequest {
    1: required string project_id   ,
    2: required string unique_id,
    3: map<string, string> replace, // 替换表，每个 wf 草稿分别替换成哪个, 未替换的情况下 success =false，replace 会返回待替换列表
    4: bool check_only,
    5: required string space_id,

    255: optional base.Base    Base     ,
}

struct DeleteProjectConversationDefResponse {
    1: bool success,
    2: list<Workflow> need_replace, // 如果未传递 replacemap, 会失败，返回需要替换的 wf
    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

enum CreateMethod {
    ManualCreate = 1
    NodeCreate = 2
}

enum CreateEnv {
    Draft = 1
    Release = 2
}

struct ListProjectConversationRequest {
    1: required string project_id   ,
    2: CreateMethod create_method, // 0=在project 创建（静态会话），1=通过 wf 节点创建（动态会话）
    3: CreateEnv create_env, // 0=wf 节点试运行创建的 1=wf 节点发布后运行的
    4: string cursor, // 分页偏移，不传从第一条开始
    5: i64 limit, // 一次拉取数量
    6: required string space_id,
    7: string nameLike, // conversationName 模糊搜索
    8: string connector_id, // create_env=1 时传递，传对应的渠道 id，当前默认 1024（openapi）
    9: optional string project_version, // project版本

    255: optional base.Base    Base     ,
}

struct ProjectConversation {
    1: string unique_id,
    2: string conversation_name,
    3: string conversation_id, // 对于自己在 coze 渠道的 conversationid
    4: string release_conversation_name,
}

struct ListProjectConversationResponse {
    1: list<ProjectConversation> data,
    2: string cursor, // 游标，为空表示没有下一页了, 翻页时带上这个字段
    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

enum SuggestReplyInfoMode{
    Disable = 0, // 关闭
    System  = 1, // 系统
    Custom  = 2, // 自定义

}

// suggest
struct SuggestReplyInfo {                               // 对应 Coze Auto-Suggestion
    1: optional SuggestReplyInfoMode SuggestReplyMode        (agw.key="suggest_reply_mode",go.tag = "json:\"suggest_reply_mode\"")       , // 建议问题模型
    2: optional string           CustomizedSuggestPrompt (agw.key="customized_suggest_prompt",go.tag = "json:\"customized_suggest_prompt\""), // 用户自定义建议问题
}

enum Caller{
    Canvas = 1
    UIBuilder = 2
}

struct OnboardingInfo{
    1: string Prologue  (agw.key="prologue",go.tag = "json:\"prologue\"")// markdown 格式
    2: optional list<string> SuggestedQuestions(agw.key="suggested_questions",go.tag = "json:\"suggested_questions\"") // 问题列表
    3: optional bool DisplayAllSuggestions(agw.key="display_all_suggestions",go.tag = "json:\"display_all_suggestions\"") // 是否显示所有建议问题
}

struct VoiceConfig{
    1: string VoiceName (agw.key="voice_name",go.tag = "json:\"voice_name\"")
    2: string VoiceID (agw.key="voice_id",go.tag = "json:\"voice_id\"")// 音色ID
}

enum InputMode{
    Text = 1 (agw.key="text", go.tag = "json:\"text\"")// 打字输入
    Audio = 2 (agw.key="audio", go.tag = "json:\"audio\"")// 语音输入
}

enum SendVoiceMode{
    Text = 1 (agw.key="text", go.tag = "json:\"text\"")// 文本消息
    Audio = 2 (agw.key="audio", go.tag = "json:\"audio\"")// 发送为语音
}

struct AudioConfig{
    1: optional map<string,VoiceConfig> VoiceConfigMap (agw.key="voice_config_map", go.tag = "json:\"voice_config_map\"") //key为语言 "zh", "en" "ja" "es" "id" "pt"
    3: bool IsTextToVoiceEnable (agw.key="is_text_to_voice_enable", go.tag = "json:\"is_text_to_voice_enable\"")// 文本转语音开关
    4: InputMode AgentMessageType (agw.key="agent_message_type", go.tag = "json:\"agent_message_type\"")// 智能体消息形式
}

struct UserInputConfig{
    1: InputMode DefaultInputMode (agw.key="default_input_mode", go.tag = "json:\"default_input_mode\"")// 默认输入方式
    2: SendVoiceMode SendVoiceMode (agw.key="send_voice_mode", go.tag = "json:\"send_voice_mode\"")// 用户语音消息发送形式
}

struct GradientPosition {
    1: optional double Left     (agw.key="left", go.tag = "json:\"left\"")
    2: optional double Right    (agw.key="right", go.tag = "json:\"right\"")
}


struct CanvasPosition {
    1: optional double Width    (agw.key="width", go.tag = "json:\"width\"")
    2: optional double Height   (agw.key="height" , go.tag = "json:\"height\"")
    3: optional double Left     (agw.key="left" , go.tag = "json:\"left\"")
    4: optional double Top      (agw.key="top", go.tag = "json:\"top\"")
}


struct BackgroundImageDetail {
    1: optional string OriginImageUri    (agw.key="origin_image_uri", go.tag = "json:\"origin_image_uri\"")            // 原始图片
    2: optional string OriginImageUrl    (agw.key="origin_image_url", go.tag = "json:\"origin_image_url\"")
    3: optional string ImageUri  (agw.key="image_uri", go.tag = "json:\"image_uri\"")               // 实际使用图片
    4: optional string ImageUrl  (agw.key="image_url", go.tag = "json:\"image_url\"")
    5: optional string ThemeColor    (agw.key="theme_color", go.tag = "json:\"theme_color\"")
    6: optional GradientPosition GradientPosition  (agw.key="gradient_position", go.tag = "json:\"gradient_position\"") // 渐变位置
    7: optional CanvasPosition CanvasPosition    (agw.key="canvas_position", go.tag = "json:\"canvas_position\"") // 裁剪画布位置
}

struct BackgroundImageInfo {
    1: optional BackgroundImageDetail WebBackgroundImage   (agw.key="web_background_image",go.tag = "json:\"web_background_image\"")                             , // web端背景图
    2: optional BackgroundImageDetail MobileBackgroundImage    (agw.key="mobile_background_image"go.tag = "json:\"mobile_background_image\"")                             , // 移动端背景图
}

struct AvatarConfig{
    1: string ImageUri (agw.key="image_uri", go.tag = "json:\"image_uri\"")
    2: string ImageUrl (agw.key="image_url",go.tag = "json:\"image_url\"")
}

struct ChatFlowRole{
    1: string ID (agw.key = "id",go.tag = "json:\"id\"")
    2: string WorkflowID (agw.key = "workflow_id",go.tag = "json:\"workflow_id\"")
    3: string ConnectorID  (agw.key="connector_id",go.tag = "json:\"connector_id\"") // 渠道ID
    4: optional AvatarConfig Avatar (agw.key="avatar",go.tag = "json:\"avatar\"") // 角色头像
    5: optional string Description (agw.key="description",go.tag = "json:\"description\"")// 角色描述
    6: optional OnboardingInfo OnboardingInfo (agw.key="onboarding_info",go.tag = "json:\"onboarding_info\"")// 开场白
    7: optional string Name (agw.key="name",go.tag = "json:\"name\"") // 角色名称
    8: optional SuggestReplyInfo SuggestReplyInfo (agw.key="suggest_reply_info",go.tag = "json:\"suggest_reply_info\"")// 用户问题建议
    9: optional BackgroundImageInfo BackgroundImageInfo (agw.key="background_image_info",go.tag = "json:\"background_image_info\"")// 背景图
    10: optional AudioConfig AudioConfig (agw.key="audio_config",go.tag = "json:\"audio_config\"")// 语音配置：音色、电话等
    11: optional UserInputConfig UserInputConfig (agw.key="user_input_config",go.tag = "json:\"user_input_config\"") // 用户输入方式
    12: optional string ProjectVersion (agw.key="project_version",go.tag = "json:\"project_version\"") // 项目版本
}

struct CreateChatFlowRoleRequest{
	1: ChatFlowRole ChatFlowRole(agw.key= "chat_flow_role",go.tag="json:\"chat_flow_role\"")
    255: optional base.Base Base
}

struct CreateChatFlowRoleResponse{
    1: string ID // 数据库中ID

    255: required base.BaseResp BaseResp
}

struct DeleteChatFlowRoleRequest{
	1: string WorkflowID
    2: string ConnectorID
    4: string ID // 数据库中ID

    255: optional base.Base Base
}

struct DeleteChatFlowRoleResponse{

    255: required base.BaseResp BaseResp
}

struct GetChatFlowRoleRequest{
	1: string WorkflowID (agw.key = "workflow_id")
    2: string ConnectorID (agw.key = "connector_id")
    3: bool IsDebug (agw.key = "is_debug")
//    4: optional string AppID (api.query = "app_id")
    5: optional map<string,string> Ext (api.query = "ext")
    255: optional base.Base Base
}

struct GetChatFlowRoleResponse{
	1  : optional ChatFlowRole Role (agw.key = "role")

    255: required base.BaseResp BaseResp
}

enum NodePanelSearchType {
    All              = 0,
    ResourceWorkflow = 1,
    ProjectWorkflow  = 2,
    FavoritePlugin   = 3,
    ResourcePlugin   = 4,
    ProjectPlugin    = 5,
    StorePlugin      = 6,
}

struct NodePanelSearchRequest {
    1 : NodePanelSearchType search_type, // 搜索的数据类型，传空、不传或者传All表示搜索所有类型
    2 : string          space_id,
    3 : optional string project_id,
    4 : string          search_key,
    5 : string          page_or_cursor, // 首次请求时值为"", 底层实现时根据数据源的分页模式转换成page or cursor
    6 : i32             page_size,
    7 : string          exclude_workflow_id, // 排除的workflow_id，用于搜索workflow时排除当前workflow的id

    255: optional base.Base Base,
}

struct NodePanelWorkflowData {
    1 : list<Workflow> workflow_list,
    2 : string next_page_or_cursor,  // 由于workflow的查询使用都是page+size，这里返回 page+1
    3 : bool has_more,
}

struct NodePanelPluginAPI {
    1: string api_id   ,
    2: string api_name ,
    3: string api_desc,
}

struct NodePanelPlugin {
    1: string plugin_id,
    2: string name,
    3: string desc,
    4: string icon,
    5: list<NodePanelPluginAPI> tool_list,
    6: string version,
}

struct NodePanelPluginData {
    1 : list<NodePanelPlugin> plugin_list,
    2 : string   next_page_or_cursor, // 数据源为page+size的，这里返回 page+1；数据源为cursor模式的，这里返回数据源返回的cursor
    3 : bool     has_more,
}

struct NodePanelSearchData {
    1 : optional NodePanelWorkflowData resource_workflow,
    2 : optional NodePanelWorkflowData project_workflow,
    3 : optional NodePanelPluginData   favorite_plugin,
    4 : optional NodePanelPluginData   resource_plugin,
    5 : optional NodePanelPluginData   project_plugin,
    6 : optional NodePanelPluginData   store_plugin,
}

struct NodePanelSearchResponse {
    1 : NodePanelSearchData        data,

    253: required i64              code,
    254: required string           msg ,
    255: required base.BaseResp    BaseResp,
}

enum OrderByType {
    Asc = 1
    Desc = 2
}

struct ListPublishWorkflowRequest{
    2: required i64                         space_id(agw.js_conv="str", api.js_conv="true")
    3: optional i64                         owner_id(agw.js_conv="str", api.js_conv="true") //筛选项
    4: optional string                      name   //搜索项：智能体or作者name
    5: optional OrderByType                 order_last_publish_time
    6: optional OrderByType                 order_total_token
    7: required i64                         size
    8: optional string                      cursor_id
    9: optional list<string>                workflow_ids

    255: optional base.Base Base (api.none="true")
}

struct PublishBasicWorkflowData {
    1: WorkflowBasicInfo                            basic_info //最近发布项目的信息
    2: UserInfo                                         user_info
    3: list<ConnectorInfo>                              connectors //已发布渠道聚合
    4: string                                           total_token //截止昨天总token消耗
}


struct PublishWorkflowListData{
    1: list<PublishBasicWorkflowData> workflows,
    2: i32 total,
    3: bool has_more,
    4: string next_cursor_id,
}

struct ConnectorInfo {
    1:          string                 id
    2:          string                 name
    3:          string                 icon
}

struct WorkflowBasicInfo {
    1: i64                          id (agw.js_conv="str", api.js_conv="true"),
    2: string                       name,
    3: string                       description,
    4: string                       icon_uri,
    5: string                       icon_url,
    6: i64                          space_id (agw.js_conv="str", api.js_conv="true"),
    7: i64                          owner_id (agw.js_conv="str", api.js_conv="true"),
    8: i64                       create_time,
    9: i64                       update_time,
    10: i64                      publish_time
    11: PermissionType           permission_type
}

struct ListPublishWorkflowResponse{
    1: PublishWorkflowListData data
    253: i64 code
    254: string msg
    255: optional base.BaseResp BaseResp (api.none="true")
}

enum PermissionType {
    NoDetail = 1 //不能查看详情
    Detail = 2 //可以查看详情
    Operate = 3 //可以查看和操作
}

struct ValidateTreeRequest {
    1  : required string  workflow_id ,
    2  : string bind_project_id,
    3  : string bind_bot_id,
    4  : optional string schema,

    255: optional base.Base Base  ,
}

struct ValidateTreeInfo {
   1 : string workflow_id
   2 : string name
   3 : list<ValidateErrorData> errors
}

struct ValidateTreeResponse {
    1  : list<ValidateTreeInfo> data  ,

    253: required i64                     code    ,
    254: required string                  msg     ,
    255: required base.BaseResp           BaseResp,
}

// OpenAPI

struct OpenAPIRunFlowRequest{
    1  :          string             WorkflowID (go.tag="json:\"workflow_id\"")                            ,
    2  : optional string             Parameters (go.tag="json:\"parameters\""),
    3  :          map<string,string> Ext        (go.tag="json:\"ext\"")                                    ,
    4  : optional string             BotID      (go.tag="json:\"bot_id\"")                                 ,
    5  : optional bool               IsAsync    (go.tag="json:\"is_async\"")                               ,
    6  : optional string             ExecuteMode(go.tag="json:\"execute_mode\"")                             , // 默认为正式运行，试运行需要传入"DEBUG"
    7  : optional string             Version    (go.tag="json:\"version\"")                                  , // 版本号，可能是workflow版本或者project版本
    8  : optional string             ConnectorID(go.tag="json:\"connector_id\"")                             , // 渠道ID，比如ui builder、template、商店等
    9  : optional string             AppID      (go.tag="json:\"app_id\"")                              , // 引用workflow 的应用ID
    10 : optional string             ProjectID ( go.tag="json:\"project_id\""),                      // 项目ID，为了兼容ui builder


    255: optional base.Base          Base                                                            ,
}

struct OpenAPIRunFlowResponse {
    // 通用字段
    1  : required i64           Code     (go.tag="json:\"code\"") , // 调用结果
    2  : optional string        Msg      (go.tag="json:\"msg\"")  , // 成功为success, 失败为简单的错误信息、

    // 同步返回字段
    3  : optional string        Data     (go.tag="json:\"data\"") , // 执行结果，通常为json序列化字符串，也有可能是非json结构的字符串
    4  : optional i64           Token    (go.tag="json:\"token\""),
    5  : optional string        Cost     (go.tag="json:\"cost\"") ,
    6  : optional string        DebugUrl (go.tag="json:\"debug_url\"") ,

    // 异步返回字段
    50 : optional string        ExecuteID(go.tag="json:\"execute_id\""),

    255: required base.BaseResp BaseResp                    ,
}

// 这个枚举需要与plugin的PluginInterruptType对齐
enum InterruptType {
    LocalPlugin  = 1
    Question     = 2
    RequireInfos = 3
    SceneChat    = 4
    Input        = 5

    OauthPlugin  = 7
}

struct Interrupt {
    1: string EventID( go.tag="json:\"event_id\""),
    2: InterruptType Type(go.tag="json:\"type\""),
    3: string InData( go.tag="json:\"data\""),
}

struct OpenAPIStreamRunFlowResponse {
    1:  string id, // 绝对序号
    2:  string Event(go.tag="json:\"event\"") // 事件类型:message,done,error

    // 节点信息
    50 : optional string NodeSeqID(go.tag="json:\"node_seq_id\""), //节点中的序号
    52 : optional string NodeTitle(go.tag="json:\"node_title\""), // 节点名称
    54 : optional string Content(go.tag="json:\"content\""), // ContentType为Text时的返回
    55 : optional bool NodeIsFinish(go.tag="json:\"node_is_finish\""), // 节点是否执行完成
    56:  optional Interrupt InterruptData( go.tag="json:\"interrupt_data\""),  //content type为interrupt时传输，中断协议
    57:  optional string ContentType( go.tag="json:\"content_type\""),  // 返回的数据类型
    58: optional string CardBody(go.tag="json:\"card_body\""), // Content Type为Card时返回的卡片内容
    59: optional string NodeType(go.tag= "json:\"node_type\"" ), // 节点类型
    60 : optional string NodeID (go.tag= "json:\"node_id\"") ,
    // 成功时最后一条消息
    100 : optional map<string,string> Ext(go.tag= "json:\"ext\""),
    101: optional i64 Token(go.tag= "json:\"token\""),
    102: optional string Cost (go.tag= "json:\"cost\""),

    // 错误信息
    151: optional i64 ErrorCode( go.tag= "json:\"error_code\""),
    152: optional string ErrorMessage(go.tag= "json:\"error_message\""),
    153: optional string DebugUrl (go.tag= "json:\"debug_url\"") ,

    255: required base.BaseResp BaseResp                    ,
}

struct OpenAPIStreamResumeFlowRequest{
    1: string EventID (go.tag= "json:\"event_id\"" )
    2: InterruptType InterruptType (go.tag= "json:\"interrupt_type\"" )
    3: string ResumeData (go.tag= "json:\"resume_data\"" )
    4: map<string,string> Ext (go.tag= "json:\"ext\"")
    5: string WorkflowID (go.tag= "json:\"workflow_id\"")
    6: optional string ConnectorID (go.tag= "json:\"connector_id\""), // 渠道ID，比如ui builder、template、商店等

    255: base.Base Base
}

struct GetWorkflowRunHistoryRequest{
    1: required string workflow_id,
    2: optional string execute_id ,

    255: optional base.Base Base
}

enum WorkflowRunMode {
    Sync = 0
    Stream = 1
    Async = 2
}

struct WorkflowExecuteHistory{
    1: optional i64 ExecuteID (go.tag= "json:\"execute_id\"")
    2: optional string ExecuteStatus (go.tag= "json:\"execute_status\"")
    3: optional i64 BotID (go.tag= "json:\"bot_id\"")
    4: optional i64 ConnectorID (go.tag= "json:\"connector_id\"")
    5: optional string ConnectorUID    (go.tag= "json:\"connector_uid\"")
    6: optional WorkflowRunMode RunMode (go.tag= "json:\"run_mode\"")
    7: optional string LogID (go.tag= "json:\"log_id\"")
    8: optional i64 CreateTime (go.tag= "json:\"create_time\"")
    9: optional i64 UpdateTime (go.tag= "json:\"update_time\"")
    10: optional string DebugUrl (go.tag= "json:\"debug_url\"") ,

    // 执行成功
    51: optional  string Input ( go.tag= "json:\"input\"")
    52: optional  string Output (go.tag= "json:\"output\"")
    53: optional i64 Token (go.tag= "json:\"token\"")
    54: optional string Cost (go.tag= "json:\"cost\"")
    55: optional string CostUnit (go.tag= "json:\"cost_unit\"")
    56: optional map<string,string> Ext (go.tag= "json:\"ext\"")

    // 执行失败
    101: optional  string ErrorCode (go.tag= "json:\"error_code\"")
    102: optional  string ErrorMsg (go.tag= "json:\"error_msg\"")
}

struct GetWorkflowRunHistoryResponse{
    1: optional i64                    code,
    2: optional string                 msg ,
    3: optional list<WorkflowExecuteHistory> data,

    255: required base.BaseResp BaseResp
}

struct EnterMessage {
    1: required           string Role ( go.tag= "json:\"role\"")
    2: string             Content (go.tag= "json:\"content\"") // 内容
    3: map<string,string> MetaData (go.tag= "json:\"meta_data\"")
    4: string             ContentType (go.tag= "json:\"content_type\"") //text/card/object_string
    5: string             Type (go.tag= "json:\"type\"")
}

struct ChatFlowRunRequest{
    1: string WorkflowID (go.tag= "json:\"workflow_id\"")  ,
    2: optional string Parameters (go.tag= "json:\"parameters\""),
    3: map<string,string> Ext     (go.tag= "json:\"ext\"")                                    ,
    4: optional string BotID      (go.tag= "json:\"bot_id\"")                                 ,
    6: optional string ExecuteMode(go.tag= "json:\"execute_mode\"")                             , // 默认为正式运行，试运行需要传入"DEBUG"
    7: optional string Version    (go.tag= "json:\"version\"")                                  , // 版本号，可能是workflow版本或者project版本
    8: optional string ConnectorID( go.tag= "json:\"connector_id\"")                             , // 渠道ID，比如ui builder、template、商店等
    9: optional string AppID(agw.key="app_id" go.tag= "json:\"app_id\""),
    10:optional string ConversationID  ( go.tag= "json:\"conversation_id\""), // 会话ID
    11:optional list<EnterMessage> AdditionalMessages (api.body = "additional_messages" go.tag= "json:\"additional_messages\""), // 用户希望先写入的消息
    12:optional string ProjectID ( go.tag= "json:\"project_id\""), // 项目ID，为了兼容ui builder
    13:optional SuggestReplyInfo SuggestReplyInfo (api.body = "suggest_reply_info" go.tag= "json:\"suggest_reply_info\""), // 建议回复信息

    255: optional base.Base          Base ,
}

struct ChatFlowRunResponse {
    1:  string Event(agw.key = "event",agw.target="sse" go.tag= "json:\"event\"") // 事件类型
    2:  string Data(agw.key = "data",agw.target="sse" go.tag= "json:\"data\"") // msg、error等数据，为了对齐不同的消息类型，使用json序列化
//    2: optional ChatFlowMessageDetail MessageData (api.body = "message_data") // 消息内容
//    3: optional ChatFlowChatDetail ChatData (api.body = "chat_data") // 对话内容
//    4: optional LastError ErrorData (api.body = "error_data") // 错误信息
//    5:optional string DoneMsg (api.body = "done_msg") // 结束信息

    255: required base.BaseResp BaseResp
}

struct OpenAPIGetWorkflowInfoRequest{
	1: string WorkflowID (api.path="workflow_id"  go.tag= "json:\"workflow_id\"")
    2: string ConnectorID (api.query = "connector_id", go.tag= "json:\"connector_id\"")
    3: bool IsDebug (api.query = "is_debug", go.tag= "json:\"is_debug\"")
//    4: optional string AppID (api.query = "app_id")
    5: optional string Caller (api.query = "caller",  go.tag= "json:\"caller\"")

    255: optional base.Base Base
}

struct WorkflowInfo{
    1  : optional ChatFlowRole Role (go.tag = "json:\"role\"", agw.key = "role")
}

struct OpenAPIGetWorkflowInfoResponse{
    1  : optional i32                 Code     (api.body = "code") //  适配api
    2  : optional string              Msg      (api.body = "msg")
	3  : optional WorkflowInfo WorkflowInfo (api.body = "data")

    255: required base.BaseResp BaseResp
}

// Workflow Export Request
struct ExportWorkflowRequest {
    1  : required list<string> workflow_ids       (go.tag="json:\"workflow_ids\""),
    2  : required string       space_id           (go.tag="json:\"space_id\""),
    3  : optional bool         include_dependencies (go.tag="json:\"include_dependencies\""),
    4  : optional bool         include_versions   (go.tag="json:\"include_versions\""),
    255: optional base.Base    Base,
}

struct ExportWorkflowResponse {
    1  : required string        export_data      (go.tag="json:\"export_data\""),
    253: required i64           code,
    254: required string        msg,
    255: required base.BaseResp BaseResp,
}

// Workflow Import Request
struct ImportWorkflowRequest {
    1  : required string       import_package         (go.tag="json:\"import_package\""),
    2  : optional string       target_space_id       (go.tag="json:\"target_space_id\""),
    3  : optional string       target_app_id         (go.tag="json:\"target_app_id\""),
    4  : optional string       conflict_resolution   (go.tag="json:\"conflict_resolution\""),
    5  : optional bool         should_modify_workflow_name (go.tag="json:\"should_modify_workflow_name\""),
    255: optional base.Base    Base,
}

struct ImportWorkflowResponse {
    1  : required string        import_result       (go.tag="json:\"import_result\""),
    253: required i64           code,
    254: required string        msg,
    255: required base.BaseResp BaseResp,
}

// Workflow Import Validation Request
struct ValidateImportRequest {
    1  : required string       import_package      (go.tag="json:\"import_package\""),
    2  : optional string       target_space_id    (go.tag="json:\"target_space_id\""),
    255: optional base.Base    Base,
}

struct ValidateImportResponse {
    1  : required string        validation_result  (go.tag="json:\"validation_result\""),
    253: required i64           code,
    254: required string        msg,
    255: required base.BaseResp BaseResp,
}
