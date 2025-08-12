include "../base.thrift"

namespace go workflow

enum PersistenceModel {
    DB  = 1,
    VCS = 2,
    External = 3,
}

// WorkflowMode is used to distinguish between Workflow and chatflow.
enum WorkflowMode {
    Workflow  = 0   ,
    Imageflow = 1   ,
    SceneFlow = 2   ,
    ChatFlow  = 3   ,
    All       = 100 , // Use only when querying
}

// Workflow Product Review Draft Status
enum ProductDraftStatus {
    Default   = 0, // default
    Pending   = 1, // Under review.
    Approved  = 2, // approved
    Rejected  = 3, // The review failed.
    Abandoned = 4, // Abandoned
}

enum CollaboratorMode {
    Close = 0, // Turn off multiplayer collaboration mode
    Open  = 1, // Enable multiplayer collaboration mode
}

struct Workflow{
    1 :          string             workflow_id                ,
    2 :          string             name                       ,
    3 :          string             desc                       ,
    4 :          string             url                        ,
    5 :          string             icon_uri                   ,
    6 :          WorkFlowDevStatus  status                     ,
    7 :          WorkFlowType       type                       , // Type 1: Official Template
    8 :          string             plugin_id                  , // Plugin ID for workflow
    9 :          i64                create_time                ,
    10:          i64                update_time                ,
    11:          SchemaType         schema_type                ,
    12: optional Node               start_node                 ,
    13: optional Tag                tag                        ,
    14: optional string             template_author_id         , // template creator id
    15: optional string             template_author_name       , // template creator nickname
    16: optional string             template_author_picture_url, // template creator avatar
    17: optional string             space_id                   , // Space ID
    18: optional string             interface_str              , // process entry and exit
    19: optional string             schema_json                , // New workflow definition schema
    20:          Creator            creator                    , // Workflow creator information
    21:          PersistenceModel   persistence_model          , // Storage Model
    22:          WorkflowMode       flow_mode                  , // Workflow or imageflow, the default is workflow
    23:          ProductDraftStatus product_draft_status       , // Workflow product review version status
    24: optional string             external_flow_info         , // {"project_id":"xxx","flow_id":xxxx}
    25:          CollaboratorMode   collaborator_mode          , // Workflow Multiplayer Collaboration Button Status
    26: list<CheckResult> check_result,
    27: optional string project_id,
    28: optional string dev_plugin_id, // Only the workflow under the project is available.
}

struct CheckResult {
    1: CheckType type, // check type
    2: bool is_pass, // Whether to pass
    3: string reason, // Reason for not passing
}

struct Creator {
    1: string id                                  ,
    2: string name                                ,
    3: string avatar_url                          ,
    4: bool   self       (pilota.name="rust_self"), // Did you create it yourself?
}

enum SchemaType{
    DAG = 0, // abandoned
    FDL = 1,
    BlockWise = 2, // abandoned
}

