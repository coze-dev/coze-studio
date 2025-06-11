/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum CozeSpaceTaskStatus {
  /** 还得再细化一下
初始化 */
  Init = 0,
  /** 运行中，Chat和任务执行都算在运行中 */
  Running = 1,
  /** 暂停 */
  Pause = 2,
  /** 一轮任务完成 */
  TaskFinish = 3,
  Stop = 4,
  /** 中断 */
  Interrupt = 5,
  /** 存在非法内容 */
  IllegalContent = 7,
  /** 异常中断 */
  AbnormalInterrupt = 8,
}

export enum CozeSpaceTaskType {
  /** 通用任务 */
  General = 1,
  /** 用研专家任务 */
  UserResearch = 2,
  /** 股票任务 */
  Stock = 3,
}

export enum MessageType {
  Query = 1,
  Answer = 2,
  Resume = 3,
}

export enum OperateType {
  Pause = 1,
  Resume = 2,
  Pin = 3,
  Unpin = 4,
  DoNotDisturb = 5,
  CancelDoNotDisturb = 6,
  Stop = 7,
}

export enum StockSearchType {
  /** 初始化传 */
  Init = 1,
  /** 搜股票传 */
  Stock = 2,
  /** 搜板块传 */
  Sector = 3,
}

export enum StockTaskType {
  /** 普通咨询任务 */
  GeneralChat = 1,
  /** 定时任务 */
  Scheduled = 2,
}

export enum TaskReplayOperateType {
  Open = 1,
  Close = 2,
}

export enum TaskRunMode {
  HandsOff = 0,
  Cooperative = 1,
}

export enum UploadUserResearchFileAction {
  FieldAnalysis = 1,
  Upload = 2,
}

export interface Action {
  /** 主键ID */
  action_id?: string;
  action_sort_id?: string;
  /** 文本 */
  content?: string;
  /** 容器输出的文本 */
  computer_content?: string;
  create_time?: Int64;
  /** 产物文件 */
  file_list?: Array<File>;
  /** 动作类型 */
  action_type?: string;
  /** 工具操作类型 */
  tool_operation_type?: string;
  /** 缩进 */
  parent_step_ids?: Array<string>;
}

export interface BrowserResumeData {
  /** 是否跳过接管 */
  skip_takeover?: boolean;
}

export interface CozeSpaceChatRequest {
  task_id?: string;
  query?: string;
  files?: Array<File>;
  mcp_list?: Array<Mcp>;
  chat_type?: string;
  /** pause - resume 时需传入 */
  pause_reason?: string;
  task_run_mode?: TaskRunMode;
  expert_agent_run_config?: ExpertTaskRunConfig;
}

export interface CozeSpaceChatResponse {
  code?: Int64;
  msg?: string;
  data?: CozeSpaceChatResponseData;
}

export interface CozeSpaceChatResponseData {
  answer_id?: string;
  query_id?: string;
}

export interface CozeSpaceTask {
  task_id?: string;
  task_name?: string;
  task_type?: CozeSpaceTaskType;
  task_status?: CozeSpaceTaskStatus;
  task_create_time?: string;
  task_update_time?: string;
  task_display_info?: CozeSpaceTaskDisplayInfo;
  mcp_tool_list?: Array<Mcp>;
  expert_agent_config?: ExpertAgentConfig;
  /** 是否是定时任务 */
  is_scheduled_task?: boolean;
}

export interface CozeSpaceTaskDisplayInfo {
  /** 是否置顶 */
  is_pin?: boolean;
  /** 是否免打扰 */
  is_dnd?: boolean;
}

export interface CreateCozeSpaceTaskData {
  task: CozeSpaceTask;
}

export interface CreateCozeSpaceTaskRequest {
  task_name: string;
  task_type: CozeSpaceTaskType;
  file_uri_list?: Array<string>;
  mcp_tool_list?: Array<Mcp>;
  agent_ids?: Array<string>;
  expert_agent_config?: ExpertAgentConfig;
}

export interface CreateCozeSpaceTaskResponse {
  code?: Int64;
  msg?: string;
  data: CreateCozeSpaceTaskData;
}

export interface CreateTaskReplayRequest {
  task_id?: string;
}

export interface CreateTaskReplayResponse {
  code?: Int64;
  msg?: string;
  data?: CreateTaskReplayResponseData;
}

export interface CreateTaskReplayResponseData {
  share_id?: string;
  secret?: string;
}

