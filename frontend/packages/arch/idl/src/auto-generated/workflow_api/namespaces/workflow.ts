/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

/** 针对File类型参数的细分类型 */
export enum AssistParameterType {
  DEFAULT = 1,
  IMAGE = 2,
  DOC = 3,
  CODE = 4,
  PPT = 5,
  TXT = 6,
  EXCEL = 7,
  AUDIO = 8,
  ZIP = 9,
  VIDEO = 10,
  SVG = 11,
  Voice = 12,
}

export enum AuthAction {
  Create = 1,
  Delete = 2,
  Save = 3,
  Submit = 4,
  Publish = 5,
  Merge = 6,
  Diff = 7,
  Revert = 8,
  Read = 9,
  ListHistory = 10,
  ListCollaborator = 11,
  SpaceAdmin = 12,
  SpaceOperator = 13,
  ListPluginPrice = 14,
}

export enum AuthType {
  Pass = 1,
  UnPass = 2,
}

export enum BasicNodeType {
  PluginAPI = 1,
  /** 基础节点模版 */
  NodeTemplate = 2,
}

export enum BindBizType {
  Agent = 1,
  Scene = 2,
  DouYinBot = 3,
}

export enum BindStageType {
  Default = 0,
  Draft = 1,
  Commit = 2,
  Publish = 3,
}

export enum BrushDataType {
  /** 刷新所有数据 */
  All = 1,
  /** 按工作流ID刷新 */
  WorkflowId = 2,
  /** 按空间ID刷新 */
  SpaceId = 3,
  /** 按ID范围刷新，需要有自增的主键 */
  IdRange = 4,
}

export enum Caller {
  Canvas = 1,
  UIBuilder = 2,
}

export enum CheckType {
  WebSDKPublish = 1,
  SocialPublish = 2,
  BotAgent = 3,
  BotSocialPublish = 4,
  BotWebSDKPublish = 5,
  MCPPublish = 6,
}

export enum CollaboratorMode {
  /** 关闭多人协作模式 */
  Close = 0,
  /** 开启多人协作模式 */
  Open = 1,
}

export enum CollaboratorOperationType {
  Add = 1,
  Remove = 2,
}

export enum CollaboratorType {
  /** 获取有协作者mode=0的workflow数据 */
  GetHasCollaborator = 0,
  /** 获取无协作者mode=1的workflow数据 */
  GetNoCollaborator = 1,
  /** 更新有协作者mode=0的workflow数据 */
  UpdateHasCollaborator = 2,
  /** 更新无协作者mode=1的workflow数据 */
  UpdateNoCollaborator = 3,
}

export enum ConditionType {
  Equal = 1,
  NotEqual = 2,
  LengthGt = 3,
  LengthGtEqual = 4,
  LengthLt = 5,
  LengthLtEqual = 6,
  Contains = 7,
  NotContains = 8,
  Null = 9,
  NotNull = 10,
  True = 11,
  False = 12,
  Gt = 13,
  GtEqual = 14,
  Lt = 15,
  LtEqual = 16,
}

export enum ContentType {
  Unknown = 0,
  Text = 1,
  Card = 3,
  Verbose = 4,
  Interrupt = 5,
}

export enum CreateEnv {
  Draft = 1,
  Release = 2,
}

export enum CreateMethod {
  ManualCreate = 1,
  NodeCreate = 2,
}

/** 默认入参的设置来源 */
export enum DefaultParamSource {
  /** 默认用户输入 */
  Input = 0,
  /** 引用变量 */
  Variable = 1,
}

export enum DeleteAction {
  /** Blockwise的解绑 */
  BlockwiseUnbind = 1,
  /** Blockwise的删除 */
  BlockwiseDelete = 2,
}

export enum DeleteStatus {
  SUCCESS = 0,
  FAIL = 1,
}

export enum DeleteType {
  /** 可以删除：无workflow商品/商品下架/第一次上架且审核失败 */
  CanDelete = 0,
  /** 删除后审核失败：workflow商品第一次上架并处于审核中 */
  RejectProductDraft = 1,
  /** 需要商品先下架：workflow商品已上架 */
  UnListProduct = 2,
}

export enum DiffTypeMeta {
  /** 草稿和最新提交版本都没有做修改 */
  NoChanges = 1,
  /** 草稿做了修改 */
  ChangesByDraft = 2,
  /** 最新做了修改 */
  ChangesByLatest = 3,
  /** 草稿和最新提交都做了修改 */
  Conflict = 4,
}

export enum EventType {
  LocalPlugin = 1,
  Question = 2,
  RequireInfos = 3,
  SceneChat = 4,
  InputNode = 5,
  WorkflowLocalPlugin = 6,
}

export enum ExeternalRunMode {
  Sync = 0,
  Stream = 1,
}

export enum FieldType {
  Object = 1,
  String = 2,
  Integer = 3,
  Bool = 4,
  Array = 5,
  Number = 6,
}

export enum IfConditionRelation {
  And = 1,
  Or = 2,
}

export enum ImageflowTabType {
  /** 默认值，基础节点 */
  BasicNode = 0,
  /** ToolMarket = 1 // 工具市场，后续扩展 */
  All = 10,
}

export enum InputMode {
  /** 打字输入 */
  text = 1,
  /** 语音输入 */
  audio = 2,
}

export enum InputType {
  String = 1,
  Integer = 2,
  Boolean = 3,
  Number = 4,
  Array = 5,
  Object = 6,
}

export enum InterruptType {
  LocalPlugin = 1,
  Question = 2,
  RequireInfos = 3,
  SceneChat = 4,
  Input = 5,
}

export enum NodeExeStatus {
  Waiting = 1,
  Running = 2,
  Success = 3,
  Fail = 4,
}

export enum NodeHistoryScene {
  Default = 0,
  TestRunInput = 1,
}

export enum NodePanelSearchType {
  All = 0,
  ResourceWorkflow = 1,
  ProjectWorkflow = 2,
  FavoritePlugin = 3,
  ResourcePlugin = 4,
  ProjectPlugin = 5,
  StorePlugin = 6,
}

export enum NodeTemplateLinkLimit {
  Both = 1,
  JustRight = 2,
  JustLeft = 3,
}

export enum NodeTemplateStatus {
  Valide = 1,
  Invalide = 2,
}

/** 节点模版类型，与NodeType基本保持一致，copy一份是因为新增了一个Imageflow类型，避免影响原来NodeType的业务语意 */
export enum NodeTemplateType {
  Start = 1,
  End = 2,
  LLM = 3,
  Api = 4,
  Code = 5,
  Dataset = 6,
  If = 8,
  SubWorkflow = 9,
  Variable = 11,
  Database = 12,
  Message = 13,
  Imageflow = 14,
  Text = 15,
  ImageGenerate = 16,
  ImageReference = 17,
  Question = 18,
  Break = 19,
  LoopSetVariable = 20,
  Loop = 21,
  Intent = 22,
  DrawingBoard = 23,
  SceneVariable = 24,
  SceneChat = 25,
  DatasetWrite = 27,
  Batch = 28,
  Continue = 29,
  Input = 30,
  AssignVariable = 40,
  DatabaseInsert = 41,
  DatabaseUpdate = 42,
  DatabasesELECT = 43,
  DatabaseDelete = 44,
}

/** 节点结构 */
export enum NodeType {
  Start = 1,
  End = 2,
  LLM = 3,
  Api = 4,
  Code = 5,
  Dataset = 6,
  If = 8,
  SubWorkflow = 9,
  Variable = 11,
  Database = 12,
  Message = 13,
  Text = 15,
  ImageGenerate = 16,
  ImageReference = 17,
  Question = 18,
  Break = 19,
  LoopSetVariable = 20,
  Loop = 21,
  Intent = 22,
  DrawingBoard = 23,
  SceneVariable = 24,
  SceneChat = 25,
  DatasetWrite = 27,
  Batch = 28,
  Continue = 29,
  Input = 30,
  AssignVariable = 40,
}

export enum OperateType {
  DraftOperate = 0,
  SubmitOperate = 1,
  PublishOperate = 2,
  PubPPEOperate = 3,
  SubmitPublishPPEOperate = 4,
}

export enum OrderBy {
  CreateTime = 0,
  UpdateTime = 1,
  PublishTime = 2,
  Hot = 3,
  Id = 4,
}

export enum OrderByType {
  Asc = 1,
  Desc = 2,
}

export enum ParameterLocation {
  Path = 1,
  Query = 2,
  Body = 3,
  Header = 4,
}

export enum ParameterType {
  String = 1,
  Integer = 2,
  Number = 3,
  Object = 4,
  Array = 5,
  Bool = 6,
}

export enum ParamRequirementType {
  CanNotDelete = 1,
  CanNotChangeName = 2,
  CanChange = 3,
  CanNotChangeAnything = 4,
}

export enum PermissionType {
  /** 不能查看详情 */
  NoDetail = 1,
  /** 可以查看详情 */
  Detail = 2,
  /** 可以查看和操作 */
  Operate = 3,
}

export enum PersistenceModel {
  DB = 1,
  VCS = 2,
  External = 3,
}

export enum PluginParamTypeFormat {
  ImageUrl = 1,
}

export enum PluginType {
  PLUGIN = 1,
  APP = 2,
  FUNC = 3,
  WORKFLOW = 4,
  IMAGEFLOW = 5,
  LOCAL = 6,
}

export enum PrincipalType {
  User = 1,
  Service = 2,
}

/** workflow 商品审核草稿状态 */
export enum ProductDraftStatus {
  /** 默认 */
  Default = 0,
  /** 审核中 */
  Pending = 1,
  /** 审核通过 */
  Approved = 2,
  /** 审核不通过 */
  Rejected = 3,
  /** 已废弃 */
  Abandoned = 4,
}

export enum ReqSource {
  /** 默认 */
  Default = 0,
  /** 商店服务 */
  Product = 1,
}

export enum ResourceType {
  Account = 1,
  Workspace = 2,
  App = 3,
  Bot = 4,
  Plugin = 5,
  Workflow = 6,
  Knowledge = 7,
  PersonalAccessToken = 8,
  Connector = 9,
  Card = 10,
  CardTemplate = 11,
  Conversation = 12,
  File = 13,
  ServicePrincipal = 14,
  Enterprise = 15,
}

export enum SchemaType {
  DAG = 0,
  FDL = 1,
  BlockWise = 2,
}

export enum SendVoiceMode {
  /** 文本消息 */
  text = 1,
  /** 发送为语音 */
  audio = 2,
}

export enum SuggestReplyInfoMode {
  /** 关闭 */
  Disable = 0,
  /** 系统 */
  System = 1,
  /** 自定义 */
  Custom = 2,
}

export enum SupportBatch {
  /** 1:不支持 */
  NOT_SUPPORT = 1,
  /** 2:支持 */
  SUPPORT = 2,
}

export enum Tag {
  All = 1,
  Hot = 2,
  Information = 3,
  Music = 4,
  Picture = 5,
  UtilityTool = 6,
  Life = 7,
  Traval = 8,
  Network = 9,
  System = 10,
  Movie = 11,
  Office = 12,
  Shopping = 13,
  Education = 14,
  Health = 15,
  Social = 16,
  Entertainment = 17,
  Finance = 18,
  Hidden = 100,
}