enum WorkFlowType{
    User     = 0, // user defined
    GuanFang = 1, // official template
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

//Node structure
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

//The node template type is basically the same as NodeType. One copy is due to the addition of an Imageflow type to avoid affecting the business semantics of the original NodeType
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
    6:          ParamRequirementType requirement , // Requirements 1 Do not allow deletion 2 Do not allow name change 3 Anything can be modified 4 Only display, all are not allowed to be changed
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
    1: optional list<IfCondition>   if_conditions        , // Conditions for this branch
    2: optional IfConditionRelation if_condition_relation, // The relationship between the conditions of this branch
    3: optional list<string>        next_node_id         , // The next node corresponding to this branch
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

struct TerminatePlan{//End method
    1: TerminatePlanType plan   ,
    2: string            content,
}

struct NodeParam{
    1 : optional list<Param>     input_list       , // Enter parameter list, support multi-level; support mapping
    2 : optional list<Param>     output_list      , // Output parameter list, support multi-level
    3 : optional APIParam        api_param        , // If it is an API type Node, plug-in name, API name, plug-in version, API description
    4 : optional CodeParam       code_param       , // If it is a code snippet, include the code content
    5 : optional LLMParam        llm_param        , // If it is a model, include the basic information of the model
    6 : optional DatasetParam    dataset_param    , // If it is a dataset, select a fragment of the dataset
    7 : optional TerminatePlan   terminate_plan   , // End node, how to end
    8 : optional list<Parameter> input_parameters , // (New) input parameter list
    9 : optional list<Parameter> output_parameters, // (New) Output parameter list
    10: optional Batch           batch            , // batch setup
    11: optional IfParam         if_param         , // if node parameter
}

struct NodeDesc{
    1: string desc         ,
    2: string name         , // Subtitle name
    3: string icon_url     , // This type of icon
    4: i32    support_batch, // Whether to support batch, 1 does not support, 2 supports
    5: i32    link_limit   , // Connection requirements 1 or so can be connected 2 only support the right side
}
struct OpenAPI{
    1: list<Parameter> input_list ,
    2: list<Parameter> output_list,
}

struct Batch{
    1: bool      is_batch   , // Is the batch switch on?
    2: i64       take_count , // Only process input in the range [0, take_count)
    3: Parameter input_param, // Batch input required
}

struct Node{
    1: string       workflow_id,
    2: string       node_id    , // Node ID
    3: string       node_name  , // Change node name
    4: NodeType     node_type  , // Node type
    5: NodeParam    node_param , // Core parameters of the node
    6: LayOut       lay_out    , // Node location
    7: NodeDesc     desc       , // Description of Node, explaining the link
    8: list<string> depends_on , // dependent upstream node
    9: OpenAPI      open_api   , // All inputs and outputs
}

enum SupportBatch{
    NOT_SUPPORT = 1, // 1: Not supported
    SUPPORT     = 2, // 2: Support
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
    6 :          InputType             sub_type      , // If Type is an array, there is a subtype
    7 : optional string                from_node_id  , // fromNodeId if the value of the imported parameter is a reference
    8 : optional list<string>          from_output   , // Which node's key is specifically referenced?
    9 : optional string                value         , // If the imported parameter is the user's hand input, put it here
    10: optional PluginParamTypeFormat format        ,
    11: optional i64                   assist_type   , // Auxiliary type; type = string takes effect, 0 is unset
    12: optional i64                   sub_assist_type, // If Type is an array, it represents the auxiliary type of the child element; sub_type = string takes effect, 0 is unset
}

//Status, 1 Not Submitted 2 Submitted 3 Submitted 4 Obsolete
enum WorkFlowDevStatus{
    CanNotSubmit = 1, // unsubmittable
    CanSubmit    = 2, // submittable
    HadSubmit    = 3, // Submitted
    Deleted      = 4, // delete
}
//Status, 1 Unpublishable 2 Publishable 3 Published 4 Deleted 5 Removed
enum WorkFlowStatus{
    CanNotPublish = 1, // unpublishable
    CanPublish    = 2, // publishable
    HadPublished  = 3, // Published
    Deleted       = 4, // delete
    Unlisted      = 5, // offline
}



struct CreateWorkflowRequest{
    1  : required string       name         , // process name
    2  : required string       desc         , // Process description, not null
    3  : required string       icon_uri     , // Process icon uri, not nullable
    4  : required string       space_id     , // Space id, cannot be empty
    5  : optional WorkflowMode flow_mode    , // Workflow or chatflow, the default is workflow
    6  : optional SchemaType   schema_type  ,
    7  : optional string       bind_biz_id  ,
    8  : optional i32          bind_biz_type, // Bind the business type, do not fill in if necessary. Refer to the BindBizType structure, when the value is 3, it represents the Douyin doppelganger.
    9  : optional string       project_id   , // Application id, when filled in, it means that the process is the process under the project, and it needs to be released with the project.
    10 : optional bool         create_conversation, // Whether to create a session, only if flow_mode = chatflow
    255: optional base.Base    Base     ,
}

struct CreateWorkflowData{
    1:          string         workflow_id       , // The ID of the process, used to identify a unique process
    2:          string         name              , // process name
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
    1  : required string    workflow_id           , // The ID of the process, used to identify a unique process
    2  : optional string    schema                , // Process schema
    3  : optional string    space_id              , // Required, space id, not nullable
    4  : optional string    name                  ,
    5  : optional string    desc                  ,
    6  : optional string    icon_uri              ,
    7  : required string    submit_commit_id      , // The commit_id of a commit. This is used to uniquely identify individual commit versions of a process (each commit_id corresponds only and only to one commit version of a process).
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
    6: optional bool          is_bind_agent     , // Is the Agent bound?
    7: optional string        bind_biz_id       ,
    8: optional i32           bind_biz_type     ,
    9: optional string        workflow_version  ,
}

struct GetCanvasInfoRequest {
    1  : required string    space_id   , // Space id, cannot be empty
    2  : optional string    workflow_id, // Required, process id, not null

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
    3  : optional string      commit_id  , // You need to pass in when paging multiple times.
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
    BlockwiseUnbind = 1, // Blockwise Unbinding
    BlockwiseDelete = 2, // Blockwise removal
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
    CanDelete          = 0, // Can be deleted: No workflow product/product removed from the shelves/first time on the shelves and the review failed
    RejectProductDraft = 1, // Review failed after deletion: The workflow product is on the shelves for the first time and is under review.
    UnListProduct      = 2, // Products that need to be removed from the shelves first: workflow products have been put on the shelves.
}

struct PublishWorkflowRequest{
    1  : required string    workflow_id     ,
    2  : required string    space_id        ,
    3  : required bool      has_collaborator,
    4  : optional string    env             ,     // Which environment to publish to, do not fill in the default line
    5  : optional string    commit_id       ,    // Which version to use to release, do not fill in the default latest commit version
    6  : optional bool      force           ,    // Force release. If the TestRun step was executed before the process was published, the "force" parameter value should be false, or not passed; if the TestRun step was not executed before the process was published, the "force" parameter value should be true.
    7  : optional string    workflow_version,    // Required, the version number of the published workflow, in SemVer format "vx.y.z", must be larger than the current version, the current version can be obtained through GetCanvasInfo
    8  : optional string    version_description, // Workflow version description

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
    4: string nickname, // user nickname
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
    15: Creator           creator                                      , // Workflow creator information
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

// Workflow filter
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
    11 : optional WorkflowMode flow_mode        , // Workflow or imageflow, default to workflow
    12 : optional list<WorkflowFilter> workflow_filter_list, // Filter conditions, support workflow_id and workflow_version

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
    1  : optional i32                page  , // Paging function, specifying the page number of the list of results you want to retrieve.
    2  : optional i32                size  , // Paging function, specifies the number of entries returned per page, must be greater than 0, less than or equal to 100
    5  : optional string             name             , // Filter the list of sample workflows by the name of the workflow.
    11 : optional WorkflowMode       flow_mode        , // Filter the sample workflow list based on the workflow pattern (e.g., standard workflow, conversation flow, etc.).
    14 : optional list<CheckType>    checker          , // Bot's Workflow as Agent mode will be used, only scenarios with BotAgent = 3 will be used

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
    DouYinBot = 3, // Douyin doppelganger
}

struct GetWorkFlowListRequest {
    1  : optional i32                page             ,
    2  : optional i32                size             , // Page size, usually 10.
    3  : optional list<string>       workflow_ids     , // Query the corresponding process according to the process id list
    4  : optional WorkFlowType       type             , // Filter processes by process type
    5  : optional string             name             , // Filter processes by process name
    6  : optional Tag                tags             , // Filter process by label
    7  : optional string             space_id         , // Required, space id
    8  : optional WorkFlowListStatus status           , // Filter process according to whether the process has been published
    9  : optional OrderBy            order_by         ,
    10 : optional bool               login_user_create, // Filter processes based on whether the interface requester is the process creator
    11 : optional WorkflowMode       flow_mode        , // Workflow or chatflow, the default is workflow. Filter processes by process type
    12 : optional list<SchemaType>   schema_type_list , // New field for filtering schema_type
    13 : optional string             project_id       , // Query process under the corresponding project
    14 : optional list<CheckType>    checker, // For project publication filtering, each CheckType element in this list can specify a specific rule that determines whether the returned process passes the check.
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
    1: string             workflow_id, // Resource ID
    2: string             user_id    , // user id
    3: ResourceActionAuth auth       , // user resource operation permission
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
    4  : optional string             bot_id          ,  // The id of the agent, the process under non-project, the process involving variable nodes and databases
    5  : optional string             submit_commit_id,  // abandoned
    6  : optional string             commit_id       ,  // Specify vcs commit_id, default is empty
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

// Workflow snapshot basic information
struct WkPluginBasicData{
    1 : i64            workflow_id   (api.js_conv="true"),
    2 : i64            space_id      (api.js_conv="true"),
    3 : string         name  ,
    4 : string         desc ,
    5 : string         url  ,
    6 : string         icon_uri  ,
    7 : WorkFlowStatus status,
    8 : i64            plugin_id     (api.js_conv="true"), // Plugin ID for workflow
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
    2  : required i64  target_space_id (api.js_conv='true'), // Copy target space

