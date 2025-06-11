/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum AudioSpeechRespType {
  /** 返回base64 编码后的音频数据 */
  Base64Data = 1,
  /** 返回可播放的 URL 链接 */
  URL = 2,
}

export enum CreateRoomScene {
  Store = 1,
  /** 调试台 */
  Debug = 2,
  /** OpenAPI 场景 */
  OpenAPI = 3,
  /** 模板场景 */
  Template = 4,
}

export enum Language {
  zh = 0,
  en = 1,
  ja = 2,
  es = 3,
  id = 4,
  pt = 5,
}

export enum ModelType {
  BigModel = 0,
  SmallModel = 1,
}

export enum RealtimeScene {
  /** 默认场景 */
  ExternalRTCOpenAPI = 0,
  /** 内场商店 */
  InteralMarketplace = 1,
  /** 内场 debug */
  InternalDebug = 2,
}

export enum VoiceState {
  /** 初始态, 未克隆音色 */
  Init = 0,
  /** 音色克隆好可使用 */
  Cloned = 10,
  /** 音色已删除 */
  Deleted = 20,
  /** 待分配音色中 */
  Pending = 30,
}

export enum VoiceType {
  /** 系统音色 */
  SystemVoice = 1,
  /** 用户音色 */
  UserVoice = 2,
}

export interface AudioInfo {
  /** 音频格式，pcm、m4a必传，其余可选 */
  format?: string;
  /** max 10M  二进制音频字节 */
  audio_bytes?: Blob;
}

export interface LanguageInfo {
  language_code?: string;
  language_name?: string;
}

/** OpenAPI 场景的 DTO */
export interface OpenAPIVoiceData {
  /** 唯一音色代号 */
  voice_id?: string;
  /** 音色名 */
  name?: string;
  /** 是否系统音色 */
  is_system_voice?: boolean;
  /** 音色预览文本 */
  preview_text?: string;
  /** 音色预览音频 */
  preview_audio?: string;
  /** 语言名 */
  language_name?: string;
  /** 语言代号 */
  language_code?: string;
  /** 剩余训练次数 */
  available_training_times?: number;
  speaker_id?: string;
  /** 模型类型 */
  model_type?: string;
  /** 创建时间unix时间戳 */
  create_time?: number;
  /** 更新时间unix时间戳 */
  update_time?: number;
}

export interface UserInfo {
  id?: string;
  name?: string;
  nickname?: string;
  avatar_url?: string;
}

/** RPC 以及 CozeAPI 场景的 DTO */
export interface VoiceDetail {
  voice_id: string;
  space_id?: string;
  voice_name?: string;
  voice_desc?: string;
  icon_url?: string;
  /** 总共可以训练次数 */
  total_training_times?: number;
  /** 剩余训练次数 */
  available_training_times?: number;
  /** 音色预览文本 */
  preview_text?: string;
  /** 音色预览音频 */
  preview_audio?: string;
  /** 语言名 */
  language_name?: string;
  /** 语言代号 */
  language_code?: string;
  /** 使用场景 */
  scene?: string;
  /** 是否为系统音色 */
  is_system_voice?: boolean;
  /** 创建人信息 */
  create_user_info?: UserInfo;
  speaker_id?: string;
  /** 是否复刻过 */
  state?: VoiceState;
  vol_account_id?: string;
  icon_uri?: string;
  /** 最后一次克隆时间，如果没有复刻则当前值为空 */
  last_clone_time_unix?: number;
  /** 创建时间unix时间戳 */
  create_time?: number;
  /** 更新时间unix时间戳 */
  update_time?: number;
  /** Coze 配置ID, only for Coze */
  configuration_id?: Int64;
  /** 模型的类型 */
  model_type?: ModelType;
  /** 模型提供方 */
  model_provider?: string;
}
/* eslint-enable */
