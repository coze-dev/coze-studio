/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as bot_common from './bot_common';

export type Int64 = string | number;

export enum SearchStrategy {
  /** 语义搜索 */
  SemanticSearch = 0,
  /** 混合搜索 */
  HybridSearch = 1,
  /** 全文搜索 */
  FullTextSearch = 20,
}

export interface ApiInfo {
  /** api id */
  api_id?: string;
  /** api名称 */
  name?: string;
  /** api描述 */
  description?: string;
}

export interface BotConfig {
  character_name?: string;
  propmt?: string;
}

export interface BotInfo {
  /** bot id */
  bot_id?: string;
  /** bot名称 */
  name?: string;
  /** bot描述 */
  description?: string;
  /** bot图像url */
  icon_url?: string;
  /** 创建时间 */
  create_time?: Int64;
  /** 更新时间 */
  update_time?: Int64;
  /** 版本 */
  version?: string;
  /** prompt 信息 */
  prompt_info?: PromptInfo;
  /** 开场白 */
  onboarding_info?: OnboardingInfoV2;
  /** bot 类型，single agent or multi agent */
  bot_mode?: bot_common.BotMode;
  /** 选择的语音信息 */
  voice_data_list?: Array<VoiceData>;
  /** 模型信息 */
  model_info?: ModelInfo;
  /** 插件信息列表 */
  plugin_info_list?: Array<PluginInfo>;
  /** 知识库信息 */
  knowledge?: CommonKnowledge;
}

export interface BotOnboardingReq {
  source?: string;
  bot_id?: string;
}

export interface BotOnboardingResp {
  code: number;
  msg: string;
  onboarding?: Onboarding;
  user_id?: string;
  sender_info?: SenderInfo;
}

export interface ChatMessage {
  role?: string;
  type?: string;
  content?: string;
  content_type?: string;
  message_id?: string;
  reply_id?: string;
  section_id?: string;
  extra_info?: Record<string, string>;
  /** 正常、打断状态 拉消息列表时使用，chat运行时没有这个字段 */
  status?: string;
  /** 打断位置 */
  broken_pos?: number;
  meta_data?: MetaData;
  name?: string;
}

export interface ChatV1Req {
  bot_id: string;
  conversation_id?: string;
  bot_version?: string;
  user: string;
  query: string;
  chat_history?: Array<ChatMessage>;
  extra?: Record<string, string>;
  stream?: boolean;
  custom_variables?: Record<string, string>;
  /** 前端本地的message_id 在extra_info 里面透传返回 */
  local_message_id?: string;
  content_type?: string;
}

export interface ChatV1Resp {
  messages: Array<ChatMessage>;
  conversation_id: string;
  code?: Int64;
  msg?: string;
}

export interface ChatV2NoneStreamResp {
  messages?: Array<ChatMessage>;
  conversation_id?: string;
  code: Int64;
  msg: string;
}

export interface ChatV2Req {
  bot_id: string;
  conversation_id?: string;
  bot_version?: string;
  user: string;
  query: string;
  chat_history?: Array<ChatMessage>;
  stream?: boolean;
  custom_variables?: Record<string, string>;
  extra?: Record<string, string>;
  local_message_id?: string;
  meta_data?: MetaData;
  content_type?: string;
  tools?: Array<Tool>;
  /** 模型id，暂时不暴露，内部使用. */
  model_id?: string;
  /** 当前轮对话的 bot_name */
  bot_name?: string;
  /** 透传参数到 plugin/workflow 等下游 */
  extra_params?: Record<string, string>;
}

export interface ChatV3Request {
  bot_id: string;
  conversation_id?: string;
  user_id: string;
  stream?: boolean;
  additional_messages?: Array<EnterMessage>;
  custom_variables?: Record<string, string>;
  auto_save_history?: boolean;
  meta_data?: Record<string, string>;
  tools?: Array<Tool>;
  custom_config?: CustomConfig;
  /** 透传参数到 plugin/workflow 等下游 */
  extra_params?: Record<string, string>;
  /** 手动指定渠道 id 聊天。目前仅支持 websdk(=999) */
  connector_id?: string;
}