    255: optional base.Base Base                               ,
}

struct CopyWkTemplateApiResponse{
    1  : required map<i64,WkPluginBasicData> data     (api.js_conv='true'), // Template ID: Copy copy of data

    253: required i64                        code                        ,
    254: required string                     msg                         ,
    255: required base.BaseResp              BaseResp                    ,
}

// === node history ===
struct GetWorkflowProcessRequest{
    1  : required string    workflow_id, // Process id, not empty
    2  : required string    space_id   , // Space id, not empty
    3  : optional string    execute_id , // Execution ID of the process
    4  : optional string    sub_execute_id, // Execution ID of the subprocess
    5  : optional bool need_async, // Whether to return all batch node contents
    6  : optional string log_id,  // When execute_id is not transmitted, it can be obtained through log_id execute_id
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
    1: optional string inputTokens , // Input Consumption Tokens
    2: optional string inputCost   , // Input cost
    3: optional string outputTokens, // Output Consumption Tokens
    4: optional string outputCost  , // Output cost
    5: optional string totalTokens , // Total Consumed Tokens
    6: optional string totalCost   , // total cost
}

enum NodeHistoryScene{
    Default = 0
    TestRunInput = 1
}

struct GetNodeExecuteHistoryRequest{
    1  : required string    workflow_id,
    2  : required string    space_id   ,
    3  : required string    execute_id ,
    5  : required string node_id, // Node ID
    6  : optional bool is_batch, // Whether batch node
    7  : optional i32 batch_index, // execution batch
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
    5 :          string                   rate            , // execution progress
    6 :          WorkflowExeHistoryStatus exeHistoryStatus, // Current node practice run state 1: no practice run 2: practice run
    7 :          string                   workflowExeCost , // Workflow practice running time
    8 : optional TokenAndCost             tokenAndCost    , // consume
    9 : optional string                   reason          , // reason for failure
    10: optional string                   lastNodeID      , // The ID of the last node
    11:          string                   logID           ,
    12: list<NodeEvent> nodeEvents, // Returns only events in the interrupt
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
    7 :          string        input          , // Imported parameters jsonString type
    8 :          string        output         , // Exported parameter jsonString
    9 :          string        nodeExeCost    , // Running time eg: 3s
    10: optional TokenAndCost  tokenAndCost   , // consume
    11: optional string        raw_output     , // direct output
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
    6: string node_id, // Actually node_execute_id
    7: string schema_node_id, // Corresponds to node_id on canvas
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
    3: list<string> path , // Node ID on the path
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

// plug-in configuration
struct PluginAPINode {
    // Actual plug-in configuration
    1: string plugin_id,
    2: string api_id   ,
    3: string api_name ,

