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
 
import { type RequiredAction } from '@coze-arch/bot-api/developer_api';

import { type PartiallyRequired } from '../../shared/utils/data-handler';
import { type FileType } from '../../shared/const';
import {
  type EventPayloadMaps,
  type UploadPluginInterface,
} from '../../plugins/upload-plugin/types/plugin-upload';
import { type ChatCoreError } from '../../custom-error';
import { type Scene } from '../../chat-sdk/types/interface';

type JSONstring<T = object> = T extends object ? string : never;

/** follow copilot 定义的枚举 */
export enum ChatMessageMetaType {
  /** Compatible value */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Default_0,
  /** 端侧直接替换 */
  Replaceable,
  /** 插入引用 */
  Insertable,
  /** 文档引用 */
  DocumentRef,
  /** 知识库引用卡片 */
  KnowledgeCard,
  /** 嵌入的多媒体信息，只是alice给端上用的，因为全链路复用这一个字段，所以在这儿改了 */
  EmbeddedMultimedia = 100,
}

export interface ChatMessageMetaInfo {
  type?: ChatMessageMetaType;
  info?: JSONstring;
}

// 服务端返回的chunk
export interface ChunkRaw {
  index: number;
  seq_id: number;
  is_finish: boolean;
  message: MessageRaw;
}

export interface MessageExtraInfo {
  local_message_id: string; // 前端消息 id, 用于预发送消息体更新
  input_tokens: string; // 用户 query 消耗的 token
  output_tokens: string; // llm 输出消耗的 token
  token: string; // 总的 token 消耗
  plugin_status: string; // "0" === success or "1" === fail
  time_cost: string; // 中间调用过程的时间
  workflow_tokens: string;
  bot_state: string; // {   bot_id?: string;agent_id?: string;agent_name?: string; }
  plugin_request: string; // plugin 请求的参数
  tool_name: string; // 调用的 plugin 下具体的 api 名称
  plugin: string; // 调用的 plugin 名称
  log_id?: string; // chat 的 logId
  mock_hit_info?: string; // plugin 命中 mockset 信息
  execute_display_name: string; // 展示名称
  /** 流式plugin返回的用于替换tool response内容的标识，普通plugin没有 */
  stream_plugin_running?: string;
  /** 目前仅有中间消息返回*/
  message_title?: string;
  remove_query_id?: string; // 有此字段代表触发擦除用户 qeury 安全策略, 值为需要擦出的用户消息的 message_id
  new_section_id?: string; // 有此字段代表触发清除上下文安全策略
  /** 对应定时任务task_type，1-预设任务，2-用户任务，3-Plugin后台任务 */
  task_type?: string;
  call_id?: string; // function_call和tool_response匹配的id
}

// 服务端返回的原始Message结构
export interface MessageRaw {
  role: MessageInfoRole; // 信息发出方的角色
  type: MessageType; // 主要用于区分role=assistant的bot返回信息类型
  section_id: string;
  content_type: ContentType;
  content: string;
  reasoning_content?: string;
  content_time?: number; // 消息发送时间，服务端是 Int64，接口拿到需要转一下
  user?: string; // 用户唯一标识
  /**
   * 仅拉取历史返回
   */
  message_status?: MessageStatus;
  message_id: string; // 后端消息 id, 可能有多条回复
  reply_id: string; // 回复 id，query的messageId
  broken_pos?: number; // 打断位置,仅对type = 'answer'生效
  /** 拉流 ack 有, 后续没有 */
  mention_list?: MessageMentionListFields['mention_list'];
  /** 发送者 id */
  sender_id?: string;
  extra_info: MessageExtraInfo;
  source?: MessageSource;
  reply_message?: Message<ContentType>;
  meta_infos?: Array<ChatMessageMetaInfo>;
  /** 中断消息服务端透传中台的参数，获取中断场景、续聊id */
  required_action?: RequiredAction;
  /** 卡片状态 */
  card_status?: Record<string, string>;
}

export const messageSource = {
  /** 普通聊天消息 */
  Chat: 0,
  /** 定时任务 */
  TaskManualTrigger: 1,
  /** 通知 */
  Notice: 2,
  /** 异步结果 */
  AsyncResult: 3,
} as const;

export const taskType = {
  /** 预设任务 */
  PresetTask: '1',
  /** 用户任务 */
  CreatedByUserTask: '2',
  /** Plugin 后台任务 */
  PluginTask: '3',
} as const;

export type MessageSource = (typeof messageSource)[keyof typeof messageSource];

// 经过Processor处理后的chunk
export interface Chunk<T extends ContentType> {
  index: number;
  seq_id: number;
  is_finish: boolean;
  message: Message<T>;
}

