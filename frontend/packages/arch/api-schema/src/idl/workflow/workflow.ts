/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as base from './../base';
export { base };
export enum PersistenceModel {
  DB = 1,
  VCS = 2,
  External = 3,
}
/** WorkflowMode is used to distinguish between Workflow and chatflow. */
export enum WorkflowMode {
  Workflow = 0,
  Imageflow = 1,
  SceneFlow = 2,
  ChatFlow = 3,
  /** Use only when querying */
  All = 100,
}
/** Workflow Product Review Draft Status */
export enum ProductDraftStatus {
  /** default */
  Default = 0,
  /** Under review. */
  Pending = 1,
  /** approved */
  Approved = 2,
  /** The review failed. */
  Rejected = 3,
  /** Abandoned */
  Abandoned = 4,
}
export enum CollaboratorMode {
  /** Turn off multiplayer collaboration mode */
  Close = 0,
  /** Enable multiplayer collaboration mode */
  Open = 1,
}
export interface Workflow {
  workflow_id: string,
  name: string,
  desc: string,
  url: string,
  icon_uri: string,
  status: WorkFlowDevStatus,
  /** Type 1: Official Template */
  type: WorkFlowType,
  /** Plugin ID for workflow */
  plugin_id: string,
  create_time: number,
  update_time: number,
  schema_type: SchemaType,
  start_node?: Node,
  tag?: Tag,
  /** template creator id */
  template_author_id?: string,
  /** template creator nickname */
  template_author_name?: string,
  /** template creator avatar */
  template_author_picture_url?: string,
  /** Space ID */
  space_id?: string,
  /** process entry and exit */
  interface_str?: string,
  /** New workflow definition schema */
  schema_json?: string,
  /** Workflow creator information */
  creator: Creator,
  /** Storage Model */
  persistence_model: PersistenceModel,
  /** Workflow or imageflow, the default is workflow */
  flow_mode: WorkflowMode,
  /** Workflow product review version status */
  product_draft_status: ProductDraftStatus,
  /** {"project_id":"xxx","flow_id":xxxx} */
  external_flow_info?: string,
  /** Workflow Multiplayer Collaboration Button Status */
  collaborator_mode: CollaboratorMode,
  check_result: CheckResult[],
  project_id?: string,
  /** Only the workflow under the project is available. */
  dev_plugin_id?: string,
}
export interface CheckResult {
  /** check type */
  type: CheckType,
  /** Whether to pass */
  is_pass: boolean,
  /** Reason for not passing */
  reason: string,
}
export interface Creator {
  id: string,
  name: string,
  avatar_url: string,
  /** Did you create it yourself? */
  self: boolean,
}
export enum SchemaType {
  /** abandoned */
  DAG = 0,
  FDL = 1,
  /** abandoned */
  BlockWise = 2,
}
export enum WorkFlowType {
  /** user defined */
  User = 0,
  /** official template */
  GuanFang = 1,
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
/** Node structure */
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
  Input = 30,
  Batch = 28,
  Continue = 29,
  AssignVariable = 40,
  JsonSerialization = 58,
  JsonDeserialization = 59,
  DatasetDelete = 60,
  CardSelector = 99,
}
/** The node template type is basically the same as NodeType. One copy is due to the addition of an Imageflow type to avoid affecting the business semantics of the original NodeType */
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
  Input = 30,
  Batch = 28,
  Continue = 29,
  AssignVariable = 40,
  DatabaseInsert = 41,
  DatabaseUpdate = 42,
  DatabasesELECT = 43,
  DatabaseDelete = 44,
  JsonSerialization = 58,
  JsonDeserialization = 59,
  DatasetDelete = 60,
  CardSelector = 99,
}
export enum IfConditionRelation {
  And = 1,
  Or = 2,
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
export enum InputType {
  String = 1,
  Integer = 2,
  Boolean = 3,
  Number = 4,
  Array = 5,
  Object = 6,
}
export enum ParamRequirementType {
  CanNotDelete = 1,
  CanNotChangeName = 2,
  CanChange = 3,
  CanNotChangeAnything = 4,
}
export interface Param {
  key: string[],
  desc: string,
  type: InputType,
  required: boolean,
  value: string,
  /** Requirements 1 Do not allow deletion 2 Do not allow name change 3 Anything can be modified 4 Only display, all are not allowed to be changed */
  requirement: ParamRequirementType,
  from_node_id?: string,
  from_output?: string[],
}
export interface APIParam {
  plugin_id: string,
  api_id: string,
  plugin_version: string,
  plugin_name: string,
  api_name: string,
  out_doc_link: string,
  tips: string,
}
export interface CodeParam {
  code_snippet: string
}
export interface LLMParam {
  model_type: number,
  temperature: number,
  prompt: string,
  model_name: string,
}
export interface DatasetParam {
  dataset_list: string[]
}
export interface IfParam {
  if_branch?: IfBranch,
  else_branch?: IfBranch,
}
export interface IfBranch {
  /** Conditions for this branch */
  if_conditions?: IfCondition[],
  /** The relationship between the conditions of this branch */
  if_condition_relation?: IfConditionRelation,
  /** The next node corresponding to this branch */
  next_node_id?: string[],
}
export interface IfCondition {
  first_parameter: Parameter,
  condition: ConditionType,
  second_parameter: Parameter,
}
export interface LayOut {
  x: number,
  y: number,
}
export enum TerminatePlanType {
  USELLM = 1,
  USESETTING = 2,
}
export interface TerminatePlan {
  /** End method */
  plan: TerminatePlanType,
  content: string,
}
export interface NodeParam {
  /** Enter parameter list, support multi-level; support mapping */
  input_list?: Param[],
  /** Output parameter list, support multi-level */
  output_list?: Param[],
  /** If it is an API type Node, plug-in name, API name, plug-in version, API description */
  api_param?: APIParam,
  /** If it is a code snippet, include the code content */
  code_param?: CodeParam,
  /** If it is a model, include the basic information of the model */
  llm_param?: LLMParam,
  /** If it is a dataset, select a fragment of the dataset */
  dataset_param?: DatasetParam,
  /** End node, how to end */
  terminate_plan?: TerminatePlan,
  /** (New) input parameter list */
  input_parameters?: Parameter[],
  /** (New) Output parameter list */
  output_parameters?: Parameter[],
  /** batch setup */
  batch?: Batch,
  /** if node parameter */
  if_param?: IfParam,
}
export interface NodeDesc {
  desc: string,
  /** Subtitle name */
  name: string,
  /** This type of icon */
  icon_url: string,
  /** Whether to support batch, 1 does not support, 2 supports */
  support_batch: number,
  /** Connection requirements 1 or so can be connected 2 only support the right side */
  link_limit: number,
}
export interface OpenAPI {
  input_list: Parameter[],
  output_list: Parameter[],
}
export interface Batch {
  /** Is the batch switch on? */
  is_batch: boolean,
  /** Only process input in the range [0, take_count) */
  take_count: number,
  /** Batch input required */
  input_param: Parameter,
}
export interface Node {
  workflow_id: string,
  /** Node ID */
  node_id: string,
  /** Change node name */
  node_name: string,
  /** Node type */
  node_type: NodeType,
  /** Core parameters of the node */
  node_param: NodeParam,
  /** Node location */
  lay_out: LayOut,
  /** Description of Node, explaining the link */
  desc: NodeDesc,
  /** dependent upstream node */
  depends_on: string[],
  /** All inputs and outputs */
  open_api: OpenAPI,
}
export enum SupportBatch {
  /** 1: Not supported */
  NOT_SUPPORT = 1,
  /** 2: Support */
  SUPPORT = 2,
}
export enum PluginParamTypeFormat {
  ImageUrl = 1,
}
export interface Parameter {
  name: string,
  desc: string,
  required: boolean,
  type: InputType,
  sub_parameters: Parameter[],
  /** If Type is an array, there is a subtype */
  sub_type: InputType,
  /** fromNodeId if the value of the imported parameter is a reference */
  from_node_id?: string,
  /** Which node's key is specifically referenced? */
  from_output?: string[],
  /** If the imported parameter is the user's hand input, put it here */
  value?: string,
  format?: PluginParamTypeFormat,
  /** Auxiliary type; type = string takes effect, 0 is unset */
  assist_type?: number,
  /** If Type is an array, it represents the auxiliary type of the child element; sub_type = string takes effect, 0 is unset */
  sub_assist_type?: number,
}
/** Status, 1 Not Submitted 2 Submitted 3 Submitted 4 Obsolete */
export enum WorkFlowDevStatus {
  /** unsubmittable */
  CanNotSubmit = 1,
  /** submittable */
  CanSubmit = 2,
  /** Submitted */
  HadSubmit = 3,
  /** delete */
  Deleted = 4,
}
/** Status, 1 Unpublishable 2 Publishable 3 Published 4 Deleted 5 Removed */
export enum WorkFlowStatus {
  /** unpublishable */
  CanNotPublish = 1,
  /** publishable */
  CanPublish = 2,
  /** Published */
  HadPublished = 3,
  /** delete */
  Deleted = 4,
  /** offline */
  Unlisted = 5,
}
export interface CreateWorkflowRequest {
  /** process name */
  name: string,
  /** Process description, not null */
  desc: string,
  /** Process icon uri, not nullable */
  icon_uri: string,
  /** Space id, cannot be empty */
  space_id: string,
  /** Workflow or chatflow, the default is workflow */
  flow_mode?: WorkflowMode,
  schema_type?: SchemaType,
  bind_biz_id?: string,
  /** Bind the business type, do not fill in if necessary. Refer to the BindBizType structure, when the value is 3, it represents the Douyin doppelganger. */
  bind_biz_type?: number,
  /** Application id, when filled in, it means that the process is the process under the project, and it needs to be released with the project. */
  project_id?: string,
  /** Whether to create a session, only if flow_mode = chatflow */
  create_conversation?: boolean,
}
export interface CreateWorkflowData {
  /** The ID of the process, used to identify a unique process */
  workflow_id: string,
  /** process name */
  name: string,
  url: string,
  status: WorkFlowStatus,
  type: SchemaType,
  node_list: Node[],
  /** {"project_id":"xxx","flow_id":xxxx} */
  external_flow_info?: string,
}
export interface CreateWorkflowResponse {
  data: CreateWorkflowData,
  code: number,
  msg: string,
}
export interface SaveWorkflowRequest {
  /** The ID of the process, used to identify a unique process */
  workflow_id: string,
  /** Process schema */
  schema?: string,
  /** Required, space id, not nullable */
  space_id?: string,
  name?: string,
  desc?: string,
  icon_uri?: string,
  /** The commit_id of a commit. This is used to uniquely identify individual commit versions of a process (each commit_id corresponds only and only to one commit version of a process). */
  submit_commit_id: string,
  ignore_status_transfer?: boolean,
}
export interface SaveWorkflowData {
  name: string,
  url: string,
  status: WorkFlowDevStatus,
  workflow_status: WorkFlowStatus,
}
export interface SaveWorkflowResponse {
  data: SaveWorkflowData,
  code: number,
  msg: string,
}
export interface UpdateWorkflowMetaRequest {
  workflow_id: string,
  space_id: string,
  name?: string,
  desc?: string,
  icon_uri?: string,
  flow_mode?: WorkflowMode,
}
export interface UpdateWorkflowMetaResponse {
  code: number,
  msg: string,
}
export interface MergeWorkflowRequest {
  workflow_id: string,
  schema?: string,
  space_id?: string,
  name?: string,
  desc?: string,
  icon_uri?: string,
  submit_commit_id: string,
}
export interface MergeWorkflowData {
  name: string,
  url: string,
  status: WorkFlowDevStatus,
}
export interface MergeWorkflowResponse {
  data: MergeWorkflowData,
  code: number,
  msg: string,
}
export enum VCSCanvasType {
  Draft = 1,
  Submit = 2,
  Publish = 3,
}
export interface VCSCanvasData {
  submit_commit_id: string,
  draft_commit_id: string,
  type: VCSCanvasType,
  can_edit: boolean,
  publish_commit_id?: string,
}
export interface DBCanvasData {
  status: WorkFlowStatus
}
export interface OperationInfo {
  operator: Creator,
  operator_time: number,
}
export interface CanvasData {
  workflow: Workflow,
  vcs_data: VCSCanvasData,
  db_data: DBCanvasData,
  operation_info: OperationInfo,
  external_flow_info?: string,
  /** Is the Agent bound? */
  is_bind_agent?: boolean,
  bind_biz_id?: string,
  bind_biz_type?: number,
  workflow_version?: string,
}
export interface GetCanvasInfoRequest {
  /** Space id, cannot be empty */
  space_id: string,
  /** Required, process id, not null */
  workflow_id?: string,
}
export interface GetCanvasInfoResponse {
  data: CanvasData,
  code: number,
  msg: string,
}
export enum OperateType {
  DraftOperate = 0,
  SubmitOperate = 1,
  PublishOperate = 2,
  PubPPEOperate = 3,
  SubmitPublishPPEOperate = 4,
}
export interface GetHistorySchemaRequest {
  space_id: string,
  workflow_id: string,
  /** You need to pass in when paging multiple times. */
  commit_id?: string,
  type: OperateType,
  env?: string,
  workflow_version?: string,
  project_version?: string,
  project_id?: string,
  execute_id?: string,
  sub_execute_id?: string,
  log_id?: string,
}
export interface GetHistorySchemaData {
  name: string,
  describe: string,
  url: string,
  schema: string,
  flow_mode: WorkflowMode,
  bind_biz_id?: string,
  bind_biz_type?: BindBizType,
  workflow_id: string,
  commit_id: string,
  execute_id?: string,
  sub_execute_id?: string,
  log_id?: string,
}
export interface GetHistorySchemaResponse {
  data: GetHistorySchemaData,
  code: number,
  msg: string,
}
export enum DeleteAction {
  /** Blockwise Unbinding */
  BlockwiseUnbind = 1,
  /** Blockwise removal */
  BlockwiseDelete = 2,
}
export interface DeleteWorkflowRequest {
  workflow_id: string,
  space_id: string,
  action?: DeleteAction,
}
export enum DeleteStatus {
  SUCCESS = 0,
  FAIL = 1,
}
export interface DeleteWorkflowData {
  status: DeleteStatus
}
export interface DeleteWorkflowResponse {
  data: DeleteWorkflowData,
  code: number,
  msg: string,
}
export interface BatchDeleteWorkflowResponse {
  data: DeleteWorkflowData,
  code: number,
  msg: string,
}
export interface BatchDeleteWorkflowRequest {
  workflow_id_list: string[],
  space_id: string,
  action?: DeleteAction,
}
export interface GetDeleteStrategyRequest {
  workflow_id: string,
  space_id: string,
}
export interface GetDeleteStrategyResponse {
  data: DeleteType,
  code: number,
  msg: string,
}
export enum DeleteType {
  /** Can be deleted: No workflow product/product removed from the shelves/first time on the shelves and the review failed */
  CanDelete = 0,
  /** Review failed after deletion: The workflow product is on the shelves for the first time and is under review. */
  RejectProductDraft = 1,
  /** Products that need to be removed from the shelves first: workflow products have been put on the shelves. */
  UnListProduct = 2,
}
export interface PublishWorkflowRequest {
  workflow_id: string,
  space_id: string,
  has_collaborator: boolean,
  /** Which environment to publish to, do not fill in the default line */
  env?: string,
  /** Which version to use to release, do not fill in the default latest commit version */
  commit_id?: string,
  /** Force release. If the TestRun step was executed before the process was published, the "force" parameter value should be false, or not passed; if the TestRun step was not executed before the process was published, the "force" parameter value should be true. */
  force?: boolean,
  /** Required, the version number of the published workflow, in SemVer format "vx.y.z", must be larger than the current version, the current version can be obtained through GetCanvasInfo */
  workflow_version?: string,
  /** Workflow version description */
  version_description?: string,
}
export interface PublishWorkflowData {
  workflow_id: string,
  publish_commit_id: string,
  success: boolean,
}
export interface PublishWorkflowResponse {
  data: PublishWorkflowData,
  code: number,
  msg: string,
}
export interface CopyWorkflowRequest {
  workflow_id: string,
  space_id: string,
}
export interface CopyWorkflowData {
  workflow_id: string,
  schema_type: SchemaType,
}
export interface CopyWorkflowResponse {
  data: CopyWorkflowData,
  code: number,
  msg: string,
}
export interface UserInfo {
  user_id: number,
  user_name: string,
  user_avatar: string,
  /** user nickname */
  nickname: string,
}
export interface ReleasedWorkflowData {
  workflow_list: ReleasedWorkflow[],
  total: number,
}
export interface ReleasedWorkflow {
  plugin_id: string,
  workflow_id: string,
  space_id: string,
  name: string,
  desc: string,
  icon: string,
  inputs: string,
  outputs: string,
  end_type: number,
  type: number,
  sub_workflow_list: SubWorkflow[],
  version: string,
  create_time: number,
  update_time: number,
  /** Workflow creator information */
  creator: Creator,
  flow_mode: WorkflowMode,
  flow_version: string,
  flow_version_desc: string,
  latest_flow_version: string,
  latest_flow_version_desc: string,
  commit_id: string,
  output_nodes: NodeInfo[],
}
export interface SubWorkflow {
  id: string,
  name: string,
}
export enum OrderBy {
  CreateTime = 0,
  UpdateTime = 1,
  PublishTime = 2,
  Hot = 3,
  Id = 4,
}
/** Workflow filter */
export interface WorkflowFilter {
  workflow_id: string,
  workflow_version?: string,
}
export interface GetReleasedWorkflowsRequest {
  page?: number,
  size?: number,
  type?: WorkFlowType,
  name?: string,
  workflow_ids?: string[],
  tags?: Tag,
  space_id?: string,
  order_by?: OrderBy,
  login_user_create?: boolean,
  /** Workflow or imageflow, default to workflow */
  flow_mode?: WorkflowMode,
  /** Filter conditions, support workflow_id and workflow_version */
  workflow_filter_list?: WorkflowFilter[],
}
export interface GetReleasedWorkflowsResponse {
  data: ReleasedWorkflowData,
  code: number,
  msg: string,
}
export interface WorkflowReferencesData {
  workflow_list: Workflow[]
}
export interface GetWorkflowReferencesRequest {
  workflow_id: string,
  space_id: string,
}
export interface GetWorkflowReferencesResponse {
  data: WorkflowReferencesData,
  code: number,
  msg: string,
}
export interface GetExampleWorkFlowListResponse {
  data: WorkFlowListData,
  code: number,
  msg: string,
}
export interface GetExampleWorkFlowListRequest {
  /** Paging function, specifying the page number of the list of results you want to retrieve. */
  page?: number,
  /** Paging function, specifies the number of entries returned per page, must be greater than 0, less than or equal to 100 */
  size?: number,
  /** Filter the list of sample workflows by the name of the workflow. */
  name?: string,
  /** Filter the sample workflow list based on the workflow pattern (e.g., standard workflow, conversation flow, etc.). */
  flow_mode?: WorkflowMode,
  /** Bot's Workflow as Agent mode will be used, only scenarios with BotAgent = 3 will be used */
  checker?: CheckType[],
}
export enum WorkFlowListStatus {
  UnPublished = 1,
  HadPublished = 2,
}
export enum CheckType {
  WebSDKPublish = 1,
  SocialPublish = 2,
  BotAgent = 3,
  BotSocialPublish = 4,
  BotWebSDKPublish = 5,
}
export enum BindBizType {
  Agent = 1,
  Scene = 2,
  /** Douyin doppelganger */
  DouYinBot = 3,
}
export interface GetWorkFlowListRequest {
  page?: number,
  /** Page size, usually 10. */
  size?: number,
  /** Query the corresponding process according to the process id list */
  workflow_ids?: string[],
  /** Filter processes by process type */
  type?: WorkFlowType,
  /** Filter processes by process name */
  name?: string,
  /** Filter process by label */
  tags?: Tag,
  /** Required, space id */
  space_id?: string,
  /** Filter process according to whether the process has been published */
  status?: WorkFlowListStatus,
  order_by?: OrderBy,
  /** Filter processes based on whether the interface requester is the process creator */
  login_user_create?: boolean,
  /** Workflow or chatflow, the default is workflow. Filter processes by process type */
  flow_mode?: WorkflowMode,
  /** New field for filtering schema_type */
  schema_type_list?: SchemaType[],
  /** Query process under the corresponding project */
  project_id?: string,
  /** For project publication filtering, each CheckType element in this list can specify a specific rule that determines whether the returned process passes the check. */
  checker?: CheckType[],
  bind_biz_id?: string,
  bind_biz_type?: BindBizType,
  project_version?: string,
}
export interface ResourceActionAuth {
  can_edit: boolean,
  can_delete: boolean,
  can_copy: boolean,
}
export interface ResourceAuthInfo {
  /** Resource ID */
  workflow_id: string,
  /** user id */
  user_id: string,
  /** user resource operation permission */
  auth: ResourceActionAuth,
}
export interface WorkFlowListData {
  workflow_list: Workflow[],
  auth_list: ResourceAuthInfo[],
  total: number,
}
export interface GetWorkFlowListResponse {
  data: WorkFlowListData,
  code: number,
  msg: string,
}
export interface QueryWorkflowNodeTypeRequest {
  space_id: string,
  workflow_id: string,
}
export interface QueryWorkflowNodeTypeResponse {
  data: WorkflowNodeTypeData,
  code: number,
  msg: string,
}
export interface NodeProps {
  id: string,
  type: string,
  is_enable_chat_history: boolean,
  is_enable_user_query: boolean,
  is_ref_global_variable: boolean,
}
export interface WorkflowNodeTypeData {
  node_types?: string[],
  sub_workflow_node_types?: string[],
  nodes_properties?: NodeProps[],
  sub_workflow_nodes_properties?: NodeProps[],
}
export interface WorkFlowTestRunRequest {
  workflow_id: string,
  input: {
    [key: string | number]: string
  },
  space_id?: string,
  /** The id of the agent, the process under non-project, the process involving variable nodes and databases */
  bot_id?: string,
  /** abandoned */
  submit_commit_id?: string,
  /** Specify vcs commit_id, default is empty */
  commit_id?: string,
  project_id?: string,
}
export interface WorkFlowTestRunData {
  workflow_id: string,
  execute_id: string,
  session_id: string,
}
export interface WorkFlowTestRunResponse {
  data: WorkFlowTestRunData,
  code: number,
  msg: string,
}
export interface WorkflowTestResumeRequest {
  workflow_id: string,
  execute_id: string,
  event_id: string,
  data: string,
  space_id?: string,
}
export interface WorkflowTestResumeResponse {
  code: number,
  msg: string,
}
export enum WorkflowExeStatus {
  Running = 1,
  Success = 2,
  Fail = 3,
  Cancel = 4,
}
export interface CancelWorkFlowRequest {
  execute_id: string,
  space_id: string,
  workflow_id?: string,
}
export interface CancelWorkFlowResponse {
  code: number,
  msg: string,
}
/** Workflow snapshot basic information */
export interface WkPluginBasicData {
  workflow_id: string,
  space_id: string,
  name: string,
  desc: string,
  url: string,
  icon_uri: string,
  status: WorkFlowStatus,
  /** Plugin ID for workflow */
  plugin_id: string,
  create_time: number,
  update_time: number,
  source_id: string,
  creator: Creator,
  schema: string,
  start_node: Node,
  flow_mode: WorkflowMode,
  sub_workflows: number[],
  latest_publish_commit_id: string,
  end_node: Node,
}
export interface CopyWkTemplateApiRequest {
  workflow_ids: string[],
  /** Copy target space */
  target_space_id: string,
}
export interface CopyWkTemplateApiResponse {
  /** Template ID: Copy copy of data */
  data: {
    [key: string | number]: WkPluginBasicData
  },
  code: number,
  msg: string,
}
/** === node history === */
export interface GetWorkflowProcessRequest {
  /** Process id, not empty */
  workflow_id: string,
  /** Space id, not empty */
  space_id: string,
  /** Execution ID of the process */
  execute_id?: string,
  /** Execution ID of the subprocess */
  sub_execute_id?: string,
  /** Whether to return all batch node contents */
  need_async?: boolean,
  /** When execute_id is not transmitted, it can be obtained through log_id execute_id */
  log_id?: string,
  node_id?: string,
}
export interface GetWorkflowProcessResponse {
  code: number,
  msg: string,
  data: GetWorkFlowProcessData,
}
export enum WorkflowExeHistoryStatus {
  NoHistory = 1,
  HasHistory = 2,
}
export interface TokenAndCost {
  /** Input Consumption Tokens */
  inputTokens?: string,
  /** Input cost */
  inputCost?: string,
  /** Output Consumption Tokens */
  outputTokens?: string,
  /** Output cost */
  outputCost?: string,
  /** Total Consumed Tokens */
  totalTokens?: string,
  /** total cost */
  totalCost?: string,
}
export enum NodeHistoryScene {
  Default = 0,
  TestRunInput = 1,
}
export interface GetNodeExecuteHistoryRequest {
  workflow_id: string,
  space_id: string,
  execute_id: string,
  /** Node ID */
  node_id: string,
  /** Whether batch node */
  is_batch?: boolean,
  /** execution batch */
  batch_index?: number,
  node_type: string,
  node_history_scene?: NodeHistoryScene,
}
export interface GetNodeExecuteHistoryResponse {
  code: number,
  msg: string,
  data: NodeResult,
}
export interface GetWorkFlowProcessData {
  workFlowId: string,
  executeId: string,
  executeStatus: WorkflowExeStatus,
  nodeResults: NodeResult[],
  /** execution progress */
  rate: string,
  /** Current node practice run state 1: no practice run 2: practice run */
  exeHistoryStatus: WorkflowExeHistoryStatus,
  /** Workflow practice running time */
  workflowExeCost: string,
  /** consume */
  tokenAndCost?: TokenAndCost,
  /** reason for failure */
  reason?: string,
  /** The ID of the last node */
  lastNodeID?: string,
  logID: string,
  /** Returns only events in the interrupt */
  nodeEvents: NodeEvent[],
  projectId: string,
}
export enum NodeExeStatus {
  Waiting = 1,
  Running = 2,
  Success = 3,
  Fail = 4,
}
export interface NodeResult {
  nodeId: string,
  NodeType: string,
  NodeName: string,
  nodeStatus: NodeExeStatus,
  errorInfo: string,
  /** Imported parameters jsonString type */
  input: string,
  /** Exported parameter jsonString */
  output: string,
  /** Running time eg: 3s */
  nodeExeCost: string,
  /** consume */
  tokenAndCost?: TokenAndCost,
  /** direct output */
  raw_output?: string,
  errorLevel: string,
  index?: number,
  items?: string,
  maxBatchSize?: number,
  limitVariable?: string,
  loopVariableLen?: number,
  batch?: string,
  isBatch?: boolean,
  logVersion: number,
  extra: string,
  executeId?: string,
  subExecuteId?: string,
  needAsync?: boolean,
}
export enum EventType {
  LocalPlugin = 1,
  Question = 2,
  RequireInfos = 3,
  SceneChat = 4,
  InputNode = 5,
  WorkflowLocalPlugin = 6,
  WorkflowOauthPlugin = 7,
}
export interface NodeEvent {
  id: string,
  type: EventType,
  node_title: string,
  data: string,
  node_icon: string,
  /** Actually node_execute_id */
  node_id: string,
  /** Corresponds to node_id on canvas */
  schema_node_id: string,
}
export interface GetUploadAuthTokenRequest {
  scene: string
}
export interface GetUploadAuthTokenResponse {
  data: GetUploadAuthTokenData,
  code: number,
  msg: string,
}
export interface GetUploadAuthTokenData {
  service_id: string,
  upload_path_prefix: string,
  auth: UploadAuthTokenInfo,
  upload_host: string,
  schema: string,
}
export interface UploadAuthTokenInfo {
  access_key_id: string,
  secret_access_key: string,
  session_token: string,
  expired_time: string,
  current_time: string,
}
export interface SignImageURLRequest {
  uri: string,
  Scene?: string,
}
export interface SignImageURLResponse {
  url: string,
  code: number,
  msg: string,
}
export interface ValidateErrorData {
  node_error: NodeError,
  path_error: PathError,
  message: string,
  type: ValidateErrorType,
}
export enum ValidateErrorType {
  BotValidateNodeErr = 1,
  BotValidatePathErr = 2,
  BotConcurrentPathErr = 3,
}
export interface NodeError {
  node_id: string
}
export interface PathError {
  start: string,
  end: string,
  /** Node ID on the path */
  path: string[],
}
export interface NodeTemplate {
  id: string,
  type: NodeTemplateType,
  name: string,
  desc: string,
  icon_url: string,
  support_batch: SupportBatch,
  node_type: string,
  color: string,
}
/** plug-in configuration */
export interface PluginAPINode {
  /** Actual plug-in configuration */
  plugin_id: string,
  api_id: string,
  api_name: string,
  /** For node display */
  name: string,
  desc: string,
  icon_url: string,
  node_type: string,
}
/** View more image plugins */
export interface PluginCategory {
  plugin_category_id: string,
  only_official: boolean,
  /** For node display */
  name: string,
  icon_url: string,
  node_type: string,
}
export interface NodeTemplateListRequest {
  /** Required node type, return all by default without passing */
  need_types?: NodeTemplateType[],
  /** Required node type, string type */
  node_types?: string[],
}
export interface NodeTemplateListData {
  template_list: NodeTemplate[],
  /** Display classification configuration of nodes */
  cate_list: NodeCategory[],
  plugin_api_list: PluginAPINode[],
  plugin_category_list: PluginCategory[],
}
export interface NodeCategory {
  /** Category name, empty string indicates that the following node does not belong to any category */
  name: string,
  node_type_list: string[],
  /** List of api_id plugins */
  plugin_api_id_list?: string[],
  /** Jump to the classification configuration of the official plug-in list */
  plugin_category_id_list?: string[],
}
/** 5: optional NodeCategory sub_category,//sub-category, if you need to support multi-layer, you can use sub_category to achieve */
export interface NodeTemplateListResponse {
  data: NodeTemplateListData,
  code: number,
  msg: string,
}
export interface WorkflowNodeDebugV2Request {
  workflow_id: string,
  node_id: string,
  input: {
    [key: string | number]: string
  },
  batch: {
    [key: string | number]: string
  },
  space_id?: string,
  bot_id?: string,
  project_id?: string,
  setting?: {
    [key: string | number]: string
  },
}
export interface WorkflowNodeDebugV2Data {
  workflow_id: string,
  node_id: string,
  execute_id: string,
  session_id: string,
}
export interface WorkflowNodeDebugV2Response {
  code: number,
  msg: string,
  data: WorkflowNodeDebugV2Data,
}
export interface GetApiDetailRequest {
  pluginID: string,
  apiName: string,
  space_id: string,
  api_id: string,
  project_id?: string,
  plugin_version?: string,
}
export interface DebugExample {
  req_example: string,
  resp_example: string,
}
export enum PluginType {
  PLUGIN = 1,
  APP = 2,
  FUNC = 3,
  WORKFLOW = 4,
  IMAGEFLOW = 5,
  LOCAL = 6,
}
export interface ApiDetailData {
  pluginID: string,
  apiName: string,
  inputs: string,
  outputs: string,
  icon: string,
  name: string,
  desc: string,
  pluginProductStatus: number,
  pluginProductUnlistType: number,
  spaceID: string,
  debug_example?: DebugExample,
  updateTime: number,
  projectID?: string,
  version?: string,
  pluginType: PluginType,
  latest_version?: string,
  latest_version_name?: string,
  version_name?: string,
}
export interface GetApiDetailResponse {
  code: number,
  msg: string,
  data: ApiDetailData,
}
export interface NodeInfo {
  node_id: string,
  node_type: string,
  node_title: string,
}
export interface GetWorkflowDetailInfoRequest {
  /** Filter conditions, support workflow_id and workflow_version */
  workflow_filter_list?: WorkflowFilter[],
  space_id?: string,
}
export interface GetWorkflowDetailInfoResponse {
  data: WorkflowDetailInfoData[],
  code: number,
  msg: string,
}
export interface WorkflowDetailInfoData {
  workflow_id: string,
  space_id: string,
  name: string,
  desc: string,
  icon: string,
  inputs: string,
  outputs: string,
  version: string,
  create_time: number,
  update_time: number,
  project_id: string,
  end_type: number,
  icon_uri: string,
  flow_mode: WorkflowMode,
  plugin_id: string,
  /** Workflow creator information */
  creator: Creator,
  flow_version: string,
  flow_version_desc: string,
  latest_flow_version: string,
  latest_flow_version_desc: string,
  commit_id: string,
  is_project: boolean,
}
export interface GetWorkflowDetailRequest {
  workflow_ids?: string[],
  space_id?: string,
}
export interface GetWorkflowDetailResponse {
  data: WorkflowDetailData[],
  code: number,
  msg: string,
}
export interface WorkflowDetailData {
  workflow_id: string,
  space_id: string,
  name: string,
  desc: string,
  icon: string,
  inputs: string,
  outputs: string,
  version: string,
  create_time: number,
  update_time: number,
  project_id: string,
  end_type: number,
  icon_uri: string,
  flow_mode: WorkflowMode,
  output_nodes: NodeInfo[],
}
export enum ParameterType {
  String = 1,
  Integer = 2,
  Number = 3,
  Object = 4,
  Array = 5,
  Bool = 6,
}
export enum ParameterLocation {
  Path = 1,
  Query = 2,
  Body = 3,
  Header = 4,
}
/** Default imported parameter settings source */
export enum DefaultParamSource {
  /** default user input */
  Input = 0,
  /** reference variable */
  Variable = 1,
}
/** Subdivision types for File type parameters */
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
export interface APIParameter {
  /** For the front end, no practical significance */
  id: string,
  name: string,
  desc: string,
  type: ParameterType,
  sub_type?: ParameterType,
  location: ParameterLocation,
  is_required: boolean,
  sub_parameters: APIParameter[],
  global_default?: string,
  global_disable: boolean,
  local_default?: string,
  local_disable: boolean,
  format?: string,
  title?: string,
  enum_list: string[],
  value?: string,
  enum_var_names: string[],
  minimum?: number,
  maximum?: number,
  exclusive_minimum?: boolean,
  exclusive_maximum?: boolean,
  biz_extend?: string,
  /** Default imported parameter settings source */
  default_param_source?: DefaultParamSource,
  /** Reference variable key */
  variable_ref?: string,
  assist_type?: AssistParameterType,
}
export interface AsyncConf {
  switch_status: boolean,
  message: string,
}
export interface ResponseStyle {
  mode: number
}
export interface FCPluginSetting {
  plugin_id: string,
  api_id: string,
  api_name: string,
  request_params: APIParameter[],
  response_params: APIParameter[],
  response_style: ResponseStyle,
  /** This issue is temporarily not supported. */
  async_conf?: AsyncConf,
  is_draft: boolean,
  plugin_version: string,
}
export interface FCWorkflowSetting {
  workflow_id: string,
  plugin_id: string,
  request_params: APIParameter[],
  response_params: APIParameter[],
  response_style: ResponseStyle,
  /** This issue is temporarily not supported. */
  async_conf?: AsyncConf,
  is_draft: boolean,
  workflow_version: string,
}
export interface FCDatasetSetting {
  dataset_id: string
}
export interface GetLLMNodeFCSettingsMergedRequest {
  workflow_id: string,
  space_id: string,
  plugin_fc_setting?: FCPluginSetting,
  workflow_fc_setting?: FCWorkflowSetting,
  dataset_fc_setting?: FCDatasetSetting,
}
export interface GetLLMNodeFCSettingsMergedResponse {
  plugin_fc_setting?: FCPluginSetting,
  worflow_fc_setting?: FCWorkflowSetting,
  dataset_fc_setting?: FCDatasetSetting,
  code: number,
  msg: string,
}
export interface PluginFCItem {
  plugin_id: string,
  api_id: string,
  api_name: string,
  is_draft: boolean,
  plugin_version?: string,
}
export interface WorkflowFCItem {
  workflow_id: string,
  plugin_id: string,
  is_draft: boolean,
  workflow_version?: string,
}
export interface DatasetFCItem {
  dataset_id: string,
  is_draft: boolean,
}
export interface GetLLMNodeFCSettingDetailRequest {
  workflow_id: string,
  space_id: string,
  plugin_list?: PluginFCItem[],
  workflow_list?: WorkflowFCItem[],
  dataset_list?: DatasetFCItem[],
}
export interface PluginDetail {
  id: string,
  icon_url: string,
  description: string,
  is_official: boolean,
  name: string,
  plugin_status: number,
  plugin_type: number,
  latest_version_ts: number,
  latest_version_name: string,
  version_name: string,
}
export interface APIDetail {
  /** API ID */
  id: string,
  name: string,
  description: string,
  parameters: APIParameter[],
  plugin_id: string,
}
export interface WorkflowDetail {
  id: string,
  plugin_id: string,
  description: string,
  icon_url: string,
  is_official: boolean,
  name: string,
  status: number,
  type: number,
  api_detail: APIDetail,
  latest_version_name: string,
  flow_mode: number,
}
export interface DatasetDetail {
  id: string,
  icon_url: string,
  name: string,
  format_type: number,
}
export interface GetLLMNodeFCSettingDetailResponse {
  /** pluginid -> value */
  plugin_detail_map: {
    [key: string | number]: PluginDetail
  },
  /** apiid -> value */
  plugin_api_detail_map: {
    [key: string | number]: APIDetail
  },
  /** workflowid-> value */
  workflow_detail_map: {
    [key: string | number]: WorkflowDetail
  },
  /** datasetid -> value */
  dataset_detail_map: {
    [key: string | number]: DatasetDetail
  },
  code: number,
  msg: string,
}
export interface CreateProjectConversationDefRequest {
  project_id: string,
  conversation_name: string,
  space_id: string,
}
export interface CreateProjectConversationDefResponse {
  unique_id: string,
  space_id: string,
  code: number,
  msg: string,
}
export interface UpdateProjectConversationDefRequest {
  project_id: string,
  unique_id: string,
  conversation_name: string,
  space_id: string,
}
export interface UpdateProjectConversationDefResponse {
  code: number,
  msg: string,
}
export interface DeleteProjectConversationDefRequest {
  project_id: string,
  unique_id: string,
  /** Replace the table, which one to replace each wf draft with. If not replaced, success = false, replace will return the list to be replaced. */
  replace: {
    [key: string | number]: string
  },
  check_only: boolean,
  space_id: string,
}
export interface DeleteProjectConversationDefResponse {
  success: boolean,
  /** If no replacemap is passed, it will fail, returning the wf that needs to be replaced */
  need_replace: Workflow[],
  code: number,
  msg: string,
}
export enum CreateMethod {
  ManualCreate = 1,
  NodeCreate = 2,
}
export enum CreateEnv {
  Draft = 1,
  Release = 2,
}
export interface ListProjectConversationRequest {
  project_id: string,
  /** 0 = created in project (static session), 1 = created through wf node (dynamic session) */
  create_method: CreateMethod,
  /** 0 = wf node practice run created 1 = wf node run after release */
  create_env: CreateEnv,
  /** Paging offset, do not pass from the first item */
  cursor: string,
  /** number of pulls at one time */
  limit: number,
  space_id: string,
  /** conversationName fuzzy search */
  nameLike: string,
  /** create_env = 1, pass the corresponding channel id, the current default 1024 (openapi) */
  connector_id: string,
  /** Project version */
  project_version?: string,
}
export interface ProjectConversation {
  unique_id: string,
  conversation_name: string,
  /** For your own conversationid in the coze channel */
  conversation_id: string,
  release_conversation_name: string,
}
export interface ListProjectConversationResponse {
  data: ProjectConversation[],
  /** Cursor, empty means there is no next page, bring this field when turning the page */
  cursor: string,
  code: number,
  msg: string,
}
export enum SuggestReplyInfoMode {
  /** close */
  Disable = 0,
  /** system */
  System = 1,
  /** custom */
  Custom = 2,
}
/** suggest */
export interface SuggestReplyInfo {
  /**
   * Coze Auto-Suggestion
   * suggestion problem model
  */
  suggest_reply_mode?: SuggestReplyInfoMode,
  /** user-defined suggestion questions */
  customized_suggest_prompt?: string,
}
export enum Caller {
  Canvas = 1,
  UIBuilder = 2,
}
export interface OnboardingInfo {
  /** Markdown format */
  prologue: string,
  /** List of questions */
  suggested_questions?: string[],
  /** Whether to display all suggested questions */
  display_all_suggestions?: boolean,
}
export interface VoiceConfig {
  voice_name: string,
  /** timbre ID */
  voice_id: string,
}
export enum InputMode {
  /** Type input */
  Text = 1,
  /** Voice input */
  Audio = 2,
}
export enum SendVoiceMode {
  /** text message */
  Text = 1,
  /** Send as voice */
  Audio = 2,
}
export interface AudioConfig {
  /** Key for language "zh", "en" "ja" "es" "id" "pt" */
  voice_config_map?: {
    [key: string | number]: VoiceConfig
  },
  /** Text to speech switch */
  is_text_to_voice_enable: boolean,
  /** agent message form */
  agent_message_type: InputMode,
}
export interface UserInputConfig {
  /** Default input method */
  default_input_mode: InputMode,
  /** User voice message sending form */
  send_voice_mode: SendVoiceMode,
}
export interface GradientPosition {
  left?: number,
  right?: number,
}
export interface CanvasPosition {
  width?: number,
  height?: number,
  left?: number,
  top?: number,
}
export interface BackgroundImageDetail {
  /** original image */
  origin_image_uri?: string,
  origin_image_url?: string,
  /** Actual use of pictures */
  image_uri?: string,
  image_url?: string,
  theme_color?: string,
  /** Gradual change of position */
  gradient_position?: GradientPosition,
  /** Crop canvas position */
  canvas_position?: CanvasPosition,
}
export interface BackgroundImageInfo {
  /** Web background cover */
  web_background_image?: BackgroundImageDetail,
  /** Mobile end background cover */
  mobile_background_image?: BackgroundImageDetail,
}
export interface AvatarConfig {
  image_uri: string,
  image_url: string,
}
export interface ChatFlowRole {
  id: string,
  workflow_id: string,
  /** Channel ID */
  connector_id: string,
  /** avatar */
  avatar?: AvatarConfig,
  /** Role Description */
  description?: string,
  /** opening statement */
  onboarding_info?: OnboardingInfo,
  /** role name */
  name?: string,
  /** User Question Suggestions */
  suggest_reply_info?: SuggestReplyInfo,
  /** background cover */
  background_image_info?: BackgroundImageInfo,
  /** Voice configuration: tone, phone, etc */
  audio_config?: AudioConfig,
  /** user input method */
  user_input_config?: UserInputConfig,
  /** project version */
  project_version?: string,
}
export interface CreateChatFlowRoleRequest {
  chat_flow_role: ChatFlowRole
}
export interface CreateChatFlowRoleResponse {
  /** ID in the database */
  ID: string
}
export interface DeleteChatFlowRoleRequest {
  WorkflowID: string,
  ConnectorID: string,
  /** ID in the database */
  ID: string,
}
export interface DeleteChatFlowRoleResponse {}
export interface GetChatFlowRoleRequest {
  workflow_id: string,
  connector_id: string,
  is_debug: boolean,
  /** 4: optional string AppID (api.query = "app_id") */
  ext?: {
    [key: string | number]: string
  },
}
export interface GetChatFlowRoleResponse {
  role?: ChatFlowRole
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
export interface NodePanelSearchRequest {
  /** The data type of the search, pass empty, do not pass, or pass All means search for all types */
  search_type: NodePanelSearchType,
  space_id: string,
  project_id?: string,
  search_key: string,
  /** The value is "" on the first request, and the underlying implementation is converted to a page or cursor according to the paging mode of the data source */
  page_or_cursor: string,
  page_size: number,
  /** Excluded workflow_id, used to exclude the id of the current workflow when searching for workflow */
  exclude_workflow_id: string,
}
export interface NodePanelWorkflowData {
  workflow_list: Workflow[],
  /** Since the query of workflow is all page + size, page + 1 is returned here. */
  next_page_or_cursor: string,
  has_more: boolean,
}
export interface NodePanelPluginAPI {
  api_id: string,
  api_name: string,
  api_desc: string,
}
export interface NodePanelPlugin {
  plugin_id: string,
  name: string,
  desc: string,
  icon: string,
  tool_list: NodePanelPluginAPI[],
  version: string,
}
export interface NodePanelPluginData {
  plugin_list: NodePanelPlugin[],
  /** If the data source is page + size, return page + 1 here; if the data source is cursor mode, return the cursor returned by the data source here */
  next_page_or_cursor: string,
  has_more: boolean,
}
export interface NodePanelSearchData {
  resource_workflow?: NodePanelWorkflowData,
  project_workflow?: NodePanelWorkflowData,
  favorite_plugin?: NodePanelPluginData,
  resource_plugin?: NodePanelPluginData,
  project_plugin?: NodePanelPluginData,
  store_plugin?: NodePanelPluginData,
}
export interface NodePanelSearchResponse {
  data: NodePanelSearchData,
  code: number,
  msg: string,
}
export enum OrderByType {
  Asc = 1,
  Desc = 2,
}
export interface ListPublishWorkflowRequest {
  space_id: string,
  /** filter */
  owner_id?: string,
  /** Search term: agent or author name */
  name?: string,
  order_last_publish_time?: OrderByType,
  order_total_token?: OrderByType,
  size: number,
  cursor_id?: string,
  workflow_ids?: string[],
}
export interface PublishBasicWorkflowData {
  /** Information on recently released projects */
  basic_info: WorkflowBasicInfo,
  user_info: UserInfo,
  /** Published channel aggregation */
  connectors: ConnectorInfo[],
  /** Total token consumption as of yesterday */
  total_token: string,
}
export interface PublishWorkflowListData {
  workflows: PublishBasicWorkflowData[],
  total: number,
  has_more: boolean,
  next_cursor_id: string,
}
export interface ConnectorInfo {
  id: string,
  name: string,
  icon: string,
}
export interface WorkflowBasicInfo {
  id: string,
  name: string,
  description: string,
  icon_uri: string,
  icon_url: string,
  space_id: string,
  owner_id: string,
  create_time: number,
  update_time: number,
  publish_time: number,
  permission_type: PermissionType,
}
export interface ListPublishWorkflowResponse {
  data: PublishWorkflowListData,
  code: number,
  msg: string,
}
export enum PermissionType {
  /** Can't view details */
  NoDetail = 1,
  /** You can check the details. */
  Detail = 2,
  /** Can be viewed and operated */
  Operate = 3,
}
export interface ValidateTreeRequest {
  workflow_id: string,
  bind_project_id: string,
  bind_bot_id: string,
  schema?: string,
}
export interface ValidateTreeInfo {
  workflow_id: string,
  name: string,
  errors: ValidateErrorData[],
}
export interface ValidateTreeResponse {
  data: ValidateTreeInfo[],
  code: number,
  msg: string,
}
/** OpenAPI */
export interface OpenAPIRunFlowRequest {
  workflow_id: string,
  parameters?: string,
  ext: {
    [key: string | number]: string
  },
  bot_id?: string,
  is_async?: boolean,
  /** Default to official run, practice run needs to pass in "DEBUG" */
  execute_mode?: string,
  /** Version number, maybe workflow version or project version */
  version?: string,
  /** Channel ID, such as ui builder, template, store, etc */
  connector_id?: string,
  /** App ID referencing workflow */
  app_id?: string,
  /** Project ID, for compatibility with UI builder */
  project_id?: string,
}
export interface OpenAPIRunFlowResponse {
  /**
   * generic field
   * call result
  */
  code: number,
  /** Success for success, failure for simple error messages, */
  msg?: string,
  /**
   * Synchronized return field
   * The execution result, usually a json serialized string, may also be a non-json string.
  */
  data?: string,
  token?: number,
  cost?: string,
  debug_url?: string,
  /** asynchronous return field */
  execute_id?: string,
}
/** This enumeration needs to be aligned with the plugin's PluginInterruptType */
export enum InterruptType {
  LocalPlugin = 1,
  Question = 2,
  RequireInfos = 3,
  SceneChat = 4,
  Input = 5,
  OauthPlugin = 7,
}
export interface Interrupt {
  event_id: string,
  type: InterruptType,
  data: string,
}
export interface OpenAPIStreamRunFlowResponse {
  /** absolute serial number */
  id: string,
  /** Event type: message, done, error */
  event: string,
  /**
   * Node information
   * The serial number in the node
  */
  node_seq_id?: string,
  /** Node name */
  node_title?: string,
  /** Return when ContentType is Text */
  content?: string,
  /** Has the node completed execution? */
  node_is_finish?: boolean,
  /** Transmission when content type is interrupt, interrupt protocol */
  interrupt_data?: Interrupt,
  /** Data type returned */
  content_type?: string,
  /** Card Content Returned when Content Type is Card */
  card_body?: string,
  /** Node type */
  node_type?: string,
  node_id?: string,
  /** Last message on success */
  ext?: {
    [key: string | number]: string
  },
  token?: number,
  cost?: string,
  /** error message */
  error_code?: number,
  error_message?: string,
  debug_url?: string,
}
export interface OpenAPIStreamResumeFlowRequest {
  event_id: string,
  interrupt_type: InterruptType,
  resume_data: string,
  ext: {
    [key: string | number]: string
  },
  workflow_id: string,
  /** Channel ID, such as ui builder, template, store, etc */
  connector_id?: string,
}
export interface GetWorkflowRunHistoryRequest {
  workflow_id: string,
  execute_id?: string,
}
export enum WorkflowRunMode {
  Sync = 0,
  Stream = 1,
  Async = 2,
}
export interface WorkflowExecuteHistory {
  execute_id?: number,
  execute_status?: string,
  bot_id?: number,
  connector_id?: number,
  connector_uid?: string,
  run_mode?: WorkflowRunMode,
  log_id?: string,
  create_time?: number,
  update_time?: number,
  debug_url?: string,
  /** successful execution */
  input?: string,
  output?: string,
  token?: number,
  cost?: string,
  cost_unit?: string,
  ext?: {
    [key: string | number]: string
  },
  /** execution failed */
  error_code?: string,
  error_msg?: string,
}
export interface GetWorkflowRunHistoryResponse {
  code?: number,
  msg?: string,
  data?: WorkflowExecuteHistory[],
}
export interface EnterMessage {
  role: string,
  /** content */
  content: string,
  meta_data: {
    [key: string | number]: string
  },
  /** text/card/object_string */
  content_type: string,
  type: string,
}
export interface ChatFlowRunRequest {
  workflow_id: string,
  parameters?: string,
  ext: {
    [key: string | number]: string
  },
  bot_id?: string,
  /** Default to official run, practice run needs to pass in "DEBUG" */
  execute_mode?: string,
  /** Version number, maybe workflow version or project version */
  version?: string,
  /** Channel ID, such as ui builder, template, store, etc */
  connector_id?: string,
  app_id?: string,
  /** Session ID */
  conversation_id?: string,
  /** The message that the user wants to write first */
  additional_messages?: EnterMessage[],
  /** Project ID, for compatibility with UI builder */
  project_id?: string,
  /** Suggested reply message */
  suggest_reply_info?: SuggestReplyInfo,
}
export interface ChatFlowRunResponse {
  /** event type */
  event: string,
  /** Msg, error and other data, in order to align different message types, use json serialization */
  data: string,
}
export interface OpenAPIGetWorkflowInfoRequest {
  workflow_id: string,
  connector_id: string,
  is_debug: boolean,
  /** 4: optional string AppID (api.query = "app_id") */
  caller?: string,
}
export interface WorkflowInfo {
  role?: ChatFlowRole
}
export interface OpenAPIGetWorkflowInfoResponse {
  /** API adaptation */
  code?: number,
  msg?: string,
  data?: WorkflowInfo,
}
/**
 * ===== Card Selector Related Structures =====
 * 卡片项信息
*/
export interface CardItem {
  cardId: string,
  cardName: string,
  code: string,
  cardPicUrl?: string,
  picUrl?: string,
  cardShelfStatus?: string,
  cardShelfTime?: string,
  createUserId?: string,
  createUserName?: string,
  sassAppId?: string,
  sassWorkspaceId?: string,
  bizChannel?: string,
  cardClassId?: string,
}
/** 获取卡片列表请求 */
export interface GetCardListRequest {
  sassWorkspaceId: string,
  pageNo?: number,
  pageSize?: number,
  searchValue?: string,
  cardName?: string,
  cardCode?: string,
}
/** 获取卡片列表响应数据 */
export interface GetCardListData {
  cardList: CardItem[],
  pageNo: string,
  pageSize: string,
  totalNums: string,
  totalPages: string,
}
/** 获取卡片列表响应 */
export interface GetCardListResponse {
  data: GetCardListData,
  code: number,
  msg: string,
}