    // For node display
    4: string name     ,
    5: string desc     ,
    6: string icon_url ,
    7: string node_type,
}

// View more image plugins
struct PluginCategory {
    1: string plugin_category_id,
    2: bool   only_official,

    // For node display
    3: string name     ,
    4: string icon_url ,
    5: string node_type,
}

struct NodeTemplateListRequest {
    1  : optional list<NodeTemplateType> need_types, // Required node type, return all by default without passing
    2  : optional list<string>           node_types, // Required node type, string type
    255: optional base.Base              Base,
}

struct NodeTemplateListData {
    1: list<NodeTemplate> template_list,
    2: list<NodeCategory> cate_list    , // Display classification configuration of nodes
    3: list<PluginAPINode> plugin_api_list    ,
    4: list<PluginCategory> plugin_category_list,
}

struct NodeCategory {
    1: string           name , // Category name, empty string indicates that the following node does not belong to any category
    2: list<string>     node_type_list,
    3: optional list<string> plugin_api_id_list, // List of api_id plugins
    4: optional list<string> plugin_category_id_list, // Jump to the classification configuration of the official plug-in list
    // 5: optional NodeCategory sub_category,//sub-category, if you need to support multi-layer, you can use sub_category to achieve
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
    1  : optional list<WorkflowFilter> workflow_filter_list, // Filter conditions, support workflow_id and workflow_version
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
    16: Creator           creator                                      , // Workflow creator information
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

// Default imported parameter settings source
enum DefaultParamSource {
    Input    = 0, // default user input
    Variable = 1, // reference variable
}

// Subdivision types for File type parameters
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
    1 :          string             id                    , // For the front end, no practical significance
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
    23: optional DefaultParamSource default_param_source  , // Default imported parameter settings source
    24: optional string             variable_ref          , // Reference variable key
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
    7: optional AsyncConf async_conf,  // This issue is temporarily not supported.
    8: bool is_draft,
    9: string plugin_version,
}

struct FCWorkflowSetting {
    1: string workflow_id,
    2: string plugin_id,
    3: list<APIParameter> request_params  ,
    4: list<APIParameter> response_params ,
    5: ResponseStyle response_style,
    6: optional AsyncConf async_conf,  // This issue is temporarily not supported.
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
    1: string id , // API ID
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
    3: map<string, string> replace, // Replace the table, which one to replace each wf draft with. If not replaced, success = false, replace will return the list to be replaced.
    4: bool check_only,
    5: required string space_id,

