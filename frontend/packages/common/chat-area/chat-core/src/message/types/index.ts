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

/** Enumeration following copilot definition */
export enum ChatMessageMetaType {
  /** Compatible value */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Default_0,
  /** End-to-side direct replacement */
  Replaceable,
  /** insert reference */
  Insertable,
  /** document citation */
  DocumentRef,
  /** Knowledge Base Reference Card */
  KnowledgeCard,
  /** The embedded multimedia information is only used by Alice for the end. Because full link multiplexing uses this field, it has been changed here. */
  EmbeddedMultimedia = 100,
}

export interface ChatMessageMetaInfo {
  type?: ChatMessageMetaType;
  info?: JSONstring;
}

// Server level returned chunks
export interface ChunkRaw {
  index: number;
  seq_id: number;
  is_finish: boolean;
  message: MessageRaw;
}

export interface MessageExtraInfo {
  local_message_id: string; // Front-end message id, used to pre-send message body updates
  input_tokens: string; // User query consumed token
  output_tokens: string; // LLM output consumed token
  token: string; // Total token consumption
  plugin_status: string; // "0" === success or "1" === fail
  time_cost: string; // Intermediate invocation time of procedure
  workflow_tokens: string;
  bot_state: string; // {   bot_id?: string;agent_id?: string;agent_name?: string; }
  plugin_request: string; // Parameters of the plugin request
  tool_name: string; // Specific API name under the invoked plugin
  plugin: string; // Name of the plugin invoked
  log_id?: string; // Chat logId
  mock_hit_info?: string; // Plugin hit mockset info
  execute_display_name: string; // display name
  /** The identifier returned by the streaming plugin to replace the tool response content, which is not available in the normal plugin */
  stream_plugin_running?: string;
  /** Currently only intermediate messages are returned.*/
  message_title?: string;
  remove_query_id?: string; // This field represents the trigger to erase the user qeury security policy, and the value is the message_id of the user message that needs to be erased
  new_section_id?: string; // This field represents the trigger to clear the context security policy
  /** Corresponding to timed task task_type, 1-preset task, 2-user task, 3-Plugin background task */
  task_type?: string;
  call_id?: string; // function_call and tool_response matching IDs
}

// Message structure returned by server level
export interface MessageRaw {
  role: MessageInfoRole; // The role of the sender of the message
  type: MessageType; // Mainly used to distinguish the type of bot return information for role = assistant
  section_id: string;
  content_type: ContentType;
  content: string;
  reasoning_content?: string;
  content_time?: number; // Message sending time, server level is Int64, you need to transfer it when you get the interface.
  user?: string; // user unique identity
  /**
   * Pull history only
   */
  message_status?: MessageStatus;
  message_id: string; // Backend message id, there may be multiple replies
  reply_id: string; // Reply id, query messageId
  broken_pos?: number; // Interrupt position, only valid for type = 'answer'
  /** LaLiu ack has it, no follow-up */
  mention_list?: MessageMentionListFields['mention_list'];
  /** Sender ID */
  sender_id?: string;
  extra_info: MessageExtraInfo;
  source?: MessageSource;
  reply_message?: Message<ContentType>;
  meta_infos?: Array<ChatMessageMetaInfo>;
  /** Interrupt message server level pass through the parameters of the middle station, get the interrupt scene, continue chat id */
  required_action?: RequiredAction;
  /** Card Status */
  card_status?: Record<string, string>;
}

export const messageSource = {
  /** normal chat message */
  Chat: 0,
  /** timed task */
  TaskManualTrigger: 1,
  /** notify */
  Notice: 2,
  /** asynchronous result */
  AsyncResult: 3,
} as const;

export const taskType = {
  /** preset task */
  PresetTask: '1',
  /** user task */
  CreatedByUserTask: '2',
  /** Plugin background task */
  PluginTask: '3',
} as const;

export type MessageSource = (typeof messageSource)[keyof typeof messageSource];

