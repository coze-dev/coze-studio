/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';

export type Int64 = string | number;

export interface AudioSpeechData {
  /** base64 编码后的语音二进制数据 */
  bas464_content?: Blob;
  /** 播放的链接 */
  audio_url?: string;
  /** 合成的音频资源 */
  audio_uri?: string;
}

export interface AudioSpeechRequest {
  /** 必选，音色id */
  voice_id: string;
  /** 必选，合成语音的文本，长度限制 1024 字节（UTF-8编码）。 */
  input: string;
  /** 音频编码格式，wav / pcm / ogg_opus / mp3，默认为 mp3 */
  response_format?: string;
  /** 1 返回的数据类型，默认是返回生成 base64 后的音频数据，也可以指定返回直接可以播放的音频 URL */
  response_data_type?: common.AudioSpeechRespType;
  /** 语速，[0.2,3]，默认为1，通常保留一位小数即可 */
  speed?: number;
}

export interface AudioSpeechResponse {
  code: number;
  message: string;
  data?: AudioSpeechData;
}

export interface AudioTranscriptionsData {
  text?: string;
}

export interface AudioTranscriptionsRequest {
  'Content-Type'?: string;
  Body?: Blob;
}

export interface AudioTranscriptionsResponse {
  code: number;
  message: string;
  data?: AudioTranscriptionsData;
}

export interface CheckCreateVoiceData {
  /** 是否有权限 */
  has_perm?: boolean;
  /** 可创建的音色数量 */
  total_quota?: number;
  /** 已经使用的音色数量 */
  used_quota?: number;
}

export interface CheckCreateVoiceRequest {}

export interface CheckCreateVoiceResponse {
  code: number;
  message: string;
  data?: CheckCreateVoiceData;
}

export interface CloneVoiceData {
  voice?: common.VoiceDetail;
}

export interface CloneVoiceRequest {
  voice_id: string;
  /** 音频格式，pcm、m4a mp3 wav */
  audio_format: string;
  /** max 10M  base64 后的二进制音频字节 */
  audio_bytes: string;
  compare_text?: string;
  preview_text?: string;
  space_id?: string;
}

export interface CloneVoiceResponse {
  code: number;
  message: string;
  data?: CloneVoiceData;
}

export interface CreateVoiceData {
  voice_id?: string;
}

export interface CreateVoiceRequest {
  voice_name: string;
  space_id: string;
  voice_desc?: string;
  icon_uri?: string;
  /** 语种，默认是 zh */
  language_code?: string;
}

export interface CreateVoiceResponse {
  code: number;
  message: string;
  data?: CreateVoiceData;
}

export interface DeleteVoiceRequest {
  voice_id: string;
}

export interface DeleteVoiceResponse {
  code: number;
  message: string;
}

export interface GetVoiceMenuData {
  /** 场景 */
  scenes?: Array<string>;
  /** 支持的语言 */
  languages?: Array<common.LanguageInfo>;
  /** 性别 */
  genders?: Array<string>;
  /** 年龄段 */
  ages?: Array<string>;
}

export interface GetVoiceMenuRequest {}

export interface GetVoiceMenuResponse {
  code: number;
  message: string;
  data?: GetVoiceMenuData;
}

export interface MGetVoiceData {
  voices?: Array<common.VoiceDetail>;
  has_more?: boolean;
}

export interface MGetVoiceRequest {
  voice_ids?: Array<string>;
  /** 音色名称前缀 */
  prefix_voice_name?: string;
  /** 语句区分 */
  language_code?: string;
  /** 场景 */
  scene?: string;
  /** 自己创建 */
  self_created?: boolean;
  /** 指定查询的音色 1 系统音色 2 用户音色  不传就是所有音色 */
  voice_type?: common.VoiceType;
  /** 空间id  不传 spaceID/voiceID 的时候，voiceType 必须指定系统音色 */
  space_id?: string;
  /** 音色状态 */
  voice_state?: common.VoiceState;
  /** 性别 */
  gender?: string;
  /** 年龄段 */
  age?: string;
  page_index?: number;
  page_size?: number;
}

export interface MGetVoiceResponse {
  code: number;
  message: string;
  data?: MGetVoiceData;
}

export interface PurchaseVoiceClonePackageRequest {
  number: Int64;
  coze_account_id: string;
}

export interface PurchaseVoiceClonePackageResponse {
  code: number;
  message: string;
}

export interface UpdateVoiceData {}

export interface UpdateVoiceRequest {
  voice_id: string;
  voice_name?: string;
  voice_desc?: string;
  icon_uri?: string;
  /** 语种，默认是 zh */
  language_code?: string;
}

export interface UpdateVoiceResponse {
  code: number;
  message: string;
  data?: UpdateVoiceData;
}

export interface VoiceFeatureGatewayData {
  /** 音色功能开关 */
  enable?: boolean;
  /** 音色克隆功能开关 */
  voice_clone_enable?: boolean;
}

export interface VoiceFeatureGatewayRequest {}

export interface VoiceFeatureGatewayResponse {
  code: number;
  message: string;
  data?: VoiceFeatureGatewayData;
}
/* eslint-enable */