    255: optional base.Base    Base     ,
}

struct DeleteProjectConversationDefResponse {
    1: bool success,
    2: list<Workflow> need_replace, // If no replacemap is passed, it will fail, returning the wf that needs to be replaced
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
    2: CreateMethod create_method, // 0 = created in project (static session), 1 = created through wf node (dynamic session)
    3: CreateEnv create_env, // 0 = wf node practice run created 1 = wf node run after release
    4: string cursor, // Paging offset, do not pass from the first item
    5: i64 limit, // number of pulls at one time
    6: required string space_id,
    7: string nameLike, // conversationName fuzzy search
    8: string connector_id, // create_env = 1, pass the corresponding channel id, the current default 1024 (openapi)
    9: optional string project_version, // Project version

    255: optional base.Base    Base     ,
}

struct ProjectConversation {
    1: string unique_id,
    2: string conversation_name,
    3: string conversation_id, // For your own conversationid in the coze channel
    4: string release_conversation_name,
}

struct ListProjectConversationResponse {
    1: list<ProjectConversation> data,
    2: string cursor, // Cursor, empty means there is no next page, bring this field when turning the page
    253: required i64                code    ,
    254: required string             msg     ,
    255: required base.BaseResp      BaseResp,
}

enum SuggestReplyInfoMode{
    Disable = 0, // close
    System  = 1, // system
    Custom  = 2, // custom

}

// suggest
struct SuggestReplyInfo {                               // Coze Auto-Suggestion
    1: optional SuggestReplyInfoMode SuggestReplyMode        (agw.key="suggest_reply_mode",go.tag = "json:\"suggest_reply_mode\"")       , // suggestion problem model
    2: optional string           CustomizedSuggestPrompt (agw.key="customized_suggest_prompt",go.tag = "json:\"customized_suggest_prompt\""), // user-defined suggestion questions
}

enum Caller{
    Canvas = 1
    UIBuilder = 2
}

struct OnboardingInfo{
    1: string Prologue  (agw.key="prologue",go.tag = "json:\"prologue\"")// Markdown format
    2: optional list<string> SuggestedQuestions(agw.key="suggested_questions",go.tag = "json:\"suggested_questions\"") // List of questions
    3: optional bool DisplayAllSuggestions(agw.key="display_all_suggestions",go.tag = "json:\"display_all_suggestions\"") // Whether to display all suggested questions
}

struct VoiceConfig{
    1: string VoiceName (agw.key="voice_name",go.tag = "json:\"voice_name\"")
    2: string VoiceID (agw.key="voice_id",go.tag = "json:\"voice_id\"")// timbre ID
}

enum InputMode{
    Text = 1 (agw.key="text", go.tag = "json:\"text\"")// Type input
    Audio = 2 (agw.key="audio", go.tag = "json:\"audio\"")// Voice input
}

enum SendVoiceMode{
    Text = 1 (agw.key="text", go.tag = "json:\"text\"")// text message
    Audio = 2 (agw.key="audio", go.tag = "json:\"audio\"")// Send as voice
}

struct AudioConfig{
    1: optional map<string,VoiceConfig> VoiceConfigMap (agw.key="voice_config_map", go.tag = "json:\"voice_config_map\"") //Key for language "zh", "en" "ja" "es" "id" "pt"
    3: bool IsTextToVoiceEnable (agw.key="is_text_to_voice_enable", go.tag = "json:\"is_text_to_voice_enable\"")// Text to speech switch
    4: InputMode AgentMessageType (agw.key="agent_message_type", go.tag = "json:\"agent_message_type\"")// agent message form
}

struct UserInputConfig{
    1: InputMode DefaultInputMode (agw.key="default_input_mode", go.tag = "json:\"default_input_mode\"")// Default input method
    2: SendVoiceMode SendVoiceMode (agw.key="send_voice_mode", go.tag = "json:\"send_voice_mode\"")// User voice message sending form
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
    1: optional string OriginImageUri    (agw.key="origin_image_uri", go.tag = "json:\"origin_image_uri\"")            // original image
    2: optional string OriginImageUrl    (agw.key="origin_image_url", go.tag = "json:\"origin_image_url\"")
    3: optional string ImageUri  (agw.key="image_uri", go.tag = "json:\"image_uri\"")               // Actual use of pictures
    4: optional string ImageUrl  (agw.key="image_url", go.tag = "json:\"image_url\"")
    5: optional string ThemeColor    (agw.key="theme_color", go.tag = "json:\"theme_color\"")
    6: optional GradientPosition GradientPosition  (agw.key="gradient_position", go.tag = "json:\"gradient_position\"") // Gradual change of position
    7: optional CanvasPosition CanvasPosition    (agw.key="canvas_position", go.tag = "json:\"canvas_position\"") // Crop canvas position
}

struct BackgroundImageInfo {
    1: optional BackgroundImageDetail WebBackgroundImage   (agw.key="web_background_image",go.tag = "json:\"web_background_image\"")                             , // Web background cover
    2: optional BackgroundImageDetail MobileBackgroundImage    (agw.key="mobile_background_image"go.tag = "json:\"mobile_background_image\"")                             , // Mobile end background cover
}

struct AvatarConfig{
    1: string ImageUri (agw.key="image_uri", go.tag = "json:\"image_uri\"")
    2: string ImageUrl (agw.key="image_url",go.tag = "json:\"image_url\"")
}

struct ChatFlowRole{
    1: string ID (agw.key = "id",go.tag = "json:\"id\"")
    2: string WorkflowID (agw.key = "workflow_id",go.tag = "json:\"workflow_id\"")
    3: string ConnectorID  (agw.key="connector_id",go.tag = "json:\"connector_id\"") // Channel ID
    4: optional AvatarConfig Avatar (agw.key="avatar",go.tag = "json:\"avatar\"") // avatar
    5: optional string Description (agw.key="description",go.tag = "json:\"description\"")// Role Description
    6: optional OnboardingInfo OnboardingInfo (agw.key="onboarding_info",go.tag = "json:\"onboarding_info\"")// opening statement
    7: optional string Name (agw.key="name",go.tag = "json:\"name\"") // role name
    8: optional SuggestReplyInfo SuggestReplyInfo (agw.key="suggest_reply_info",go.tag = "json:\"suggest_reply_info\"")// User Question Suggestions
    9: optional BackgroundImageInfo BackgroundImageInfo (agw.key="background_image_info",go.tag = "json:\"background_image_info\"")// background cover
    10: optional AudioConfig AudioConfig (agw.key="audio_config",go.tag = "json:\"audio_config\"")// Voice configuration: tone, phone, etc
    11: optional UserInputConfig UserInputConfig (agw.key="user_input_config",go.tag = "json:\"user_input_config\"") // user input method
    12: optional string ProjectVersion (agw.key="project_version",go.tag = "json:\"project_version\"") // project version
}

struct CreateChatFlowRoleRequest{
	1: ChatFlowRole ChatFlowRole(agw.key= "chat_flow_role",go.tag="json:\"chat_flow_role\"")
    255: optional base.Base Base
}

struct CreateChatFlowRoleResponse{
    1: string ID // ID in the database