// 经过Processor处理后的Message
export type Message<T extends ContentType, V = unknown> = MessageRaw &
  MessageMentionListFields & {
    bot_id?: string;
    preset_bot?: string;
    index?: number; // 临时状态，message在一次 response 的排序
    is_finish?: boolean; // 临时状态，标识消息是否拉取完成
    /**
     * content 经过反序列化
     */
    content_obj: MessageContent<T, V>;
    /**
     * sdk开启了enableDebug模式，每条回复消息新增debug_messages字段，包含channel 吐出的所有 chunk消息
     */
    debug_messages?: ChunkRaw[];
    stream_chunk_buffer?: ChunkRaw[];
    stream_message_buffer?: Message<ContentType>[];
    /**
     * 旧接口未必有该字段；仅 query、answer、notice 等常见显示类型会进行计数。
     * - int64 类型，计数从 "1" 开始。
     * - 尽管我不认为单聊会有超过 Number.MAX_SAFE_INTEGER 的数值，但是还是用了 big-integer 库来进行处理。
     * - 不刷旧数据，因此 ① 旧数据 ② 非常规消息 的值取 "0"
     */
    message_index?: string;
    /**
     * 仅预发送消息返回
     */
    file_upload_result?: 'success' | 'fail'; // 文件上传状态
    /**
     * 本地消息状态, 仅预发送消息返回
     */
    local_message_status?: LocalMessageStatus;
    /**
     * 仅即使消息返回，拉取历史消息无
     */
    logId?: string; // chat 的 logId
  };

// 发送给服务端的消息结构
export interface SendMessage
  extends MessageMentionListFields,
    ResumeMessage,
    Record<string, unknown> {
  bot_id?: string;
  preset_bot?: string;
  conversation_id: string;
  stream?: boolean;
  user?: string;
  query: string;
  extra: Record<string, string>;
  draft_mode?: boolean; // 草稿bot or 线上bot
  content_type?: string; // 文件 file 图片 image 等
  regen_message_id?: string; // 重试消息id
  local_message_id: string; // 前端本地的message_id 在extra_info 里面透传返回
  chat_history?: Message<ContentType>[]; // 指定聊天上下文, 服务端不落库
}
// 发送给服务端的resume结构体，chat类型本身有缺失，本期只补充resume相关
export interface ResumeMessage {
  conversation_id: string;
  scene?: Scene; // 场景值
  resume_message_id?: string; // 续聊场景服务端所需id，即reply_id
  interrupt_message_id?: string; // 中断的verbose消息id
  tool_outputs?: {
    tool_call_id?: string; // 透传中断verbose消息中的tool_call.id
    output?: string; // 地理位置授权场景传经纬度
  }[];
}

export type LocalMessageStatus =
  | 'unsent'
  | 'send_success'
  | 'send_fail'
  | 'send_timeout';

export enum ContentType {
  Text = 'text',
  Link = 'link',
  Music = 'music',
  Video = 'video',
  Card = 'card',
  Image = 'image',
  File = 'file',
  Tako = 'tako',
  Custom = 'custom',
  Mix = 'mix',
}

export type MessageInfoRole = 'user' | 'assistant';

export type MessageType =
  | 'answer'
  | 'function_call'
  | 'tool_response'
  | 'follow_up'
  | 'ack'
  | 'question'
  | 'knowledge'
  | 'verbose'
  | 'task_manual_trigger'
  | '';

export type MessageStatus = 'available' | 'broken';

export type ResponseStatus = 'responding' | 'endResponse' | 'interrupt';

export enum PreSendLocalMessageEventsEnum {
  FILE_UPLOAD_STATUS_CHANGE = 'file_upload_status_change',
  MESSAGE_SEND_SUCCESS = 'message_send_success',
  MESSAGE_SEND_FAIL = 'message_send_fail',
  MESSAGE_SEND_TIMEOUT = 'message_send_timeout',
}

export interface PreSendLocalMessageEventsMap {
  [PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE]: (
    message: Message<ContentType>,
  ) => void;
  [PreSendLocalMessageEventsEnum.MESSAGE_SEND_SUCCESS]: (
    message: Message<ContentType>,
  ) => void;
  [PreSendLocalMessageEventsEnum.MESSAGE_SEND_FAIL]: (
    chatCoreError: ChatCoreError,
  ) => void;
  [PreSendLocalMessageEventsEnum.MESSAGE_SEND_TIMEOUT]: (
    chatCoreError: ChatCoreError,
  ) => void;
}

export type TextMessageContent = string;

export interface ImageModel {
  key: string;
  image_thumb: {
    url: string;
    width: number;
    height: number;
  };
  image_ori: {
    url: string;
    width: number;
    height: number;
  };
  feedback?: null;
}

export interface FileModel {
  file_key: string;
  file_name: string;
  file_type: FileType;
  file_size: number;
  file_url: string;
}

export interface ImageMessageContent {
  image_list: ImageModel[];
}

export interface FileMessageContent {
  file_list: FileModel[];
}

export interface MixMessageContent {
  item_list: (ImageMixItem | TextMixItem | FileMixItem | ReferMixItem)[];
}