export interface DeleteCozeSpaceTaskRequest {
  task_id: string;
}

export interface DeleteCozeSpaceTaskResponse {
  code?: Int64;
  msg?: string;
}

export interface ExpertAgentConfig {
  user_research_config?: UserResearchConfig;
  stock_config?: StockConfig;
}

export interface ExpertTaskRunConfig {
  user_research_run_config?: UserResearchRunConfig;
  stock_task_run_config?: StockTaskRunConfig;
}

export interface File {
  file_name?: string;
  file_uri?: string;
  file_url?: string;
}

export interface GetCozeSpaceTaskListData {
  task_list?: Array<CozeSpaceTask>;
  next_cursor?: string;
  has_more?: boolean;
}

export interface GetCozeSpaceTaskListRequest {
  cursor?: string;
  size?: Int64;
}

export interface GetCozeSpaceTaskListResponse {
  code?: Int64;
  msg?: string;
  data: GetCozeSpaceTaskListData;
}

export interface GetMessageListRequest {
  task_id?: string;
  /** 游标,如果为空 从头开始 */
  cursor?: string;
  /** 获取几个 */
  size?: Int64;
}

export interface GetMessageListResponse {
  code?: Int64;
  msg?: string;
  data?: GetMessageListResponseData;
}

export interface GetMessageListResponseData {
  messages?: Array<Message>;
  /** 游标 */
  cursor?: string;
  task_status?: CozeSpaceTaskStatus;
  task_run_mode?: TaskRunMode;
  /** poll传入的next_key */
  next_key?: string;
  run_time?: Int64;
}

export interface GetSandboxTokenRequest {
  task_id: string;
}

export interface GetSandboxTokenResponse {
  code?: Int64;
  msg?: string;
  data?: GetSandboxTokenResponseData;
}

export interface GetSandboxTokenResponseData {
  token?: string;
  url?: string;
}

export interface GetTaskReplayByIdRequest {
  task_share_id?: string;
  secret?: string;
}

export interface GetTaskReplayByIdResponse {
  code?: Int64;
  msg?: string;
  data?: GetTaskReplayByIdResponseData;
}

export interface GetTaskReplayByIdResponseData {
  replay_file?: File;
}

export interface GetTaskReplayRequest {
  task_id?: string;
}

export interface GetTaskReplayResponse {
  code?: Int64;
  msg?: string;
  data?: GetTaskReplayResponseData;
}

export interface GetTaskReplayResponseData {
  replay_task_list?: Array<TaskReplay>;
}

export interface GetUserScheduledTasksData {
  task_num_map?: Record<CozeSpaceTaskType, Int64>;
}

export interface GetUserScheduledTasksRequest {}

export interface GetUserScheduledTasksResponse {
  code?: Int64;
  msg?: string;
  data?: GetUserScheduledTasksData;
}

export interface Mcp {
  id?: string;
}

export interface Message {
  message_id?: string;
  type?: MessageType;
  steps?: Array<Step>;
  content?: string;
  file_list?: Array<File>;
  create_time?: Int64;
  task_run_mode?: TaskRunMode;
}

export interface NameDesc {
  name?: string;
  desc?: string;
  /** analyze csv时返回展示使用，后续无需携带 */
  ori_name?: string;
}

export interface OperateTaskData {
  /** OperateType=Resume时返回 */
  answer_id?: string;
}

export interface OperateTaskReplayRequest {
  task_id?: string;
  task_share_id?: string;
  operate_type?: TaskReplayOperateType;
}

export interface OperateTaskReplayResponse {
  code?: Int64;
  msg?: string;
}

export interface OperateTaskRequest {
  task_id?: string;
  operate_type?: OperateType;
  /** pause - resume 时需传入 */
  pause_reason?: string;
  /** browser pause - resume 时需传入 */
  browser?: BrowserResumeData;
}

export interface OperateTaskResponse {
  code?: Int64;
  msg?: string;
  data?: OperateTaskData;
}

export interface PollStepListRequest {
  task_id?: string;
  answer_id?: string;
  next_key?: string;
}

export interface PollStepListResponse {
  code?: Int64;
  msg?: string;
  data?: PollStepListResponseData;
}

export interface PollStepListResponseData {
  steps?: Array<Step>;
  run_time?: Int64;
  task_name?: string;
  is_end?: boolean;
  next_key?: string;
  next_answer_id?: string;
}