    255: required base.BaseResp BaseResp
}

struct DeleteChatFlowRoleRequest{
	1: string WorkflowID
    2: string ConnectorID
    4: string ID // ID in the database

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
    1 : NodePanelSearchType search_type, // The data type of the search, pass empty, do not pass, or pass All means search for all types
    2 : string          space_id,
    3 : optional string project_id,
    4 : string          search_key,
    5 : string          page_or_cursor, // The value is "" on the first request, and the underlying implementation is converted to a page or cursor according to the paging mode of the data source
    6 : i32             page_size,
    7 : string          exclude_workflow_id, // Excluded workflow_id, used to exclude the id of the current workflow when searching for workflow

    255: optional base.Base Base,
}

struct NodePanelWorkflowData {
    1 : list<Workflow> workflow_list,
    2 : string next_page_or_cursor,  // Since the query of workflow is all page + size, page + 1 is returned here.
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
    2 : string   next_page_or_cursor, // If the data source is page + size, return page + 1 here; if the data source is cursor mode, return the cursor returned by the data source here
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
    3: optional i64                         owner_id(agw.js_conv="str", api.js_conv="true") //filter
    4: optional string                      name   //Search term: agent or author name
    5: optional OrderByType                 order_last_publish_time
    6: optional OrderByType                 order_total_token
    7: required i64                         size
    8: optional string                      cursor_id
    9: optional list<string>                workflow_ids