export enum TerminatePlanType {
  USELLM = 1,
  USESETTING = 2,
}

export enum UserBehaviorType {
  OpenCollaborators = 1,
  AddCollaborators = 2,
}

export enum UserLevel {
  Free = 0,
  PremiumLite = 10,
  Premium = 15,
  PremiumPlus = 20,
  V1ProInstance = 100,
  ProPersonal = 110,
  Team = 120,
  Enterprise = 130,
}

export enum ValidateErrorType {
  BotValidateNodeErr = 1,
  BotValidatePathErr = 2,
  BotConcurrentPathErr = 3,
}

export enum VCSCanvasType {
  Draft = 1,
  Submit = 2,
  Publish = 3,
}

/** 状态，1不可提交 2可提交  3已提交 4废弃 */
export enum WorkFlowDevStatus {
  CanNotSubmit = 1,
  CanSubmit = 2,
  HadSubmit = 3,
  Deleted = 4,
}

export enum WorkflowExecuteMode {
  TestRun = 1,
  Run = 2,
  NodeDebug = 3,
}

export enum WorkflowExeHistoryStatus {
  NoHistory = 1,
  HasHistory = 2,
}

export enum WorkflowExeStatus {
  Running = 1,
  Success = 2,
  Fail = 3,
  Cancel = 4,
}

export enum WorkFlowListStatus {
  UnPublished = 1,
  HadPublished = 2,
}

/** WorkflowMode 用来区分 Workflow 和 Imageflow */
export enum WorkflowMode {
  Workflow = 0,
  Imageflow = 1,
  SceneFlow = 2,
  ChatFlow = 3,
  All = 100,
}

export enum WorkflowRunMode {
  Sync = 0,
  Stream = 1,
  Async = 2,
}

export enum WorkflowSnapshotStatus {
  Canvas = 0,
  Published = 1,
}

/** 状态，1不可发布 2可发布  3已发布 4删除 5下架 */
export enum WorkFlowStatus {
  CanNotPublish = 1,
  CanPublish = 2,
  HadPublished = 3,
  Deleted = 4,
  Unlisted = 5,
}

export enum WorkflowStorageType {
  Library = 1,
  Project = 2,
}

export enum WorkFlowType {
  /** 用户自定义 */
  User = 0,
  /** 官方模板 */
  GuanFang = 1,
}

/** flow_mode */
export enum WorkflowUpdateEventType {
  UpdateUser = 1,
  UpdateSpace = 2,
}

export enum WorkflowVCSScriptType {
  Multiple = 1,
  Gray = 2,
  Space = 3,
}

export enum WorkflowVersionScriptType {
  Multiple = 1,
  All = 2,
}

export interface APIDetail {
  /** api的id */
  id?: string;
  name?: string;
  description?: string;
  parameters?: Array<APIParameter>;
  plugin_id?: string;
}

export interface ApiDetailData {
  pluginID?: string;
  apiName?: string;
  inputs?: unknown;
  outputs?: unknown;
  icon?: string;
  name?: string;
  desc?: string;
  pluginProductStatus?: Int64;
  pluginProductUnlistType?: Int64;
  spaceID?: string;
  debug_example?: DebugExample;
  updateTime?: Int64;
  projectID?: string;
  version?: string;
  pluginType?: PluginType;
  latest_version?: string;
  latest_version_name?: string;
  version_name?: string;
}

export interface APIParam {
  plugin_id?: string;
  api_id?: string;
  plugin_version?: string;
  plugin_name?: string;
  api_name?: string;
  out_doc_link?: string;
  tips?: string;
}

export interface APIParameter {
  /** for前端，无实际意义 */
  id?: string;
  name?: string;
  desc?: string;
  type?: ParameterType;
  sub_type?: ParameterType;
  location?: ParameterLocation;
  is_required?: boolean;
  sub_parameters?: Array<APIParameter>;
  global_default?: string;
  global_disable?: boolean;
  local_default?: string;
  local_disable?: boolean;
  format?: string;
  title?: string;
  enum_list?: Array<string>;
  value?: string;
  enum_var_names?: Array<string>;
  minimum?: number;
  maximum?: number;
  exclusive_minimum?: boolean;
  exclusive_maximum?: boolean;
  biz_extend?: string;
  /** 默认入参的设置来源 */
  default_param_source?: DefaultParamSource;
  /** 引用variable的key */
  variable_ref?: string;
  assist_type?: AssistParameterType;
}

export interface APIStruct {
  Name?: string;
  Type?: FieldType;
  Children?: Array<APIStruct>;
}

export interface AsyncConf {
  switch_status?: boolean;
  message?: string;
}

export interface AudioConfig {
  /** key为语言 "zh", "en" "ja" "es" "id" "pt" */
  voice_config_map?: Record<string, VoiceConfig>;
  /** 文本转语音开关 */
  is_text_to_voice_enable?: boolean;
  /** 智能体消息形式 */
  agent_message_type?: InputMode;
}

export interface AvatarConfig {
  image_uri?: string;
  image_url?: string;
}

export interface BackgroundImageDetail {
  /** 原始图片 */
  origin_image_uri?: string;
  origin_image_url?: string;
  /** 实际使用图片 */
  image_uri?: string;
  image_url?: string;
  theme_color?: string;
  /** 渐变位置 */
  gradient_position?: GradientPosition;
  /** 裁剪画布位置 */
  canvas_position?: CanvasPosition;
}

export interface BackgroundImageInfo {
  /** web端背景图 */
  web_background_image?: BackgroundImageDetail;
  /** 移动端背景图 */
  mobile_background_image?: BackgroundImageDetail;
}

export interface Batch {
  /** batch开关是否打开 */
  is_batch?: boolean;
  /** 只处理数组[0,take_count)范围的输入 */
  take_count?: Int64;
  /** 需要Batch的输入 */
  input_param?: Parameter;
}

export interface BatchDeleteProjectConversationRequest {
  project_id: string;
  space_id: string;
  /** 全部删除时，传 list 的全部 uniqueid */
  unique_id_list: Array<string>;
  /** 当前是否调试态 */
  draft_mode: boolean;
  /** 非调试态传递当前渠道 id */
  connector_id: string;
  Base?: base.Base;
}

export interface BatchDeleteProjectConversationResponse {
  Success?: boolean;
  BaseResp: base.BaseResp;
}

export interface BatchDeleteWorkflowRequest {
  workflow_id_list: Array<string>;
  space_id: string;
  action?: DeleteAction;
  Base?: base.Base;
}