export interface ChatV3Response {
  data?: bot_common.ChatV3ChatDetail;
  code: number;
  msg: string;
}

export interface CommonKnowledge {
  /** 知识库信息 */
  knowledge_infos?: Array<KnowledgeInfo>;
}

export interface CreateDraftBotData {
  bot_id: string;
}

export interface CreateDraftBotRequest {
  space_id: string;
  name: string;
  description?: string;
  /** 头像文件id */
  icon_file_id?: string;
  prompt_info?: PromptInfo;
  plugin_id_list?: PluginIdList;
  onboarding_info?: OnboardingInfo;
  voice_ids?: Array<string>;
}

export interface CreateDraftBotResponse {
  code: number;
  msg: string;
  data: CreateDraftBotData;
}

export interface CustomConfig {
  model_config?: ModelConfig;
  bot_config?: BotConfig;
}

export interface EnterMessage {
  /** user / assistant */
  role?: string;
  /** 如果是非 text，需要解析 JSON */
  content?: string;
  meta_data?: Record<string, string>;
  /** text, card, object_string */
  content_type?: string;
  /** function_call, tool_output, knowledge, answer, follow_up, verbose, (普通请求可以不填)
用户输入时可用：function_call，tool_output
不支持用户输入使用：follow_up，knowledge，verbose，answer */
  type?: string;
  name?: string;
}

export interface ExchangeTokenInfo {
  is_exchanged?: boolean;
}

export interface File {
  url: string;
  /** 后缀名. 参考platform */
  suffix_type: string;
  file_name?: string;
}

export interface FileData {
  url: string;
  uri: string;
}

export interface GetBotInfoReq {
  /** botId */
  bot_id: string;
  /** 渠道id，外部使用时传 */
  connector_id: string;
  /** bot版本，不传则获取最新版本 */
  version?: string;
}

export interface GetBotInfoResp {
  code: Int64;
  msg: string;
  bot_info?: BotInfo;
}

export interface GetBotOnlineInfoReq {
  /** botId */
  bot_id: string;
  /** 先保留，不暴露且不使用该字段 */
  connector_id?: string;
  /** bot版本，不传则获取最新版本 */
  version?: string;
}

export interface GetBotOnlineInfoResp {
  code: number;
  msg: string;
  data: BotInfo;
}

export interface GetSpacePublishedBotsListReq {
  /** botId */
  space_id: string;
  /** 先保留，不透传且不使用该字段 */
  connector_id?: string;
  /** 空间下 bots 分页查询参数 */
  page_index?: number;
  page_size?: number;
}

export interface GetSpacePublishedBotsListResp {
  code: number;
  msg: string;
  data: SpacePublishedBotsInfo;
}

export interface GetVoiceListReq {}

export interface GetVoiceListResp {
  code: Int64;
  msg: string;
  /** 支持的语音信息 */
  voice_data_list?: Array<VoiceData>;
}

export interface Image {
  url: string;
  name?: string;
}

export interface Knowledge {
  /** 更新知识库列表 全量覆盖更新 */
  dataset_ids?: Array<string>;
  /** 自动调用 or 按需调用 */
  auto_call?: boolean;
  /** 搜索策略 */
  search_strategy?: SearchStrategy;
}

export interface KnowledgeInfo {
  /** 知识库id */
  id?: string;
  /** 知识库名称 */
  name?: string;
}

export interface MetaData {
  img?: Array<Image>;
  file?: Array<File>;
}

export interface ModelConfig {
  model_id?: string;
}

export interface ModelInfo {
  /** 模型id */
  model_id?: string;
  /** 模型名称 */
  model_name?: string;
}

export interface OauthAuthorizationCodeReq {
  code?: string;
  state?: string;
}

export interface OauthAuthorizationCodeResp {}