    255: optional base.Base Base (api.none="true")
}

struct PublishBasicWorkflowData {
    1: WorkflowBasicInfo                            basic_info //Information on recently released projects
    2: UserInfo                                         user_info
    3: list<ConnectorInfo>                              connectors //Published channel aggregation
    4: string                                           total_token //Total token consumption as of yesterday
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
    NoDetail = 1 //Can't view details
    Detail = 2 //You can check the details.
    Operate = 3 //Can be viewed and operated
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
    6  : optional string             ExecuteMode(go.tag="json:\"execute_mode\"")                             , // Default to official run, practice run needs to pass in "DEBUG"
    7  : optional string             Version    (go.tag="json:\"version\"")                                  , // Version number, maybe workflow version or project version
    8  : optional string             ConnectorID(go.tag="json:\"connector_id\"")                             , // Channel ID, such as ui builder, template, store, etc
    9  : optional string             AppID      (go.tag="json:\"app_id\"")                              , // App ID referencing workflow
    10 : optional string             ProjectID ( go.tag="json:\"project_id\""),                      // Project ID, for compatibility with UI builder


    255: optional base.Base          Base                                                            ,
}

struct OpenAPIRunFlowResponse {
    // generic field
    1  : required i64           Code     (go.tag="json:\"code\"") , // call result
    2  : optional string        Msg      (go.tag="json:\"msg\"")  , // Success for success, failure for simple error messages,

    // Synchronized return field
    3  : optional string        Data     (go.tag="json:\"data\"") , // The execution result, usually a json serialized string, may also be a non-json string.
    4  : optional i64           Token    (go.tag="json:\"token\""),
    5  : optional string        Cost     (go.tag="json:\"cost\"") ,
    6  : optional string        DebugUrl (go.tag="json:\"debug_url\"") ,

    // asynchronous return field
    50 : optional string        ExecuteID(go.tag="json:\"execute_id\""),

    255: required base.BaseResp BaseResp                    ,
}

// This enumeration needs to be aligned with the plugin's PluginInterruptType
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
    1:  string id, // absolute serial number
    2:  string Event(go.tag="json:\"event\"") // Event type: message, done, error