export interface SearchStockData {
  stock_list?: Array<StockInfo>;
  sector_list?: Array<string>;
  hot_sector_list?: Array<string>;
}

export interface SearchStockRequest {
  search_type: StockSearchType;
  /** 股票代码，前缀匹配 */
  stock_search_word?: string;
  /** 股票名称，前缀匹配 */
  sector_search_word?: string;
}

export interface SearchStockResponse {
  code?: Int64;
  msg?: string;
  data?: SearchStockData;
}

export interface Step {
  /** 主键ID */
  step_id?: string;
  answer_id?: string;
  step_sort_id?: string;
  /** 动作列表 */
  action_list?: Array<Action>;
  create_time?: Int64;
  is_finish?: boolean;
}

export interface StockConfig {
  /** 股票任务细分类型 */
  stock_task_type?: StockTaskType;
  /** 是否需要定时任务 */
  sheduled_task_switch: boolean;
  /** 用户选定的股票 */
  stock_info_list?: Array<StockInfo>;
  /** 用户选定的板块 */
  sector_list?: Array<string>;
  /** 保存设置后需要发送的query（不支持接口修改） */
  user_send_query?: string;
  /** 保存设置后直接展示的开场白（不支持接口修改） */
  onboarding?: string;
  /** 是否有定时任务在运行（不支持接口修改） */
  is_scheduled_task_running?: boolean;
  /** 是否为早报准备时间（不支持修改） */
  is_morning_report_preparing?: boolean;
}

export interface StockInfo {
  stock_code?: string;
  stock_name?: string;
}

export interface StockTaskRunConfig {
  is_onboarding_run?: boolean;
}

export interface TaskReplay {
  secret?: string;
  task_share_id?: string;
}

export interface TriggerScheduledTaskRequest {
  task_id: string;
}

export interface TriggerScheduledTaskResponse {
  code?: Int64;
  msg?: string;
}

export interface UpdateCozeSpaceTaskData {
  task_name?: string;
  /** 保存设置后需要发送的query */
  user_send_query?: string;
  /** 保存设置后直接展示的开场白 */
  onboarding?: string;
}

export interface UpdateCozeSpaceTaskRequest {
  task_id: string;
  task_name?: string;
  mcp_tool_list?: Array<Mcp>;
  expert_agent_config?: ExpertAgentConfig;
}

export interface UpdateCozeSpaceTaskResponse {
  code?: Int64;
  msg?: string;
  data?: UpdateCozeSpaceTaskData;
}

export interface UpdateTaskPlanData {
  answer_id?: string;
}

export interface UpdateTaskPlanRequest {
  task_id: string;
  action_id: string;
  task_plan?: string;
}

export interface UpdateTaskPlanResponse {
  code?: Int64;
  msg?: string;
  data?: UpdateTaskPlanData;
}

export interface UploadFileData {
  file_uri?: string;
  task_id?: string;
}

export interface UploadTaskFileRequest {
  task_id?: string;
  file_name?: string;
  file_content?: Blob;
}

export interface UploadTaskFileResponse {
  code?: Int64;
  msg?: string;
  data?: UploadFileData;
}

export interface UploadUserResearchFileData {
  /** csv/xlsx 字段名称+描述 */
  fields?: Array<NameDesc>;
  /** other file */
  uri?: string;
}

export interface UploadUserResearchFileRequest {
  task_id: string;
  action: UploadUserResearchFileAction;
  /** 文件类型，csv/xlsx */
  file_type: string;
  /** 文件名，对应data_table */
  file_name: string;
  file_content?: Blob;
  /** 后续信息为提交字段，触发上传文件到DB，否则只解析文件字段名称和描述
表描述 */
  desc?: string;
  /** 字段名称+描述 */
  fields?: Array<NameDesc>;
}

export interface UploadUserResearchFileResponse {
  code?: Int64;
  msg?: string;
  data?: UploadUserResearchFileData;
}

export interface UserResearchConfig {
  /** create/update可修改 */
  product_intro: string;
  /** 不支持create，update可传最新的列表(name、type必传)仅做删除使用 */
  user_research_file_list?: Array<UserResearchFile>;
}

export interface UserResearchFile {
  file_name?: string;
  file_type?: string;
  file_uri?: string;
}

export interface UserResearchRunConfig {
  /** 传name即可 */
  cited_documents?: Array<UserResearchFile>;
}
/* eslint-enable */