export interface ContentTypeMap {
  [ContentType.Text]: TextMessageContent;
  [ContentType.Image]: ImageMessageContent;
  [ContentType.File]: FileMessageContent;
  [ContentType.Mix]: MixMessageContent;
}

export type MessageContent<
  T extends ContentType,
  V = unknown,
> = T extends keyof ContentTypeMap ? ContentTypeMap[T] : V;

export interface MessageExtProps {
  input_price: string;
  input_tokens: string;
  is_finish: string;
  output_price: string;
  output_tokens: string;
  token: string;
  total_price: string;
  has_suggest: string;
  time_cost: string;
}

export interface MessageMentionListFields {
  /** \@bot 功能，在输入时提及的 bot id */
  mention_list: { id: string }[];
}

interface TextMessagePropsPayload extends MessageMentionListFields {
  text: string;
}

interface FileMessagePropsPayload extends MessageMentionListFields {
  file: File;
}

export interface TextAndFileMixMessagePropsTextPayload {
  type: ContentType.Text;
  text: string;
}

export interface TextAndFileMixMessagePropsFilePayload {
  type: ContentType.File;
  file: File;
  uri: string;
}

export interface TextAndFileMixMessagePropsImagePayload {
  type: ContentType.Image;
  file: File;
  uri: string;
  width: number;
  height: number;
}

export interface TextAndFileMixMessagePropsPayload
  extends MessageMentionListFields {
  mixList: (
    | TextAndFileMixMessagePropsTextPayload
    | TextAndFileMixMessagePropsFilePayload
    | TextAndFileMixMessagePropsImagePayload
  )[];
}

export interface TextMessageProps {
  payload: TextMessagePropsPayload;
}

export interface ImageMessageProps<U extends EventPayloadMaps> {
  payload: FileMessagePropsPayload;
  pluginUploadManager?: (uploadPlugin: UploadPluginInterface<U>) => void;
}

export interface FileMessageProps<U extends EventPayloadMaps> {
  payload: FileMessagePropsPayload;
  pluginUploadManager?: (uploadPlugin: UploadPluginInterface<U>) => void;
}

export interface TextMixItem {
  type: ContentType.Text;
  text: string;
}

export interface FileMixItem {
  type: ContentType.File;
  file: FileModel;
}

export interface ImageMixItem {
  type: ContentType.Image;
  image: ImageModel;
}

export interface ReferMixItem {
  type: ContentType.Text;
  text: string;
}

export interface TextAndFileMixMessageProps {
  payload: TextAndFileMixMessagePropsPayload;
}

export interface NormalizedMessagePropsPayload<T extends ContentType>
  extends MessageMentionListFields {
  contentType: T;
  contentObj: MessageContent<T>;
}

export interface NormalizedMessageProps<T extends ContentType> {
  payload: NormalizedMessagePropsPayload<T>;
}

export interface SendMessageOptions {
  sendTimeout?: number;
  betweenChunkTimeout?: number;
  stream?: boolean;
  chatHistory?: Message<ContentType>[];
  // 参数会透传给 chat 接口
  extendFiled?: Record<string, unknown>;
  // 透传的header
  headers?: HeadersInit;
  // 是否为重新生成消息, 默认false
  isRegenMessage?: boolean;
}

export type SendMessageMergedOptions = PartiallyRequired<
  SendMessageOptions,
  'sendTimeout' | 'betweenChunkTimeout'
>;

export interface CreateMessageOptions {
  section_id?: string;
}

export enum VerboseMsgType {
  /** 跳转节点 */
  JUMP_TO = 'multi_agents_jump_to_agent',
  /** 回溯节点 */
  BACK_WORD = 'multi_agents_backwards',
  /** 长期记忆节点 */
  LONG_TERM_MEMORY = 'time_capsule_recall',
  /** finish answer*/
  GENERATE_ANSWER_FINISH = 'generate_answer_finish',
  /** 流式插件调用状态 */
  STREAM_PLUGIN_FINISH = 'stream_plugin_finish',
  /** 知识库召回 */
  KNOWLEDGE_RECALL = 'knowledge_recall',
  /** 中断消息：目前用于地理位置授权 / workflow question 待回复 */
  INTERRUPT = 'interrupt',
  /** hooks调用 */
  HOOK_CALL = 'hook_call',
}

export enum InterruptToolCallsType {
  FunctionType = 'function', // tool 结果上报
  RequireInfoType = 'require_info', // 需要信息，如地理位置
  ReplyMessage = 'reply_message', // question 节点
}

export interface VerboseContent {
  msg_type: VerboseMsgType;
  data: string;
}

export enum FinishReasonType {
  /** 正常回答全部结束 */
  ALL_FINISH = 0,
  /** 中断结束 */
  INTERRUPT = 1,
}

export interface AnswerFinishVerboseData {
  finish_reason?: FinishReasonType;
}