export interface OauthCallbackReq {
  /** tw仅使用 */
  oauth_token?: string;
  oauth_token_secret?: string;
  oauth_callback_confirmed?: boolean;
  /** 储存自定义json结构 */
  state?: string;
  /** tw仅使用 */
  oauth_verifier?: string;
}

export interface OauthCallbackResp {}

export interface OauthExchangeTokenReq {
  code?: string;
  state?: string;
}

export interface OauthExchangeTokenResp {
  code?: number;
  msg?: string;
  data?: ExchangeTokenInfo;
}

export interface Onboarding {
  prologue: string;
  suggested_questions: Array<string>;
}

export interface OnboardingInfo {
  /** 开场白 */
  prologue?: string;
  /** 建议问题 */
  suggested_questions?: Array<string>;
}

export interface OnboardingInfoV2 {
  /** 对应 Coze Opening Dialog
开场白 */
  prologue?: string;
  /** 建议问题 */
  suggested_questions?: Array<string>;
  /** 开场白模型 */
  onboarding_mode?: bot_common.OnboardingMode;
  /** LLM生成，用户自定义 Prompt */
  customized_onboarding_prompt?: string;
  /** 开场白预设问题展示方式 默认0 随机展示 */
  suggested_questions_show_mode?: bot_common.SuggestedQuestionsShowMode;
}

export interface PluginIdInfo {
  plugin_id: string;
  api_id?: string;
}

export interface PluginIdList {
  id_list?: Array<PluginIdInfo>;
}

export interface PluginInfo {
  /** 插件id */
  plugin_id?: string;
  /** 插件名称 */
  name?: string;
  /** 插件描述 */
  description?: string;
  /** 插件图片url */
  icon_url?: string;
  /** 插件包含的api列表 */
  api_info_list?: Array<ApiInfo>;
}

/** bot管理 */
export interface PromptInfo {
  /** 文本prompt */
  prompt?: string;
}

export interface PublishDraftBotData {
  bot_id?: string;
  version?: string;
}

export interface PublishDraftBotRequest {
  bot_id: string;
  connector_ids: Array<string>;
}

export interface PublishDraftBotResponse {
  code: number;
  msg: string;
  data?: PublishDraftBotData;
}

export interface SenderInfo {
  nick_name: string;
  icon_url: string;
}

export interface SpacePublishedBots {
  bot_id?: string;
  bot_name?: string;
  description?: string;
  icon_url?: string;
  publish_time?: string;
}

export interface SpacePublishedBotsInfo {
  space_bots?: Array<SpacePublishedBots>;
  total?: number;
}

export interface SubmitToolOutputsRequest {
  conversation_id: string;
  chat_id: string;
  stream?: boolean;
  tool_outputs: Array<ToolOutput>;
}

/** 对齐 platform，传递 tools */
export interface Tool {
  plugin_id?: Int64;
  parameters?: string;
  api_name?: string;
}

/** 续聊时提交的执行结果 */
export interface ToolOutput {
  tool_call_id: string;
  output: string;
}

export interface UpdateDraftBotRequest {
  bot_id: string;
  name?: string;
  description?: string;
  icon_file_id?: string;
  prompt_info?: PromptInfo;
  plugin_id_list?: PluginIdList;
  onboarding_info?: OnboardingInfo;
  voice_ids?: Array<string>;
  knowledge?: Knowledge;
}

export interface UpdateDraftBotResponse {
  code: number;
  msg: string;
}

export interface UploadReq {
  source?: string;
  bot_id?: string;
}

export interface UploadResp {
  code: number;
  msg: string;
  file_data?: FileData;
}

export interface VoiceData {
  /** 唯一id */
  id?: string;
  /** 音色语种code */
  language_code?: string;
  /** 音色语种名称 */
  language_name?: string;
  /** 音色名称 */
  name?: string;
  /** 音色 style_id */
  style_id?: string;
  /** 预览文本内容 */
  preview_text?: string;
  /** 预览音色内容 */
  preview_audio?: string;
}
/* eslint-enable */