    // Node information
    50 : optional string NodeSeqID(go.tag="json:\"node_seq_id\""), //The serial number in the node
    52 : optional string NodeTitle(go.tag="json:\"node_title\""), // Node name
    54 : optional string Content(go.tag="json:\"content\""), // Return when ContentType is Text
    55 : optional bool NodeIsFinish(go.tag="json:\"node_is_finish\""), // Has the node completed execution?
    56:  optional Interrupt InterruptData( go.tag="json:\"interrupt_data\""),  //Transmission when content type is interrupt, interrupt protocol
    57:  optional string ContentType( go.tag="json:\"content_type\""),  // Data type returned
    58: optional string CardBody(go.tag="json:\"card_body\""), // Card Content Returned when Content Type is Card
    59: optional string NodeType(go.tag= "json:\"node_type\"" ), // Node type
    60 : optional string NodeID (go.tag= "json:\"node_id\"") ,
    // Last message on success
    100 : optional map<string,string> Ext(go.tag= "json:\"ext\""),
    101: optional i64 Token(go.tag= "json:\"token\""),
    102: optional string Cost (go.tag= "json:\"cost\""),

    // error message
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
    6: optional string ConnectorID (go.tag= "json:\"connector_id\""), // Channel ID, such as ui builder, template, store, etc

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

    // successful execution
    51: optional  string Input ( go.tag= "json:\"input\"")
    52: optional  string Output (go.tag= "json:\"output\"")
    53: optional i64 Token (go.tag= "json:\"token\"")
    54: optional string Cost (go.tag= "json:\"cost\"")
    55: optional string CostUnit (go.tag= "json:\"cost_unit\"")
    56: optional map<string,string> Ext (go.tag= "json:\"ext\"")

    // execution failed
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
    2: string             Content (go.tag= "json:\"content\"") // content
    3: map<string,string> MetaData (go.tag= "json:\"meta_data\"")
    4: string             ContentType (go.tag= "json:\"content_type\"") //text/card/object_string
    5: string             Type (go.tag= "json:\"type\"")
}

struct ChatFlowRunRequest{
    1: string WorkflowID (go.tag= "json:\"workflow_id\"")  ,
    2: optional string Parameters (go.tag= "json:\"parameters\""),
    3: map<string,string> Ext     (go.tag= "json:\"ext\"")                                    ,
    4: optional string BotID      (go.tag= "json:\"bot_id\"")                                 ,
    6: optional string ExecuteMode(go.tag= "json:\"execute_mode\"")                             , // Default to official run, practice run needs to pass in "DEBUG"
    7: optional string Version    (go.tag= "json:\"version\"")                                  , // Version number, maybe workflow version or project version
    8: optional string ConnectorID( go.tag= "json:\"connector_id\"")                             , // Channel ID, such as ui builder, template, store, etc
    9: optional string AppID(agw.key="app_id" go.tag= "json:\"app_id\""),
    10:optional string ConversationID  ( go.tag= "json:\"conversation_id\""), // Session ID
    11:optional list<EnterMessage> AdditionalMessages (api.body = "additional_messages" go.tag= "json:\"additional_messages\""), // The message that the user wants to write first
    12:optional string ProjectID ( go.tag= "json:\"project_id\""), // Project ID, for compatibility with UI builder
    13:optional SuggestReplyInfo SuggestReplyInfo (api.body = "suggest_reply_info" go.tag= "json:\"suggest_reply_info\""), // Suggested reply message

    255: optional base.Base          Base ,
}

struct ChatFlowRunResponse {
    1:  string Event(agw.key = "event",agw.target="sse" go.tag= "json:\"event\"") // event type
    2:  string Data(agw.key = "data",agw.target="sse" go.tag= "json:\"data\"") // Msg, error and other data, in order to align different message types, use json serialization
//    2: optional ChatFlowMessageDetail MessageData (api.body = "message_data")//Message content
//    3: optional ChatFlowChatDetail ChatData (api.body = "chat_data")//dialogue content
//    4: optional LastError ErrorData (api.body = "error_data")//Error message
//    5: optional string DoneMsg (api.body = "done_msg")//end information

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
    1  : optional i32                 Code     (api.body = "code") //  API adaptation
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
