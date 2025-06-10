/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';

export type Int64 = string | number;

export interface AudioConfig {
  /** 房间音频编码格式，AACLC / G711A / OPUS / G722 */
  codec?: string;
}

export interface AudioSpeechData {
  /** 语音的二进制 */
  content?: Blob;
  content_disposition?: string;
  content_type?: string;
}

export interface AudioSpeechRequest {
  /** 必选，合成语音的文本，长度限制 1024 字节（UTF-8编码）。 */
  input?: string;
  /** 必选，音色id */
  voice_id?: string;
  /** 音频编码格式，wav / pcm / ogg_opus / mp3，默认为 mp3 */
  response_format?: string;
  /** 语速，[0.2,3]，默认为1，通常保留一位小数即可 */
  speed?: number;
  /** 采样率，可选值 [8000,16000,22050,24000,32000,44100,48000]，默认 24000 */
  sample_rate?: number;
}

export interface AudioSpeechResponse {
  code?: number;
  msg?: string;
  data?: AudioSpeechData;
}

export interface AudioTranscriptionsData {
  /** 语音对应的文本 */
  text?: string;
}

export interface AudioTranscriptionsRequest {
  /** 文件类型 */
  'Content-Type': string;
  /** 二进制数据 */
  body: Blob;
}

export interface AudioTranscriptionsResponse {
  code?: number;
  msg?: string;
  data?: AudioTranscriptionsData;
}

export interface CloneVoiceData {
  /** 唯一音色代号 */
  voice_id?: string;
}

export interface CloneVoiceRequest {
  /** 音频格式支持：wav、mp3、ogg、m4a、aac、pcm，其中pcm仅支持24k 单通道目前限制单文件上传最大10MB，每次最多上传1个音频文件 */
  audio?: common.AudioInfo;
  /** 可以让用户按照该文本念诵，服务会对比音频与该文本的差异。若差异过大会返回1109 WERError */
  text?: string;
  language?: string;
  /** 如果有，则使用此 voice_id 进行训练覆盖，否则使用新的 voice_id 进行训练 */
  voice_id?: string;
  /** 音色名 */
  voice_name?: string;
  /** 如果传入会基于该文本生成预览音频，否则使用默认的文本"你好，我是你的专属AI克隆声音，希望未来可以一起好好相处哦" */
  preview_text?: string;
  /** 克隆音色保存的空间，默认在个人空间 */
  space_id?: string;
  /** 音色描述 */
  description?: string;
}

export interface CloneVoiceResponse {
  code?: number;
  msg?: string;
  data?: CloneVoiceData;
}

export interface CreateRoomData {
  token?: string;
  uid?: string;
  room_id?: string;
  /** 火山 rtc appid */
  app_id?: string;
}

export interface CreateRoomRequest {
  /** 必选参数，Bot id */
  bot_id?: string;
  /** 可选参数， conversation_id，不传会默认创建一个，见【创建会话】接口 */
  conversation_id?: string;
  /** 可选参数，音色 id，不传默认为 xxxy音色 */
  voice_id?: string;
  /** 可选参数，room 的配置 */
  config?: RoomConfig;
  /** 可选参数，标识当前与智能体的用户，由使用方自行定义、生成与维护。uid 用于标识对话中的不同用户，不同的 uid，其对话的数据库等对话记忆数据互相隔离。如果不需要用户数据隔离，可以不传此参数。 */
  uid?: string;
  /** 可选参数，工作流 id */
  workflow_id?: string;
}

export interface CreateRoomResponse {
  code?: number;
  msg?: string;
  data?: CreateRoomData;
}

export interface ListVoiceData {
  voice_list?: Array<common.OpenAPIVoiceData>;
  has_more?: boolean;
}

export interface ListVoiceRequest {
  /** 是否过滤系统音色，默认不过滤 */
  filter_system_voice?: boolean;
  /** 大小模型类型，big 是大模型，small 是小模型 默认都返回 */
  model_type?: string;
  /** 默认是 1 */
  page_num?: number;
  /** 最大 100, 默认 100 */
  page_size?: number;
}

export interface ListVoiceResponse {
  code?: number;
  msg?: string;
  data?: ListVoiceData;
}

export interface RoomConfig {
  /** 房间视频配置 */
  video_config?: VideoConfig;
  /** 房间音频配置 */
  audio_config?: AudioConfig;
}

export interface VideoConfig {
  /** 房间视频编码格式，H264 / BYTEVC1 */
  codec?: string;
  /** 房间视频流类型, 支持 main/screen, main: 主流。包括：「由摄像头/麦克风通过内部采集机制，采集到的流。」和「通过自定义采集，采集到的流。」，screen：屏幕流 */
  stream_video_type?: string;
}
/* eslint-enable */