export interface BatchDeleteWorkflowResponse {
  data: DeleteWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface BatchGetWkProcessIORequest {
  /** 传入的所有workflow_id要求是属于同一个space_id */
  workflow_params?: Array<GetWkProcessIOParam>;
  Base?: base.Base;
}

export interface BatchGetWkProcessIOResponse {
  in_out_data?: Array<WkProcessIOData>;
  code?: Int64;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface BotTemplateCopyWorkFlowData {
  WorkflowID?: Int64;
  SpaceID?: Int64;
  UserID?: Int64;
  PluginID?: Int64;
  WorkflowMode?: WorkflowMode;
}

export interface CallbackContent {
  /** 若ErrorCode非0非空，则Output为空 */
  Output?: string;
  /** 业务自定义数据 */
  Extra?: string;
  /** deprecated，仅部分存量接入业务需要使用 */
  ErrorCode?: string;
  /** deprecated，仅部分存量接入业务需要使用 */
  ErrorMsg?: string;
}

export interface CancelWorkFlowRequest {
  execute_id: string;
  space_id: string;
  workflow_id?: string;
  Base?: base.Base;
}

export interface CancelWorkFlowResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CanvasData {
  workflow?: Workflow;
  vcs_data?: VCSCanvasData;
  db_data?: DBCanvasData;
  operation_info?: OperationInfo;
  external_flow_info?: string;
  /** 是否绑定了Agent */
  is_bind_agent?: boolean;
  bind_biz_id?: string;
  bind_biz_type?: number;
  workflow_version?: string;
}

export interface CanvasPosition {
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

export interface CategoriedImageflowBasicNodes {
  nodes: Array<ImageflowBasicNode>;
  /** 分组信息 */
  category_i18n_key: string;
}

export interface ChatFlowRole {
  id?: string;
  workflow_id?: string;
  /** 渠道ID */
  connector_id?: string;
  /** 角色头像 */
  avatar?: AvatarConfig;
  /** 角色描述 */
  description?: string;
  /** 开场白 */
  onboarding_info?: OnboardingInfo;
  /** 角色名称 */
  name?: string;
  /** 用户问题建议 */
  suggest_reply_info?: SuggestReplyInfo;
  /** 背景图 */
  background_image_info?: BackgroundImageInfo;
  /** 语音配置：音色、电话等 */
  audio_config?: AudioConfig;
  /** 用户输入方式 */
  user_input_config?: UserInputConfig;
  /** 项目版本 */
  project_version?: string;
}

export interface ChatFlowRunRequest {
  workflow_id?: string;
  parameters?: string;
  ext?: Record<string, string>;
  bot_id?: string;
  /** 默认为正式运行，试运行需要传入"DEBUG" */
  execute_mode?: string;
  /** 版本号，可能是workflow版本或者project版本 */
  version?: string;
  /** 渠道ID，比如ui builder、template、商店等 */
  connector_id?: string;
  app_id?: string;
  /** 会话ID */
  conversation_id?: string;
  /** 用户希望先写入的消息 */
  additional_messages?: Array<EnterMessage>;
  /** 项目ID，为了兼容ui builder */
  project_id?: string;
  /** 建议回复信息 */
  suggest_reply_info?: SuggestReplyInfo;
}

export interface ChatFlowRunResponse {}

export interface CheckLatestSubmitVersionRequest {
  space_id: string;
  workflow_id: string;
  Base?: base.Base;
}

export interface CheckLatestSubmitVersionResponse {
  data: LatestSubmitData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CheckResult {
  /** 校验类型 */
  type?: CheckType;
  /** 是否通过 */
  is_pass?: boolean;
  /** 不通过原因 */
  reason?: string;
}

export interface CloseCollaboratorRequest {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface CloseCollaboratorResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CodeParam {
  code_snippet?: string;
}

export interface CollaboratorInfo {
  id?: string;
  name?: string;
  avatar_url?: string;
  user_name?: string;
}

export interface CompensationData {
  workflow?: Workflow;
  submit_commit_id?: string;
  draft_commit_id?: string;
}

export interface ConnectorInfo {
  id?: string;
  name?: string;
  icon?: string;
}

export interface ConversationData {
  id?: string;
  created_at?: Int64;
  meta_data?: Record<string, string>;
  creator_d?: string;
  connector_id?: string;
  last_section_id?: string;
}

export interface CopyWkTemplateApiRequest {
  /** 拷贝模板的所有父子workflow或者单个workflow集合 */
  workflow_ids: Array<string>;
  /** 拷贝的目标空间 */
  target_space_id: string;
  Base?: base.Base;
}

export interface CopyWkTemplateApiResponse {
  /** 模板ID：拷贝副本的数据 */
  data: Record<Int64, WkPluginBasicData>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CopyWorkflowData {
  workflow_id: string;
  schema_type: SchemaType;
}

export interface CopyWorkflowRequest {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface CopyWorkflowResponse {
  data: CopyWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CopyWorkflowV2Data {
  workflow_id: string;
  schema_type: SchemaType;
}

export interface CopyWorkflowV2Request {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface CopyWorkflowV2Response {
  code?: Int64;
  msg?: string;
  data?: CopyWorkflowV2Data;
  BaseResp: base.BaseResp;
}

export interface CozeProCopyWorkFlowData {
  WorkflowID?: Int64;
  SpaceID?: Int64;
  UserID?: Int64;
  PluginID?: Int64;
  WorkflowMode?: WorkflowMode;
}

export interface CreateChatFlowRoleRequest {
  chat_flow_role?: ChatFlowRole;
  Base?: base.Base;
}

export interface CreateChatFlowRoleResponse {
  /** 数据库中ID */
  ID?: string;
  BaseResp: base.BaseResp;
}

export interface CreateProjectConversationDefRequest {
  project_id: string;
  conversation_name: string;
  space_id: string;
  Base?: base.Base;
}

export interface CreateProjectConversationDefResponse {
  unique_id?: string;
  space_id: string;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CreateWorkflowData {
  workflow_id?: string;
  name?: string;
  url?: string;
  status?: WorkFlowStatus;
  type?: SchemaType;
  node_list?: Array<Node>;
  /** {"project_id":"xxx","flow_id":xxxx} */
  external_flow_info?: string;
}

export interface CreateWorkflowRequest {
  name: string;
  desc: string;
  icon_uri: string;
  space_id: string;
  /** workflow or imageflow or chatflow，默认值为workflow */
  flow_mode?: WorkflowMode;
  schema_type?: SchemaType;
  bind_biz_id?: string;
  bind_biz_type?: number;
  project_id?: string;
  create_conversation?: boolean;
  Base?: base.Base;
}

export interface CreateWorkflowResponse {
  data: CreateWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface CreateWorkflowV2Data {
  workflow_id?: string;
  name?: string;
  url?: string;
  status?: WorkFlowStatus;
  type?: SchemaType;
  node_list?: Array<Node>;
}

export interface CreateWorkflowV2Request {
  name: string;
  desc: string;
  icon_uri: string;
  space_id: string;
  /** workflow or imageflow，默认值为workflow */
  flow_mode?: WorkflowMode;
  bind_biz_id?: string;
  bind_biz_type?: number;
  Base?: base.Base;
}

export interface CreateWorkflowV2Response {
  data: CreateWorkflowV2Data;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface Creator {
  id?: string;
  name?: string;
  avatar_url?: string;
  /** 是否是自己创建的 */
  self?: boolean;
}

export interface DataCompensationRequest {
  space_id: string;
  workflow_id?: string;
  Base?: base.Base;
}

export interface DataCompensationResponse {
  data: CompensationData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface DatasetDetail {
  id?: string;
  icon_url?: string;
  name?: string;
  format_type?: Int64;
}

export interface DatasetFCItem {
  dataset_id?: string;
  is_draft?: boolean;
}

export interface DatasetParam {
  dataset_list?: Array<string>;
}

export interface DBCanvasData {
  status?: WorkFlowStatus;
}

export interface DebugExample {
  req_example?: string;
  resp_example?: string;
}

export interface DeleteChatFlowRoleRequest {
  WorkflowID?: string;
  ConnectorID?: string;
  /** 数据库中ID */
  ID?: string;
  Base?: base.Base;
}

export interface DeleteChatFlowRoleResponse {
  BaseResp: base.BaseResp;
}

export interface DeleteEnvRequest {
  workflow_id: string;
  space_id: string;
  env: string;
  Base?: base.Base;
}

export interface DeleteEnvResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface DeleteProjectConversationDefRequest {
  project_id: string;
  unique_id: string;
  /** 替换表，每个 wf 草稿分别替换成哪个, 未替换的情况下 success =false，replace 会返回待替换列表 */
  replace?: Record<string, string>;
  check_only?: boolean;
  space_id: string;
  Base?: base.Base;
}

export interface DeleteProjectConversationDefResponse {
  success?: boolean;
  /** 如果未传递 replacemap, 会失败，返回需要替换的 wf */
  need_replace?: Array<Workflow>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface DeleteWorkflowData {
  status?: DeleteStatus;
}

export interface DeleteWorkflowRequest {
  workflow_id: string;
  space_id: string;
  action?: DeleteAction;
  Base?: base.Base;
}

export interface DeleteWorkflowResponse {
  data: DeleteWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface DeleteWorkflowV2Data {
  status?: DeleteStatus;
}

export interface DeleteWorkflowV2Request {
  workflow_id: string;
  Base?: base.Base;
}

export interface DeleteWorkflowV2Response {
  data: DeleteWorkflowV2Data;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface Dependency {
  start_id?: string;
  sub_workflow_ids?: Array<string>;
  plugin_ids?: Array<string>;
  tools_id_map?: Record<string, Array<string>>;
  knowledge_list?: Array<KnowledgeInfo>;
  model_ids?: Array<string>;
  variable_names?: Array<string>;
  table_list?: Array<TableInfo>;
  voice_ids?: Array<string>;
  workflow_version?: Array<WorkflowVersionInfo>;
  plugin_version?: Array<PluginVersionInfo>;
}

export interface DependencyTree {
  root_id?: string;
  version?: string;
  node_list?: Array<DependencyTreeNode>;
  edge_list?: Array<DependencyTreeEdge>;
}

export interface DependencyTreeEdge {
  from?: string;
  from_version?: string;
  from_commit_id?: string;
  to?: string;
  to_version?: string;
}

export interface DependencyTreeNode {
  name?: string;
  id?: string;
  icon?: string;
  is_product?: boolean;
  is_root?: boolean;
  is_library?: boolean;
  with_version?: boolean;
  workflow_version?: string;
  dependency?: Dependency;
  commit_id?: string;
  fdl_commit_id?: string;
  flowlang_release_id?: string;
  is_chatflow?: boolean;
}

export interface DependencyTreeRequest {
  type: WorkflowStorageType;
  library_info?: LibraryWorkflowInfo;
  project_info?: ProjectWorkflowInfo;
  Base?: base.Base;
}

export interface DependencyTreeResponse {
  data?: DependencyTree;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface DiffContent {
  name_dif?: DiffContentMeta;
  describe_dif?: DiffContentMeta;
  icon_url_dif?: DiffContentMeta;
  schema_dif?: DiffContentMeta;
}

export interface DiffContentMeta {
  /** 修改前的内容 */
  before?: string;
  /** 前一个commitid */
  before_commit_id?: string;
  /** 修改后的内容 */
  after?: string;
  /** 后一个commitid */
  after_commit_id?: string;
  /** 当before ！= modify的时候 为ture ，否则为false ，当modify == false前端展示 diff 为 "-" */
  modify?: boolean;
}

export interface DiffType {
  name_type?: DiffTypeMeta;
  describe_type?: DiffTypeMeta;
  icon_url_type?: DiffTypeMeta;
  schema_type?: DiffTypeMeta;
}

export interface EncapsulateWorkflowData {
  workflow_id?: string;
  name?: string;
  url?: string;
  status?: WorkFlowStatus;
  type?: SchemaType;
  publish_data?: PublishWorkflowData;
  validate_data?: Array<ValidateErrorData>;
}

export interface EncapsulateWorkflowRequest {
  /** 创建workflow需要的参数 */
  name: string;
  desc: string;
  icon_uri: string;
  space_id: string;
  flow_mode?: WorkflowMode;
  schema_type?: SchemaType;
  bind_biz_id?: string;
  bind_biz_type?: number;
  project_id?: string;
  create_conversation?: boolean;
  /** 创建时直接填入的schema */
  schema?: string;
  /** 用于schema校验 */
  bind_bot_id?: string;
  /** 只校验，不创建workflow */
  only_validate?: boolean;
  Base?: base.Base;
}

export interface EncapsulateWorkflowResponse {
  data: EncapsulateWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface EnterMessage {
  role: string;
  /** 内容 */
  content?: string;
  meta_data?: Record<string, string>;
  /** text/card/object_string */
  content_type?: string;
  type?: string;
}

export interface EnvData {
  env?: string;
  desc?: string;
  commit_id?: string;
  source_commit_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  user?: UserInfo;
}

export interface Environment {
  lang?: string;
  latitude?: string;
  longitude?: string;
  bot_id?: string;
  conversation_id?: string;
  evaluate_request_tag?: string;
  mp_app_id?: string;
  execute_mod?: Int64;
  agent_id?: string;
  ref_bot_id?: string;
  auth_info?: string;
  user_extra?: string;
}

export interface EnvListData {
  env_list: Array<EnvData>;
  cursor?: string;
  has_more: boolean;
}

export interface ExternalDeleteEnvData {
  workflow_id: Int64;
  env: string;
}

export interface ExternalWorkflowPublishData {
  workflow_id: Int64;
  /** 使用哪个版本发布 */
  commit_id?: string;
  sub_workflow_list?: Array<Int64>;
  extra?: string;
  compile_commit_id?: string;
  /** 发布态的commit_id */
  publish_commit_id?: string;
  run_model?: ExeternalRunMode;
}

export interface FCDatasetSetting {
  dataset_id?: string;
}

export interface FCPluginSetting {
  plugin_id?: string;
  api_id?: string;
  api_name?: string;
  request_params?: Array<APIParameter>;
  response_params?: Array<APIParameter>;
  response_style?: ResponseStyle;
  /** 本期暂时不支持 */
  async_conf?: AsyncConf;
  is_draft?: boolean;
  plugin_version?: string;
}

export interface FCWorkflowSetting {
  workflow_id?: string;
  plugin_id?: string;
  request_params?: Array<APIParameter>;
  response_params?: Array<APIParameter>;
  response_style?: ResponseStyle;
  /** 本期暂时不支持 */
  async_conf?: AsyncConf;
  is_draft?: boolean;
  workflow_version?: string;
}

export interface GetApiDetailRequest {
  pluginID?: string;
  apiName?: string;
  space_id?: string;
  api_id?: string;
  project_id?: string;
  plugin_version?: string;
  Base?: base.Base;
}

export interface GetApiDetailResponse {
  code?: Int64;
  msg?: string;
  data?: ApiDetailData;
  BaseResp: base.BaseResp;
}

export interface GetBotsIDETokenRequest {
  space_id?: string;
  can_write?: boolean;
  Base?: base.Base;
}

export interface GetBotsIDETokenResponse {
  /** 提供给BizIDE侧的鉴权信息 */
  data: IDETokenData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetCanvasInfoRequest {
  space_id: string;
  workflow_id?: string;
  Base?: base.Base;
}

export interface GetCanvasInfoResponse {
  data: CanvasData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetChatFlowRoleRequest {
  workflow_id?: string;
  connector_id?: string;
  is_debug?: boolean;
  /** 4: optional string AppID (api.query = "app_id") */
  ext?: Record<string, string>;
  Base?: base.Base;
}

export interface GetChatFlowRoleResponse {
  role?: ChatFlowRole;
  BaseResp: base.BaseResp;
}

export interface GetConflictFromContentData {
  /** 前端需要消费submit_diff.after_commit_id用来作为merge的 source_submit_id */
  submit_diff?: DiffContent;
  draft_diff?: DiffContent;
  diff_type?: DiffType;
}

export interface GetConflictFromContentRequest {
  space_id: string;
  workflow_id: string;
  Base?: base.Base;
}

export interface GetConflictFromContentResponse {
  data: GetConflictFromContentData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetDeleteStrategyRequest {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface GetDeleteStrategyResponse {
  data: DeleteType;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetEnvListRequest {
  workflow_id: string;
  space_id: string;
  /** default = 10 */
  limit?: number;
  /** 多次分页的时候需要传入 */
  cursor?: string;
  Base?: base.Base;
}

export interface GetEnvListResponse {
  data: EnvListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetExampleWorkFlowListRequest {
  page?: number;
  size?: number;
  name?: string;
  flow_mode?: WorkflowMode;
  checker?: Array<CheckType>;
  Base?: base.Base;
}

export interface GetExampleWorkFlowListResponse {
  data: WorkFlowListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetExecuteHistoryListRequest {
  workflow_id?: string;
  execute_id?: string;
  execute_mode?: WorkflowExecuteMode;
  log_id?: string;
  start_time?: Int64;
  end_time?: Int64;
  page?: number;
  page_size?: number;
  Base?: base.Base;
}

export interface GetExecuteHistoryListResponse {
  data?: Array<OPExecuteHistory>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetHistorySchemaData {
  name?: string;
  describe?: string;
  url?: string;
  schema?: string;
  flow_mode?: WorkflowMode;
  bind_biz_id?: string;
  bind_biz_type?: BindBizType;
  workflow_id?: string;
  commit_id?: string;
  execute_id?: string;
  sub_execute_id?: string;
  log_id?: string;
}

export interface GetHistorySchemaRequest {
  space_id: string;
  workflow_id: string;
  /** 多次分页的时候需要传入 */
  commit_id: string;
  type: OperateType;
  env?: string;
  workflow_version?: string;
  project_version?: string;
  project_id?: string;
  execute_id?: string;
  sub_execute_id?: string;
  log_id?: string;
  Base?: base.Base;
}

export interface GetHistorySchemaResponse {
  data: GetHistorySchemaData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetImageflowBasicNodeListRequest {
  /** 侧边栏的tab类型，默认值为基础节点 */
  tab_type?: ImageflowTabType;
  Base?: base.Base;
}

export interface GetImageflowBasicNodeListResponse {
  data: ImageflowBasicNodeListData;
  code: Int64;
  msg: string;
  baseResp: base.BaseResp;
}

export interface GetListableWorkflowsRequest {
  space_id_list: Array<string>;
  page: number;
  size: number;
  /** 新增，workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  Base?: base.Base;
}

export interface GetListableWorkflowsResponse {
  data: ListableWorkflows;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetLLMNodeFCSettingDetailRequest {
  workflow_id: string;
  space_id: string;
  plugin_list?: Array<PluginFCItem>;
  workflow_list?: Array<WorkflowFCItem>;
  dataset_list?: Array<DatasetFCItem>;
  Base?: base.Base;
}

export interface GetLLMNodeFCSettingDetailResponse {
  /** pluginid -> value */
  plugin_detail_map?: Record<string, PluginDetail>;
  /** apiid -> value */
  plugin_api_detail_map?: Record<string, APIDetail>;
  /** workflowid-> value */
  workflow_detail_map?: Record<string, WorkflowDetail>;
  /** datasetid -> value */
  dataset_detail_map?: Record<string, DatasetDetail>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetLLMNodeFCSettingsMergedRequest {
  workflow_id: string;
  space_id: string;
  plugin_fc_setting?: FCPluginSetting;
  workflow_fc_setting?: FCWorkflowSetting;
  dataset_fc_setting?: FCDatasetSetting;
  Base?: base.Base;
}

export interface GetLLMNodeFCSettingsMergedResponse {
  plugin_fc_setting?: FCPluginSetting;
  worflow_fc_setting?: FCWorkflowSetting;
  dataset_fc_setting?: FCDatasetSetting;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetNodeExecuteHistoryRequest {
  workflow_id: string;
  space_id: string;
  execute_id: string;
  /** 节点id */
  node_id: string;
  /** 是否批次节点 */
  is_batch?: boolean;
  /** 执行批次 */
  batch_index?: number;
  node_type: string;
  node_history_scene?: NodeHistoryScene;
  Base?: base.Base;
}

export interface GetNodeExecuteHistoryResponse {
  code?: Int64;
  msg?: string;
  data?: NodeResult;
  BaseResp?: base.BaseResp;
}

export interface GetReleasedWorkflowsRequest {
  page?: number;
  size?: number;
  type?: WorkFlowType;
  name?: string;
  workflow_ids?: Array<string>;
  tags?: Tag;
  space_id?: string;
  order_by?: OrderBy;
  login_user_create?: boolean;
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  /** 过滤条件，支持workflow_id和workflow_version */
  workflow_filter_list?: Array<WorkflowFilter>;
  Base?: base.Base;
}

export interface GetReleasedWorkflowsResponse {
  data: ReleasedWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetStoreTestRunHistoryRequest {
  source_workflow_id?: string;
  execute_id?: string;
  Base?: base.Base;
}

export interface GetStoreTestRunHistoryResponse {
  data?: GetWorkFlowProcessData;
  code?: Int64;
  msg?: string;
  BaseResp?: base.BaseResp;
}

export interface GetUploadAuthTokenData {
  service_id?: string;
  upload_path_prefix?: string;
  auth?: UploadAuthTokenInfo;
  upload_host?: string;
}

export interface GetUploadAuthTokenRequest {
  /** 上传场景，可选值："imageflow" */
  scene?: string;
  Base?: base.Base;
}

export interface GetUploadAuthTokenResponse {
  data?: GetUploadAuthTokenData;
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface GetWkProcessIOParam {
  workflow_id: string;
  execute_id?: string;
  /** 指定拉取该commit_id的最近一次执行历史 */
  commit_id?: string;
}

export interface GetWorkflowDetailInfoRequest {
  /** 过滤条件，支持workflow_id和workflow_version */
  workflow_filter_list?: Array<WorkflowFilter>;
  space_id?: string;
  Base?: base.Base;
}

export interface GetWorkflowDetailInfoResponse {
  data: Array<WorkflowDetailInfoData>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetWorkflowDetailRequest {
  workflow_ids?: Array<string>;
  space_id?: string;
  Base?: base.Base;
}

export interface GetWorkflowDetailResponse {
  data: Array<WorkflowDetailData>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetWorkflowGrayFeatureRequest {
  /** 空间id */
  space_id?: string;
  Base?: base.Base;
}

export interface GetWorkflowGrayFeatureResponse {
  /** 灰度feature结果 */
  data?: Array<WorkflowGrayFeatureItem>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetWorkflowIDByExecuteInfoRequest {
  execute_id?: string;
  sub_execute_id?: string;
  log_id?: string;
  Base?: base.Base;
}

export interface GetWorkflowIDByExecuteInfoResponse {
  workflow_id?: string;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetWorkFlowListRequest {
  page?: number;
  size?: number;
  workflow_ids?: Array<string>;
  type?: WorkFlowType;
  name?: string;
  tags?: Tag;
  space_id?: string;
  status?: WorkFlowListStatus;
  order_by?: OrderBy;
  login_user_create?: boolean;
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  /** 新增字段，用于筛选schema_type */
  schema_type_list?: Array<SchemaType>;
  /** 项目ID */
  project_id?: string;
  checker?: Array<CheckType>;
  bind_biz_id?: string;
  bind_biz_type?: BindBizType;
  project_version?: string;
  Base?: base.Base;
}

export interface GetWorkFlowListResponse {
  data: WorkFlowListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetWorkflowMessageNodesData {
  id?: string;
  plugin_id?: string;
  name?: string;
  message_nodes?: Array<NodeInfo>;
}

export interface GetWorkflowMessageNodesRequest {
  /** 空间id */
  space_id?: string;
  plugin_id?: string;
  Base?: base.Base;
}

export interface GetWorkflowMessageNodesResponse {
  /** 返回码 */
  code?: Int64;
  /** 返回信息 */
  msg?: string;
  /** 结果 */
  data?: GetWorkflowMessageNodesData;
  BaseResp?: base.BaseResp;
}

export interface GetWorkFlowProcessData {
  workFlowId?: string;
  executeId?: string;
  executeStatus?: WorkflowExeStatus;
  nodeResults?: Array<NodeResult>;
  /** 执行进度 */
  rate?: string;
  /** 现节点试运行状态 1：没有试运行 2：试运行过 */
  exeHistoryStatus?: WorkflowExeHistoryStatus;
  /** workflow试运行耗时 */
  workflowExeCost?: string;
  /** 消耗 */
  tokenAndCost?: TokenAndCost;
  /** 失败原因 */
  reason?: string;
  /** 最后一个节点的ID */
  lastNodeID?: string;
  logID?: string;
  /** 只返回中断中的 event */
  nodeEvents?: Array<NodeEvent>;
  projectId?: string;
}

export interface GetWorkflowProcessRequest {
  workflow_id: string;
  space_id: string;
  execute_id?: string;
  /** 子流程的执行id */
  sub_execute_id?: string;
  /** 是否返回所有的batch节点内容 */
  need_async?: boolean;
  /** 未传execute_id时，可通过log_id取到execute_id */
  log_id?: string;
  node_id?: string;
  Base?: base.Base;
}

export interface GetWorkflowProcessResponse {
  code?: Int64;
  msg?: string;
  data?: GetWorkFlowProcessData;
  BaseResp: base.BaseResp;
}

export interface GetWorkflowReferencesRequest {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface GetWorkflowReferencesResponse {
  data: WorkflowReferencesData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface GetWorkflowRunHistoryRequest {
  workflow_id: string;
  execute_id?: string;
}

export interface GetWorkflowRunHistoryResponse {
  code?: Int64;
  msg?: string;
  data?: Array<WorkflowExecuteHistory>;
}

export interface GradientPosition {
  left?: number;
  right?: number;
}

export interface IDETokenData {
  /** 提供给BizIDE侧的临时token */
  token: string;
  /** token过期时间 */
  expired_at: Int64;
}

export interface IfBranch {
  /** 该分支的条件 */
  if_conditions?: Array<IfCondition>;
  /** 该分支各条件的关系 */
  if_condition_relation?: IfConditionRelation;
  /** 该分支对应的下一个节点 */
  next_node_id?: Array<string>;
}

export interface IfCondition {
  first_parameter: Parameter;
  condition: ConditionType;
  second_parameter: Parameter;
}

export interface IfParam {
  if_branch?: IfBranch;
  else_branch?: IfBranch;
}

export interface ImageflowBasicNode {
  /** 1: PluginAPI, 2: NodeTemplate */
  node_type: BasicNodeType;
  /** 返回的实际plugin api信息 */
  plugin_api?: ImageflowPluginAPINode;
  /** 基础节点模版，选择器、消息节点等 */
  node_template?: NodeTemplate;
}

export interface ImageflowBasicNodeListData {
  /** 基础节点列表 */
  categoried_nodes?: Array<CategoriedImageflowBasicNodes>;
}

export interface ImageflowPluginAPINode {
  plugin_id: string;
  plugin_name: string;
  api_id: string;
  api_name: string;
  api_title: string;
  api_desc: string;
  api_icon: string;
}

export interface Interrupt {
  event_id?: string;
  type?: InterruptType;
  data?: string;
}

export interface KnowledgeInfo {
  id?: string;
  name?: string;
  icon?: string;
  project_id?: string;
  is_product?: boolean;
  is_library?: boolean;
}

export interface LatestSubmitData {
  /** 当前草稿如果落后最新版本，则为true 否则为false */
  need_merge?: boolean;
  /** 当前空间最新版本 */
  latest_submit_version?: string;
  /** 当前最新版本的提交人，用于前端展示 */
  latest_submit_author?: string;
}

export interface LayOut {
  x?: number;
  y?: number;
}

export interface LibraryWorkflowInfo {
  workflow_id?: string;
  space_id?: string;
  draft?: boolean;
  workflow_version?: string;
}

export interface ListableWorkflows {
  workflows?: Array<WkPluginBasicData>;
  has_more?: boolean;
}

export interface ListCollaboratorsRequest {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface ListCollaboratorsResponse {
  data: Array<ResourceCollaboratorData>;
  need_data_compensation: boolean;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface ListProjectConversationRequest {
  project_id: string;
  /** 0=在project 创建（静态会话），1=通过 wf 节点创建（动态会话） */
  create_method?: CreateMethod;
  /** 0=wf 节点试运行创建的 1=wf 节点发布后运行的 */
  create_env?: CreateEnv;
  /** 分页偏移，不传从第一条开始 */
  cursor?: string;
  /** 一次拉取数量 */
  limit?: Int64;
  space_id: string;
  /** conversationName 模糊搜索 */
  nameLike?: string;
  /** create_env=1 时传递，传对应的渠道 id，当前默认 1024（openapi） */
  connector_id?: string;
  /** project版本 */
  project_version?: string;
  Base?: base.Base;
}

export interface ListProjectConversationResponse {
  data?: Array<ProjectConversation>;
  /** 游标，为空表示没有下一页了, 翻页时带上这个字段 */
  cursor?: string;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface ListPublishWorkflowRequest {
  space_id: string;
  /** 筛选项 */
  owner_id?: string;
  /** 搜索项：智能体or作者name */
  name?: string;
  order_last_publish_time?: OrderByType;
  order_total_token?: OrderByType;
  size: Int64;
  cursor_id?: string;
  workflow_ids?: Array<string>;
}

export interface ListPublishWorkflowResponse {
  data?: PublishWorkflowListData;
  code?: Int64;
  msg?: string;
}

export interface LLMParam {
  model_type?: number;
  temperature?: number;
  prompt?: string;
  model_name?: string;
}

export interface MergeWorkflowData {
  name?: string;
  url?: string;
  status?: WorkFlowDevStatus;
}

export interface MergeWorkflowRequest {
  workflow_id: string;
  schema?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  icon_uri?: string;
  submit_commit_id: string;
  Base?: base.Base;
}

export interface MergeWorkflowResponse {
  data: MergeWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface MoveWorkflowInfo {
  WorkflowId?: Int64;
  SpaceId?: Int64;
  Name?: string;
  Desc?: string;
  Url?: string;
  CreatorId?: Int64;
  PluginIds?: Array<Int64>;
  DataSetIds?: Array<Int64>;
  SubWorkflowIds?: Array<Int64>;
  Root?: boolean;
  IconUri?: string;
  ToolIds?: Array<Int64>;
  ModelIds?: Array<Int64>;
  DatabaseIDs?: Array<Int64>;
}

export interface MultiCollaborationConfigItem {
  workflow_count?: number;
  collaborators_count?: number;
}

export interface Node {
  workflow_id?: string;
  /** 节点id */
  node_id?: string;
  /** 更改node名称 */
  node_name?: string;
  /** 节点类型 */
  node_type?: NodeType;
  /** 节点的核心参数 */
  node_param?: NodeParam;
  /** Node的位置 */
  lay_out?: LayOut;
  /** Node的描述，说明链接 */
  desc?: NodeDesc;
  /** 依赖的上游节点 */
  depends_on?: Array<string>;
  /** 所有的输入和输出 */
  open_api?: OpenAPI;
}

export interface NodeCategory {
  /** 分类名，空字符串表示下面的节点不属于任何分类 */
  name?: string;
  node_type_list?: Array<string>;
  /** 插件的api_id列表 */
  plugin_api_id_list?: Array<string>;
  /** 跳转官方插件列表的分类配置 */
  plugin_category_id_list?: Array<string>;
}

export interface NodeDesc {
  desc?: string;
  /** 副标题名称 */
  name?: string;
  /** 该类型的icon */
  icon_url?: string;
  /** 是否支持批量，1不支持，2支持 */
  support_batch?: number;
  /** 连接要求 1左右都可连接 2只支持右侧 */
  link_limit?: number;
}

export interface NodeError {
  node_id?: string;
}

export interface NodeEvent {
  id?: string;
  type?: EventType;
  node_title?: string;
  data?: string;
  node_icon?: string;
  node_id?: string;
}

export interface NodeIdInfo {
  /** 节点id */
  NodeId?: string;
  /** 节点类型 */
  NodeType?: NodeType;
  /** 节点Param_id */
  NodeParamId?: Array<Int64>;
  /** 节点图标url */
  IconUrl?: string;
  /** workflow类型：判断子节点是工作流还是图像流 */
  FlowMode?: WorkflowMode;
  /** 节点名称 */
  NodeName?: string;
  /** 节点音色id */
  VoiceIds?: Array<string>;
  /** llm技能 */
  LLMSkill?: NodeLLMSkill;
}

export interface NodeInfo {
  node_id?: string;
  node_type?: string;
  node_title?: string;
}

export interface NodeLLMSkill {
  PluginIds?: Array<Int64>;
  DataSetIds?: Array<Int64>;
  SubWorkflowIds?: Array<Int64>;
}

export interface NodePanelPlugin {
  plugin_id?: string;
  name?: string;
  desc?: string;
  icon?: string;
  tool_list?: Array<NodePanelPluginAPI>;
  version?: string;
}

export interface NodePanelPluginAPI {
  api_id?: string;
  api_name?: string;
  api_desc?: string;
}

export interface NodePanelPluginData {
  plugin_list?: Array<NodePanelPlugin>;
  /** 数据源为page+size的，这里返回 page+1；数据源为cursor模式的，这里返回数据源返回的cursor */
  next_page_or_cursor?: string;
  has_more?: boolean;
}

export interface NodePanelSearchData {
  resource_workflow?: NodePanelWorkflowData;
  project_workflow?: NodePanelWorkflowData;
  favorite_plugin?: NodePanelPluginData;
  resource_plugin?: NodePanelPluginData;
  project_plugin?: NodePanelPluginData;
  store_plugin?: NodePanelPluginData;
}

export interface NodePanelSearchRequest {
  /** 搜索的数据类型，传空、不传或者传All表示搜索所有类型 */
  search_type?: NodePanelSearchType;
  space_id?: string;
  project_id?: string;
  search_key?: string;
  /** 首次请求时值为"", 底层实现时根据数据源的分页模式转换成page or cursor */
  page_or_cursor?: string;
  page_size?: number;
  /** 排除的workflow_id，用于搜索workflow时排除当前workflow的id */
  exclude_workflow_id?: string;
  Base?: base.Base;
}

export interface NodePanelSearchResponse {
  data?: NodePanelSearchData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface NodePanelWorkflowData {
  workflow_list?: Array<Workflow>;
  /** 由于workflow的查询使用都是page+size，这里返回 page+1 */
  next_page_or_cursor?: string;
  has_more?: boolean;
}

export interface NodeParam {
  /** 输入参数列表，支持多级；支持mapping */
  input_list?: Array<Param>;
  /** 输出参数列表，支持多级 */
  output_list?: Array<Param>;
  /** 如果是API类型的Node，插件名、API名、插件版本、API的描述 */
  api_param?: APIParam;
  /** 如果是代码片段，则包含代码内容 */
  code_param?: CodeParam;
  /** 如果是模型，则包含模型的基础信息 */
  llm_param?: LLMParam;
  /** 如果是数据集，选择数据集的片段 */
  dataset_param?: DatasetParam;
  /** end节点，如何结束 */
  terminate_plan?: TerminatePlan;
  /** （新）输入参数列表 */
  input_parameters?: Array<Parameter>;
  /** （新）输出参数列表 */
  output_parameters?: Array<Parameter>;
  /** 批量设置情况 */
  batch?: Batch;
  /** if节点参数 */
  if_param?: IfParam;
}

export interface NodeParamData {
  workflow_id?: Int64;
  node_type?: string;
  param_name?: string;
  param_value?: string;
}

export interface NodeParamRequest {
  node_type?: string;
  param_names?: Array<string>;
}

export interface NodeProps {
  id?: string;
  type?: string;
  is_enable_chat_history?: boolean;
  is_enable_user_query?: boolean;
  is_ref_global_variable?: boolean;
}

export interface NodeResult {
  nodeId?: string;
  NodeType?: string;
  NodeName?: string;
  nodeStatus?: NodeExeStatus;
  errorInfo?: string;
  /** 入参 jsonstring类型 */
  input?: string;
  /** 出参 jsonstring */
  output?: string;
  /** 运行耗时 eg：3s */
  nodeExeCost?: string;
  /** 消耗 */
  tokenAndCost?: TokenAndCost;
  /** 直接输出 */
  raw_output?: string;
  errorLevel?: string;
  index?: number;
  items?: string;
  maxBatchSize?: number;
  limitVariable?: string;
  loopVariableLen?: number;
  batch?: string;
  isBatch?: boolean;
  logVersion?: number;
  extra?: string;
  executeId?: string;
  subExecuteId?: string;
  needAsync?: boolean;
}

export interface NodeTemplate {
  id?: string;
  type?: NodeTemplateType;
  name?: string;
  desc?: string;
  icon_url?: string;
  support_batch?: SupportBatch;
  node_type?: string;
  color?: string;
}

export interface NodeTemplateListData {
  template_list?: Array<NodeTemplate>;
  /** 节点的展示分类配置 */
  cate_list?: Array<NodeCategory>;
  plugin_api_list?: Array<PluginAPINode>;
  plugin_category_list?: Array<PluginCategory>;
}

export interface NodeTemplateListRequest {
  /** 需要的节点类型 不传默认返回全部 */
  need_types?: Array<NodeTemplateType>;
  /** 需要的节点类型, string 类型 */
  node_types?: Array<string>;
  Base?: base.Base;
}

export interface NodeTemplateListResponse {
  data?: NodeTemplateListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface OnboardingInfo {
  /** markdown 格式 */
  prologue?: string;
  /** 问题列表 */
  suggested_questions?: Array<string>;
  /** 是否显示所有建议问题 */
  display_all_suggestions?: boolean;
}

export interface OpenAPI {
  input_list?: Array<Parameter>;
  output_list?: Array<Parameter>;
}

export interface OpenAPIGetWorkflowInfoRequest {
  workflow_id?: string;
  connector_id?: string;
  is_debug?: boolean;
  /** 4: optional string AppID (api.query = "app_id") */
  caller?: string;
}

export interface OpenAPIGetWorkflowInfoResponse {
  /** 适配api */
  code?: number;
  msg?: string;
  data?: WorkflowInfo;
}

export interface OpenAPIRunFlowRequest {
  workflow_id?: string;
  parameters?: string;
  ext?: Record<string, string>;
  bot_id?: string;
  is_async?: boolean;
  /** 默认为正式运行，试运行需要传入"DEBUG" */
  execute_mode?: string;
  /** 版本号，可能是workflow版本或者project版本 */
  version?: string;
  /** 渠道ID，比如ui builder、template、商店等 */
  connector_id?: string;
  /** 引用workflow 的应用ID */
  app_id?: string;
  /** 项目ID，为了兼容ui builder */
  project_id?: string;
}

export interface OpenAPIRunFlowResponse {
  /** 通用字段
调用结果 */
  code: Int64;
  /** 成功为success, 失败为简单的错误信息、 */
  msg?: string;
  /** 同步返回字段
执行结果，通常为json序列化字符串，也有可能是非json结构的字符串 */
  data?: string;
  token?: Int64;
  cost?: string;
  debug_url?: string;
  /** 异步返回字段 */
  execute_id?: string;
}

export interface OpenAPIStreamResumeFlowRequest {
  event_id?: string;
  interrupt_type?: InterruptType;
  resume_data?: string;
  ext?: Record<string, string>;
  workflow_id?: string;
  /** 渠道ID，比如ui builder、template、商店等 */
  connector_id?: string;
}

export interface OpenAPIStreamRunFlowResponse {
  /** 节点信息
节点中的序号 */
  node_seq_id?: string;
  /** 节点名称 */
  node_title?: string;
  /** ContentType为Text时的返回 */
  content?: string;
  /** 节点是否执行完成 */
  node_is_finish?: boolean;
  /** content type为interrupt时传输，中断协议 */
  interrupt_data?: Interrupt;
  /** 返回的数据类型 */
  content_type?: string;
  /** Content Type为Card时返回的卡片内容 */
  card_body?: string;
  /** 节点类型 */
  node_type?: string;
  node_id?: string;
  /** 成功时最后一条消息 */
  ext?: Record<string, string>;
  token?: Int64;
  cost?: string;
  /** 错误信息 */
  error_code?: Int64;
  error_message?: string;
  debug_url?: string;
}

export interface OpenCollaboratorRequest {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface OpenCollaboratorResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface OperateInfo {
  commit_id?: string;
  time?: Int64;
  user?: UserInfo;
}

export interface OperateListData {
  operate_list?: Array<OperateInfo>;
  start_id?: string;
  end_id?: string;
  has_more?: boolean;
}

export interface OperateListRequest {
  space_id: string;
  workflow_id: string;
  /** default = 10 */
  limit: number;
  /** 多次分页的时候需要传入 */
  last_commit_id: string;
  type: OperateType;
  Base?: base.Base;
}

export interface OperateListResponse {
  data: OperateListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface OperationInfo {
  operator?: Creator;
  operator_time?: Int64;
}

export interface OPExecuteHistory {
  execute_id?: string;
  workflow_id?: string;
  workflow_name?: string;
  execute_status?: WorkflowExeStatus;
  execute_mode?: WorkflowExecuteMode;
  run_mode?: WorkflowRunMode;
  bot_id?: string;
  log_id?: string;
  connector_id?: string;
  connector_uid?: string;
  commit_id?: string;
  project_id?: string;
  project_version?: string;
  workflow_version?: string;
  entry_method?: string;
  create_time?: Int64;
  update_time?: Int64;
  /** 执行成功 */
  input?: string;
  output?: string;
  /** 执行失败 */
  error_code?: string;
  error_msg?: string;
}

export interface Param {
  key?: Array<string>;
  desc?: string;
  type?: InputType;
  required?: boolean;
  value?: string;
  /** 要求  1不允许删除 2不允许更改名称 3什么都可修改 4只显示，全部不允许更改 */
  requirement?: ParamRequirementType;
  from_node_id?: string;
  from_output?: Array<string>;
}

export interface Parameter {
  name?: string;
  desc?: string;
  required?: boolean;
  type?: InputType;
  sub_parameters?: Array<Parameter>;
  /** 如果Type是数组，则有subtype */
  sub_type?: InputType;
  /** 如果入参的值是引用的则有fromNodeId */
  from_node_id?: string;
  /** 具体引用哪个节点的key */
  from_output?: Array<string>;
  /** 如果入参是用户手输 就放这里 */
  value?: string;
  format?: PluginParamTypeFormat;
  /** 辅助类型；type=string生效，0 为unset */
  assist_type?: Int64;
  /** 如果Type是数组，表示子元素的辅助类型；sub_type=string生效，0 为unset */
  sub_assist_type?: Int64;
}

export interface PathError {
  start?: string;
  end?: string;
  /** 路径上的节点ID */
  path?: Array<string>;
}

/** 插件配置 */
export interface PluginAPINode {
  /** 实际的插件配置 */
  plugin_id?: string;
  api_id?: string;
  api_name?: string;
  /** 用于节点展示 */
  name?: string;
  desc?: string;
  icon_url?: string;
  node_type?: string;
}

/** 查看更多图像插件 */
export interface PluginCategory {
  plugin_category_id?: string;
  only_official?: boolean;
  /** 用于节点展示 */
  name?: string;
  icon_url?: string;
  node_type?: string;
}

export interface PluginDetail {
  id?: string;
  icon_url?: string;
  description?: string;
  is_official?: boolean;
  name?: string;
  plugin_status?: Int64;
  plugin_type?: Int64;
  latest_version_ts?: Int64;
  latest_version_name?: string;
  version_name?: string;
}

export interface PluginFCItem {
  plugin_id?: string;
  api_id?: string;
  api_name?: string;
  is_draft?: boolean;
  plugin_version?: string;
}

export interface PluginTag {
  type?: Int64;
  name?: string;
  icon?: string;
  active_icon?: string;
}

export interface PluginVersionInfo {
  id?: string;
  name?: string;
  icon?: string;
  version?: string;
  tools?: Array<Int64>;
  project_id?: string;
  is_product?: boolean;
  is_library?: boolean;
}

export interface PrincipalIdentifier {
  /** 主体类型 */
  Type: PrincipalType;
  /** 主体Id */
  Id: string;
}

export interface ProjectConversation {
  unique_id?: string;
  conversation_name?: string;
  /** 对于自己在 coze 渠道的 conversationid */
  conversation_id?: string;
  release_conversation_name?: string;
}

export interface ProjectWorkflowInfo {
  workflow_id?: string;
  space_id?: string;
  project_id?: string;
  draft?: boolean;
  project_version?: string;
}

export interface PublishBasicWorkflowData {
  /** 最近发布项目的信息 */
  basic_info?: WorkflowBasicInfo;
  user_info?: UserInfo;
  /** 已发布渠道聚合 */
  connectors?: Array<ConnectorInfo>;
  /** 截止昨天总token消耗 */
  total_token?: string;
}

export interface PublishWorkflowData {
  workflow_id?: string;
  publish_commit_id?: string;
  success?: boolean;
}

export interface PublishWorkflowListData {
  workflows?: Array<PublishBasicWorkflowData>;
  total?: number;
  has_more?: boolean;
  next_cursor_id?: string;
}

export interface PublishWorkflowRequest {
  workflow_id: string;
  space_id: string;
  has_collaborator: boolean;
  /** 发布到哪个环境，不填默认线上 */
  env?: string;
  /** 使用哪个版本发布，不填默认最新提交版本 */
  commit_id?: string;
  /** 强制 */
  force?: boolean;
  /** 显示workflow的版本 */
  workflow_version?: string;
  /** workflow的版本描述 */
  version_description?: string;
  Base?: base.Base;
}

export interface PublishWorkflowResponse {
  data: PublishWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface PublishWorkflowV2Data {
  workflow_id?: string;
  commit_id?: string;
  success?: boolean;
}

export interface PublishWorkflowV2Request {
  workflow_id: string;
  space_id: string;
  Base?: base.Base;
}

export interface PublishWorkflowV2Response {
  code?: Int64;
  msg?: string;
  data: PublishWorkflowV2Data;
  BaseResp: base.BaseResp;
}

export interface PutOnListExampleWorkflowRequest {
  workflow_id: string;
  Base?: base.Base;
}

export interface PutOnListExampleWorkflowResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface QueryWorkflowNodeTypeRequest {
  space_id?: string;
  workflow_id?: string;
  Base?: base.Base;
}

export interface QueryWorkflowNodeTypeResponse {
  data?: WorkflowNodeTypeData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface QueryWorkflowV2Request {
  workflow_id: string;
  space_id?: string;
  Base?: base.Base;
}

export interface QueryWorkflowV2Response {
  data: WorkflowV2Data;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface RegionGrayRequest {
  /** 需要灰度的功能key */
  feature_key: string;
  Base?: base.Base;
}

export interface RegionGrayResponse {
  allow: boolean;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface ReleasedWorkflow {
  plugin_id?: string;
  workflow_id?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  icon?: string;
  inputs?: unknown;
  outputs?: unknown;
  end_type?: number;
  type?: number;
  sub_workflow_list?: Array<SubWorkflow>;
  version?: string;
  create_time?: Int64;
  update_time?: Int64;
  /** workflow创作者信息 */
  creator?: Creator;
  flow_mode?: WorkflowMode;
  flow_version?: string;
  flow_version_desc?: string;
  latest_flow_version?: string;
  latest_flow_version_desc?: string;
  commit_id?: string;
  output_nodes?: Array<NodeInfo>;
}

export interface ReleasedWorkflowData {
  workflow_list?: Array<ReleasedWorkflow>;
  total?: Int64;
}

export interface ReleasedWorkflowRPC {
  PluginID?: Int64;
  WorkflowID?: Int64;
  SpaceId?: Int64;
  Name?: string;
  Desc?: string;
  Icon?: string;
  Inputs?: string;
  Outputs?: string;
  EndType?: number;
  Type?: number;
  SubWorkflowIDList?: Array<SubWorkflow>;
  Version?: string;
  CreateTime?: Int64;
  UpdateTime?: Int64;
  CreatorId?: Int64;
  EndContent?: string;
  Schema?: string;
  FlowMode?: WorkflowMode;
}

export interface ReleasedWorkflowsData {
  Total?: Int64;
  Workflows?: Array<ReleasedWorkflowRPC>;
}

export interface RemoveExampleWorkflowRequest {
  workflow_id: string;
  Base?: base.Base;
}

export interface RemoveExampleWorkflowResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface ResourceActionAuth {
  can_edit?: boolean;
  can_delete?: boolean;
  can_copy?: boolean;
}

export interface ResourceAuthInfo {
  /** 资源id */
  workflow_id?: string;
  /** 用户id */
  user_id?: string;
  /** 用户资源操作权限 */
  auth?: ResourceActionAuth;
}

export interface ResourceCollaboratorData {
  user?: CollaboratorInfo;
  owner?: boolean;
}

export interface ResourceCreatorData {
  workflow_id: string;
  space_id?: string;
  creator?: Creator;
  collaborator_mode?: CollaboratorMode;
}

export interface ResponseStyle {
  mode?: number;
}

export interface ResumeFailedCallbackContent {
  CheckpointID?: Int64;
  /** 业务自定义数据 */
  Extra?: string;
  ErrorCode?: string;
  ErrorMsg?: string;
}

export interface RevertDraftData {
  submit_commit_id?: string;
}

export interface RevertDraftRequest {
  space_id: string;
  workflow_id: string;
  commit_id: string;
  type: OperateType;
  env?: string;
  Base?: base.Base;
}

export interface RevertDraftResponse {
  data: RevertDraftData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface RunCtx {
  SpaceID?: Int64;
  UserID?: Int64;
  HasCard?: boolean;
  HasCardNodes?: Array<string>;
  LinkRootID?: string;
  UserInfo?: UserInfoEnv;
  Env?: Environment;
  Ext?: Record<string, string>;
  ProjectID?: Int64;
  ProjectVersion?: string;
}

export interface RunFlowHTTPRequest {
  workflow_id: string;
  input?: Record<string, string>;
  space_id?: string;
  bot_id?: string;
}

export interface SaveWorkflowData {
  name?: string;
  url?: string;
  status?: WorkFlowDevStatus;
  workflow_status?: WorkFlowStatus;
}

export interface SaveWorkflowRequest {
  workflow_id: string;
  schema?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  icon_uri?: string;
  submit_commit_id: string;
  ignore_status_transfer?: boolean;
  save_version?: string;
  Base?: base.Base;
}

export interface SaveWorkflowResponse {
  data: SaveWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface SaveWorkflowV2Data {
  name?: string;
  url?: string;
  status?: WorkFlowStatus;
}

export interface SaveWorkflowV2Request {
  workflow_id: string;
  schema?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  icon_uri?: string;
  ignore_status_transfer?: boolean;
  Base?: base.Base;
}

export interface SaveWorkflowV2Response {
  data: SaveWorkflowV2Data;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface ShowDifferencesRequest {
  space_id: string;
  workflow_id: string;
  /** type */
  type: OperateType;
  Base?: base.Base;
}

export interface ShowDifferencesResponse {
  data: DiffContent;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface SignImageURLRequest {
  uri: string;
  Scene?: string;
  Base?: base.Base;
}

export interface SignImageURLResponse {
  url: string;
  code: Int64;
  msg: string;
  BaseResp?: base.BaseResp;
}

export interface Snapshot {
  WorkflowID?: string;
  SpaceID?: string;
  CommitID?: string;
  Branch?: VCSCanvasType;
  Schema?: string;
  Name?: string;
  Description?: string;
  IconURI?: string;
  UserInfo?: Creator;
  CreateTime?: Int64;
  UpdateTime?: Int64;
}

export interface StreamRunFlowHTTPResponse {
  /** 节点信息
节点中的序号 */
  node_seq_id?: string;
  node_id?: string;
  /** 节点名称 */
  node_title?: string;
  /** 节点类型 */
  node_type?: NodeType;
  /** ContentType为Text时的返回 */
  content?: string;
  /** 节点是否执行完成 */
  node_is_finish?: boolean;
  /** content type为interrupt时传输，中断协议 */
  interrupt_data?: Interrupt;
  /** 返回的数据类型 */
  content_type?: string;
  /** Content Type为Card时返回的卡片内容 */
  card_body?: string;
  /** 当前节点是否流式输出 */
  is_stream?: boolean;
  /** 当前节点所属的 workflow id */
  current_workflow_id?: string;
  /** 成功时最后一条消息 */
  ext?: Record<string, string>;
  token?: Int64;
  cost?: string;
  /** 错误信息 */
  error_code?: Int64;
  error_message?: string;
}

export interface SubmitWorkflowData {
  need_merge?: boolean;
  submit_commit_id?: string;
}

export interface SubmitWorkflowRequest {
  workflow_id: string;
  space_id: string;
  desc?: string;
  force?: boolean;
  Base?: base.Base;
}

export interface SubmitWorkflowResponse {
  data: SubmitWorkflowData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface SubWorkflow {
  id?: string;
  name?: string;
}

/** suggest */
export interface SuggestReplyInfo {
  /** 对应 Coze Auto-Suggestion
建议问题模型 */
  suggest_reply_mode?: SuggestReplyInfoMode;
  /** 用户自定义建议问题 */
  customized_suggest_prompt?: string;
}

export interface TableInfo {
  id?: string;
  name?: string;
  icon?: string;
  project_id?: string;
  is_product?: boolean;
  is_library?: boolean;
}

export interface TerminatePlan {
  /** 结束方式 */
  plan?: TerminatePlanType;
  content?: string;
}

export interface TokenAndCost {
  /** input消耗Token数 */
  inputTokens?: string;
  /** input花费 */
  inputCost?: string;
  /** Output消耗Token数 */
  outputTokens?: string;
  /** Output花费 */
  outputCost?: string;
  /** 总消耗Token数 */
  totalTokens?: string;
  /** 总花费 */
  totalCost?: string;
}

export interface UpdateCollaboratorInfo {
  /** 更新的目标空间 */
  UpdateWfMap?: Record<string, Array<Int64>>;
  /** 未获取到workflow的空间 */
  ErrSpaceList?: Array<Int64>;
  /** 未获取到协作者信息的workflow */
  ErrWorkflowMap?: Record<string, Array<Int64>>;
  BaseResp?: base.BaseResp;
}

export interface UpdateProjectConversationDefRequest {
  project_id: string;
  unique_id: string;
  conversation_name: string;
  space_id: string;
  Base?: base.Base;
}

export interface UpdateProjectConversationDefResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface UpdateWorkflowMetaRequest {
  workflow_id: string;
  space_id: string;
  name?: string;
  desc?: string;
  icon_uri?: string;
  flow_mode?: WorkflowMode;
  Base?: base.Base;
}

export interface UpdateWorkflowMetaResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface UploadAuthTokenInfo {
  access_key_id?: string;
  secret_access_key?: string;
  session_token?: string;
  expired_time?: string;
  current_time?: string;
}

export interface UserBehaviorAuthData {
  auth_type?: AuthType;
  config: MultiCollaborationConfigItem;
  can_upgrade: boolean;
  level?: UserLevel;
}

export interface UserBehaviorAuthRequest {
  workflow_id: string;
  space_id: string;
  action_type: UserBehaviorType;
  only_config_item: boolean;
  Base?: base.Base;
}

export interface UserBehaviorAuthResponse {
  data: UserBehaviorAuthData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface UserInfo {
  user_id?: Int64;
  user_name?: string;
  user_avatar?: string;
  /** 用户昵称 */
  nickname?: string;
}

export interface UserInfoEnv {
  user_id?: Int64;
  device_id?: Int64;
  message_id?: Int64;
  connector_name?: string;
  connector_uid?: string;
  connector_id?: Int64;
  tako_bot_history?: string;
  section_id?: Int64;
}

export interface UserInputConfig {
  /** 默认输入方式 */
  default_input_mode?: InputMode;
  /** 用户语音消息发送形式 */
  send_voice_mode?: SendVoiceMode;
}

export interface ValidateErrorData {
  node_error?: NodeError;
  path_error?: PathError;
  message?: string;
  type?: ValidateErrorType;
}

export interface ValidateSchemaRequest {
  schema: string;
  bind_project_id?: string;
  bind_bot_id?: string;
  Base?: base.Base;
}

export interface ValidateSchemaResponse {
  data?: Array<ValidateErrorData>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface ValidateTreeInfo {
  workflow_id?: string;
  name?: string;
  errors?: Array<ValidateErrorData>;
}

export interface ValidateTreeRequest {
  workflow_id: string;
  bind_project_id?: string;
  bind_bot_id?: string;
  schema?: string;
  Base?: base.Base;
}

export interface ValidateTreeResponse {
  data?: Array<ValidateTreeInfo>;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface VCSCanvasData {
  submit_commit_id?: string;
  draft_commit_id?: string;
  type?: VCSCanvasType;
  can_edit?: boolean;
  publish_commit_id?: string;
}

export interface VersionHistoryListData {
  version_list: Array<VersionMetaInfo>;
  cursor?: string;
  has_more: boolean;
}

export interface VersionHistoryListRequest {
  space_id: string;
  workflow_id: string;
  /** 1=submit 2=online 3=ppe */
  type: OperateType;
  /** default = 10 */
  limit?: number;
  /** 如果传了 做过滤 */
  commit_ids?: Array<string>;
  /** 多次分页的时候需要传入 */
  cursor?: string;
  Base?: base.Base;
}

export interface VersionHistoryListResponse {
  data: VersionHistoryListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface VersionMetaInfo {
  workflow_id?: string;
  space_id?: string;
  commit_id?: string;
  submit_commit_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  env?: string;
  desc?: string;
  user?: UserInfo;
  type?: OperateType;
  offline?: boolean;
  is_delete?: boolean;
  version?: string;
}

export interface VoiceConfig {
  voice_name?: string;
  /** 音色ID */
  voice_id?: string;
}

/** workflow快照基本信息 */
export interface WkPluginBasicData {
  workflow_id?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  url?: string;
  icon_uri?: string;
  status?: WorkFlowStatus;
  /** workfklow对应的插件id */
  plugin_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  source_id?: string;
  creator?: Creator;
  schema?: string;
  start_node?: Node;
  flow_mode?: WorkflowMode;
  sub_workflows?: Array<Int64>;
  latest_publish_commit_id?: string;
  end_node?: Node;
}

export interface WkPluginData {
  Workflow?: WkPluginBasicData;
  Nodes?: Array<NodeIdInfo>;
}

export interface WkPluginInfo {
  PluginId: Int64;
  WorkflowId: Int64;
}

export interface WkProcessIOData {
  workflow_id?: string;
  start_node?: Node;
  end_node?: Node;
  execute_id?: string;
  flow_mode?: WorkflowMode;
  input_data?: string;
  raw_output_data?: string;
  output_data?: string;
}

export interface Workflow {
  workflow_id?: string;
  name?: string;
  desc?: string;
  url?: string;
  icon_uri?: string;
  status?: WorkFlowDevStatus;
  /** 类型，1:官方模版 */
  type?: WorkFlowType;
  /** workfklow对应的插件id */
  plugin_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  schema_type?: SchemaType;
  start_node?: Node;
  tag?: Tag;
  /** 模版创作者id */
  template_author_id?: string;
  /** 模版创作者昵称 */
  template_author_name?: string;
  /** 模版创作者头像 */
  template_author_picture_url?: string;
  /** 空间id */
  space_id?: string;
  /** 流程出入参 */
  interface_str?: string;
  /** 新版workflow的定义 schema */
  schema_json?: string;
  /** workflow创作者信息 */
  creator?: Creator;
  /** 存储模型 */
  persistence_model?: PersistenceModel;
  /** workflow or imageflow，默认值为workflow */
  flow_mode?: WorkflowMode;
  /** workflow商品审核版本状态 */
  product_draft_status?: ProductDraftStatus;
  /** {"project_id":"xxx","flow_id":xxxx} */
  external_flow_info?: string;
  /** workflow多人协作按钮状态 */
  collaborator_mode?: CollaboratorMode;
  check_result?: Array<CheckResult>;
  project_id?: string;
  /** project 下的 workflow 才有 */
  dev_plugin_id?: string;
  save_version?: string;
}

export interface WorkflowBasicInfo {
  id?: string;
  name?: string;
  description?: string;
  icon_uri?: string;
  icon_url?: string;
  space_id?: string;
  owner_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  publish_time?: Int64;
  permission_type?: PermissionType;
}

export interface WorkflowChildNodes {
  WorkflowId?: Int64;
  CreatorId?: Int64;
  SpaceId?: Int64;
  PluginIds?: Array<Int64>;
  DataSetIds?: Array<Int64>;
  SubWorkflowIds?: Array<Int64>;
}

export interface WorkflowData {
  WorkflowId?: Int64;
  CreatorId?: Int64;
  SpaceId?: Int64;
  PluginIds?: Array<Int64>;
  DataSetIds?: Array<Int64>;
}

export interface WorkflowDependency {
  WorkflowId?: Int64;
  SpaceId?: Int64;
  Name?: string;
  Desc?: string;
  Url?: string;
  CreatorId?: Int64;
  PluginIds?: Array<Int64>;
  DataSetIds?: Array<Int64>;
  SubWorkflowIds?: Array<Int64>;
  Root?: boolean;
  IconUri?: string;
  ToolIds?: Array<Int64>;
  ModelIds?: Array<Int64>;
  DatabaseIds?: Array<Int64>;
  VoiceIds?: Array<string>;
  WorkflowMode?: WorkflowMode;
}

export interface WorkflowDetail {
  id?: string;
  plugin_id?: string;
  description?: string;
  icon_url?: string;
  is_official?: boolean;
  name?: string;
  status?: Int64;
  type?: Int64;
  api_detail?: APIDetail;
  latest_version_name?: string;
  flow_mode?: Int64;
}

export interface WorkflowDetailData {
  workflow_id?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  icon?: string;
  inputs?: unknown;
  outputs?: unknown;
  version?: string;
  create_time?: Int64;
  update_time?: Int64;
  project_id?: string;
  end_type?: number;
  icon_uri?: string;
  flow_mode?: WorkflowMode;
  output_nodes?: Array<NodeInfo>;
}

export interface WorkflowDetailInfoData {
  workflow_id?: string;
  space_id?: string;
  name?: string;
  desc?: string;
  icon?: string;
  inputs?: unknown;
  outputs?: unknown;
  version?: string;
  create_time?: Int64;
  update_time?: Int64;
  project_id?: string;
  end_type?: number;
  icon_uri?: string;
  flow_mode?: WorkflowMode;
  plugin_id?: string;
  /** workflow创作者信息 */
  creator?: Creator;
  flow_version?: string;
  flow_version_desc?: string;
  latest_flow_version?: string;
  latest_flow_version_desc?: string;
  commit_id?: string;
  is_project?: boolean;
}

export interface WorkflowExecuteHistory {
  execute_id?: Int64;
  execute_status?: string;
  bot_id?: Int64;
  connector_id?: Int64;
  connector_uid?: string;
  run_mode?: WorkflowRunMode;
  log_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  debug_url?: string;
  /** 执行成功 */
  input?: string;
  output?: string;
  token?: Int64;
  cost?: string;
  cost_unit?: string;
  ext?: Record<string, string>;
  /** 执行失败 */
  error_code?: string;
  error_msg?: string;
}

export interface WorkflowFCItem {
  workflow_id?: string;
  plugin_id?: string;
  is_draft?: boolean;
  workflow_version?: string;
}

/** Workflow 过滤条件 */
export interface WorkflowFilter {
  workflow_id?: string;
  workflow_version?: string;
}

export interface WorkflowGrayFeatureItem {
  /** 灰度feature */
  feature: string;
  /** 是否命中灰度featire。true-命中灰度，false-未命中灰度。 */
  in_gray: boolean;
}

export interface WorkflowInfo {
  role?: ChatFlowRole;
}

export interface WorkflowListByBindBizRequest {
  space_id?: string;
  bind_biz_id?: string;
  bind_biz_type?: number;
  status?: WorkFlowListStatus;
  login_user_create?: boolean;
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  Base?: base.Base;
}

export interface WorkflowListByBindBizResponse {
  data: WorkFlowListData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface WorkflowListByBindBizV2Request {
  space_id?: string;
  bind_biz_id?: string;
  bind_biz_type?: number;
  status?: WorkFlowListStatus;
  login_user_create?: boolean;
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  Base?: base.Base;
}

export interface WorkflowListByBindBizV2Response {
  data: WorkflowListV2Data;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface WorkFlowListData {
  workflow_list?: Array<Workflow>;
  auth_list?: Array<ResourceAuthInfo>;
  total?: Int64;
}

export interface WorkflowListV2Data {
  workflow_list?: Array<WorkflowV2>;
  total?: Int64;
}

export interface WorkflowListV2Request {
  page?: number;
  size?: number;
  workflow_ids?: Array<string>;
  type?: WorkFlowType;
  name?: string;
  tags?: Tag;
  space_id?: string;
  status?: WorkFlowListStatus;
  order_by?: OrderBy;
  login_user_create?: boolean;
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  Base?: base.Base;
}

export interface WorkflowListV2Response {
  data: WorkflowListV2Data;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface WorkflowNodeDebugV2Data {
  workflow_id?: string;
  node_id?: string;
  execute_id?: string;
  session_id?: string;
}

export interface WorkflowNodeDebugV2Request {
  workflow_id?: string;
  node_id?: string;
  input?: Record<string, string>;
  batch?: Record<string, string>;
  space_id?: string;
  bot_id?: string;
  project_id?: string;
  setting?: Record<string, string>;
  Base?: base.Base;
}

export interface WorkflowNodeDebugV2Response {
  code?: Int64;
  msg?: string;
  data?: WorkflowNodeDebugV2Data;
  BaseResp?: base.BaseResp;
}

export interface WorkflowNodeTypeData {
  node_types?: Array<string>;
  sub_workflow_node_types?: Array<string>;
  nodes_properties?: Array<NodeProps>;
  sub_workflow_nodes_properties?: Array<NodeProps>;
}

export interface WorkflowNodeV2 {
  WorkflowID?: string;
  NodeID?: Int64;
  Name?: string;
  Desc?: string;
  CreateTime?: Int64;
  UpdateTime?: Int64;
  CreatorId?: string;
  AuthorId?: string;
  SpaceId?: string;
  Schema?: string;
}

export interface WorkflowNodeV2Data {
  WorkflowNode?: Record<Int64, WorkflowNodeV2>;
}

export interface WorkflowReferencesData {
  workflow_list?: Array<Workflow>;
}

export interface WorkflowRuntimeInfo {
  WorkflowID?: Int64;
  name?: string;
  desc?: string;
  /** plugin api parameter 结构，序列化为 json string */
  input?: string;
  /** plugin api parameter 结构，序列化为 json string */
  output?: string;
  runMode?: Int64;
}

export interface WorkFlowTemplateTagData {
  tags: Array<PluginTag>;
}

export interface WorkFlowTemplateTagRequest {
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  Base?: base.Base;
}

export interface WorkFlowTemplateTagResponse {
  data?: WorkFlowTemplateTagData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface WorkflowTestResumeRequest {
  workflow_id: string;
  execute_id: string;
  event_id: string;
  data: string;
  space_id?: string;
  Base?: base.Base;
}

export interface WorkflowTestResumeResponse {
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface WorkFlowTestRunData {
  workflow_id?: string;
  execute_id?: string;
  session_id?: string;
}

export interface WorkFlowTestRunDataV2 {
  workflow_id?: string;
  execute_id?: string;
  session_id?: string;
}

export interface WorkFlowTestRunRequest {
  workflow_id: string;
  input?: Record<string, string>;
  space_id?: string;
  bot_id?: string;
  /** 废弃 */
  submit_commit_id?: string;
  /** 指定vcs commit_id */
  commit_id?: string;
  project_id?: string;
  Base?: base.Base;
}

export interface WorkFlowTestRunResponse {
  data: WorkFlowTestRunData;
  code: Int64;
  msg: string;
  BaseResp: base.BaseResp;
}

export interface WorkFlowTestRunV2Request {
  workflow_id?: string;
  input?: Record<string, string>;
  space_id?: string;
  bot_id?: string;
  Base?: base.Base;
}

export interface WorkFlowTestRunV2Response {
  code?: Int64;
  msg?: string;
  data?: WorkFlowTestRunDataV2;
  BaseResp: base.BaseResp;
}

export interface WorkflowV2 {
  workflow_id?: string;
  name?: string;
  desc?: string;
  url?: string;
  icon_uri?: string;
  status?: WorkFlowStatus;
  /** 类型，1:官方模版 */
  type?: WorkFlowType;
  /** workfklow对应的插件id */
  plugin_id?: string;
  create_time?: Int64;
  update_time?: Int64;
  schema_type?: SchemaType;
  start_node?: Node;
  tag?: Tag;
  /** 模版创作者id */
  template_author_id?: string;
  /** 模版创作者昵称 */
  template_author_name?: string;
  /** 模版创作者头像 */
  template_author_picture_url?: string;
  /** 空间id */
  space_id?: string;
  /** 流程出入参 */
  interface_str?: string;
  /** 新版workflow的定义 schema */
  schema_json?: string;
  /** workflow创作者信息 */
  creator?: Creator;
  /** workflow or imageflow, 默认为workflow */
  flow_mode?: WorkflowMode;
  /** workflow商品审核版本状态 */
  product_draft_status?: ProductDraftStatus;
  project_id?: string;
  /** dev插件id */
  dev_plugin_id?: string;
}

export interface WorkflowV2Data {
  workflow?: WorkflowV2;
  /** 是否绑定了Agent */
  is_bind_agent?: boolean;
  /** 生成的兼容commit_id，如果请求的是publish态的 */
  publish_commit_id?: string;
  bind_biz_id?: string;
  bind_biz_type?: number;
}

export interface WorkflowVersionInfo {
  id?: string;
  name?: string;
  icon?: string;
  version?: string;
  project_id?: string;
  is_product?: boolean;
  is_library?: boolean;
}
/* eslint-enable */