// Processor processed chunks
export interface Chunk<T extends ContentType> {
  index: number;
  seq_id: number;
  is_finish: boolean;
  message: Message<T>;
}

// Message processed by Processor
export type Message<T extends ContentType, V = unknown> = MessageRaw &
  MessageMentionListFields & {
    bot_id?: string;
    preset_bot?: string;
    index?: number; // Temporary state, ordering of messages in a response
    is_finish?: boolean; // Temporary state that identifies whether the message has been pulled
    /**
     * Content is deserialized
     */
    content_obj: MessageContent<T, V>;
    /**
     * SDK has enabled the enableDebug mode, and each reply message adds debug_messages field, including all chunk messages spit out by the channel
     */
    debug_messages?: ChunkRaw[];
    stream_chunk_buffer?: ChunkRaw[];
    stream_message_buffer?: Message<ContentType>[];
    /**
     * Older interfaces may not have this field; only common display types such as query, answer, notice, etc. are counted.
     * - int64 type, counting starts at "1".
     * - Although I don't think there will be more than Number. MAX_SAFE_INTEGER alone, I still use the big-integer library to handle it.
     * - Do not brush old data, so ① old data ② unconventional messages, the value is "0"
     */
    message_index?: string;
    /**
     * Pre-send message return only
     */
    file_upload_result?: 'success' | 'fail'; // file upload status
    /**
     * Local message status, only pre-sent messages are returned
     */
    local_message_status?: LocalMessageStatus;
    /**
     * Only if the message returns, pull chat history None
     */
    logId?: string; // Chat logId
  };

// The structure of the message sent to the server
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
  draft_mode?: boolean; // Draft bot or online bot
  content_type?: string; // Files files pictures images etc
  regen_message_id?: string; // Retry message id
  local_message_id: string; // The local message_id on the front end is passed back in the extra_info
  chat_history?: Message<ContentType>[]; // Specify the chat context, server level does not drop library
}
// The resume structure sent to the server, the chat type itself is missing, and this issue only supplements resume-related
export interface ResumeMessage {
  conversation_id: string;
  scene?: Scene; // scene value
  resume_message_id?: string; // Continue chatting with the ID required for the scene server level, which is reply_id
  interrupt_message_id?: string; // Interrupted verbose message id
  tool_outputs?: {
    tool_call_id?: string; // Password interrupt tool_call.id in verbose messages
    output?: string; // Geographical location authorization scene transmission longitude and latitude
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
  /** \ @bot function, the bot id mentioned when entering */
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
  // Parameters will be passed through to the chat interface
  extendFiled?: Record<string, unknown>;
  // Password header
  headers?: HeadersInit;
  // Whether to regenerate the message, the default is false
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
  /** jump node */
  JUMP_TO = 'multi_agents_jump_to_agent',
  /** backtracking node */
  BACK_WORD = 'multi_agents_backwards',
  /** long-term memory node */
  LONG_TERM_MEMORY = 'time_capsule_recall',
  /** finish answer*/
  GENERATE_ANSWER_FINISH = 'generate_answer_finish',
  /** Streaming plugin call status */
  STREAM_PLUGIN_FINISH = 'stream_plugin_finish',
  /** knowledge base recall */
  KNOWLEDGE_RECALL = 'knowledge_recall',
  /** Interrupt message: Currently used for geolocation authorization/workflow question pending reply */
  INTERRUPT = 'interrupt',
  /** Hooks call */
  HOOK_CALL = 'hook_call',
}

export enum InterruptToolCallsType {
  FunctionType = 'function', // Tool result reporting
  RequireInfoType = 'require_info', // Required information, such as geographical location
  ReplyMessage = 'reply_message', // Question Node
}

export interface VerboseContent {
  msg_type: VerboseMsgType;
  data: string;
}

export enum FinishReasonType {
  /** Normal answer all over */
  ALL_FINISH = 0,
  /** end of interrupt */
  INTERRUPT = 1,
}

export interface AnswerFinishVerboseData {
  finish_reason?: FinishReasonType;
}
