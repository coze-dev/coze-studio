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
 
export interface STSToken {
  AccessKeyId: string;
  SecretAccessKey: string;
  SessionToken: string;
  ExpiredTime: string;
  CurrentTime: string;
}

export interface ObjectSync {
  ChannelSource: string;
  ChannelDest: string;
  DataType: string;
  BizID: string;
}

export interface Action {
  name:
    | 'GetMeta'
    | 'StartWorkflow'
    | 'Snapshot'
    | 'Encryption'
    | 'AddOptionInfo'
    | 'CaptionUpload';
  input?: any;
}

export interface VideoConfig {
  spaceName: string;
  processAction?: Action[];
}

export interface ImageConfig {
  serviceId: string;
  processAction?: Action[];
}

export interface ObjectConfig {
  serviceId?: string;
  spaceName?: string;
  processAction?: Action[];
}

export interface Config {
  userId: string;
  appId: number;
  stsToken?: STSToken;
  region?:
    | 'cn-north-1'
    | 'us-east-1'
    | 'ap-singapore-1'
    | 'us-east-red'
    | 'boe'
    | 'boei18n'
    | 'US-TTP'
    | 'gcp';
  videoHost?: string;
  videoFallbackHost?: string;
  imageHost?: string;
  imageFallbackHost?: string;
  videoConfig?: VideoConfig;
  imageConfig?: ImageConfig;
  objectConfig?: ObjectConfig;
  testHost?: string;
  /**
   * tt-uploader 逻辑，
   * 需要根据当前用户的部署环境动态获取schema
   * schema 值只会有 https 和 http 两种。
   * sdk 内部消费了 schema，但是没有类型定义出来，这边特化兼容。
   */
  schema?: string;

  useFileExtension?: boolean;
  useServerCurrentTime?: boolean;
  bizType?: string;
  getSliceFunc?: (fileSize: number) => number;
  uploadSliceCount?: number;
  uploadHttpMethod?: string;
  // 上传超时时间
  uploadTimeout?: number;
  // 上传网关超时时间
  gatewayTimeout?: number;
  // 跳过下载，仅视频上传支持
  skipDownload?: boolean;
  // 跳过获取 meta 信息，仅图片上传支持
  skipMeta?: boolean;
  noLog?: boolean;
  // 多实例标识
  instanceId?: string;
  // 透传appId和userId
  openExperiment?: boolean;
  // 客户端加密
  clientEncrypt?: boolean;
  // 跳过1005，仅支持ImageX
  skipCommit?: boolean;
  // 是否启用断点续传
  enableDiskBreakpoint?: boolean;
}

export interface UpdateOptions {
  userId?: string;
  appId?: number;
  stsToken?: STSToken;
  region?:
    | 'cn-north-1'
    | 'us-east-1'
    | 'ap-singapore-1'
    | 'us-east-red'
    | 'boe'
    | 'boei18n'
    | 'US-TTP'
    | 'gcp';
  videoHost?: string;
  imageHost?: string;
  videoConfig?: VideoConfig;
  imageConfig?: ImageConfig;

  useFileExtension?: boolean;
  useServerCurrentTime?: boolean;
  getSliceFunc?: (fileSize: number) => number;
  uploadSliceCount?: number;
  uploadHttpMethod?: string;
  openExperiment?: boolean;
  // 客户端加密
  clientEncrypt?: boolean;
}

export interface FileOption {
  file: Blob;
  stsToken: STSToken;
  type?: 'video' | 'image' | 'object';
  callbackArgs?: string;
  testHost?: string;
  objectSync?: ObjectSync;
  needExactFormat?: boolean;
  storeKey?: string | Array<string>;
  useDirectUpload?: boolean;
  serviceType?: 'vod' | 'imagex';
}

export interface ImageFileOption {
  file: Blob | Blob[];
  stsToken: STSToken;
  type?: 'image';
  callbackArgs?: string;
  storeKey?: string | Array<string>;
  useDirectUpload?: boolean;
}

export interface StartOptions {
  selectRoute?: boolean;
  clientIp?: string;
  selectRouteTimeout?: number;
  selectRouteCacheTime?: number;
  selectRouteFileSize?: number;
}

export interface StreamTaskOption {
  stsToken: STSToken;
  type?: 'video';
  fileSize?: number;
}

export interface StreamSliceOption {
  fileSlice: Blob;
  index: number;
}

interface BaseEventInfo {
  // 文件开始上传的时间戳，毫秒
  startTime: number;
  // 文件完成上传的时间戳
  endTime: number;
  // 阶段开始时间戳
  stageStartTime: number;
  // 阶段完成时间戳
  stageEndTime: number;
  // 阶段持续时间，计算公式：stageEndTime - stageStartTime
  duration: number;
  // 当前视频文件大小
  fileSize: number;
  // 当前视频文件的key（addFile时自动生成）
  key: string;
  // 存储的文件ID （preUpload 获取）
  oid: string;
  // 当前上传总体进度百分比（％）
  percent: number;
  // 上传所需的签名信息（preUpload 获取）
  signature: string;
  // 每一个分片的size（crc32获取）
  sliceLength: number;
  // 当前所处生命周期，如果是不支持的浏览器，则该值为'browserError'
  stage: string;
  // 文件上传运行状态，1 代表正在运行 2 代表取消运行 3 代表暂停运行
  status: 1 | 2 | 3;
  // task队列实例
  task: any;
  type: 'success' | 'error'; // 当前任务状态，成功／失败
  // 上传所需的uploadID（initUploadID 获取）
  uploadID: string;
  // 当前状态的描述（随着生命周期不断变化）
  extra: {
    error?: any;
    errorCode?: number;
    message: string;
  };
}

export interface UploadResultVideoMeta {
  // 视频时长，单位：秒
  Duration: number;
  // 视频宽度
  Width: number;
  // 视频高度
  Height: number;
  // 视频格式
  Format: string;
  // 视频码率
  Bitrate: number;
  // 文件类型
  FileType: string;
  // 视频文件大小
  Size: number;
  // 视频文件md5值，注：由于MD5需要下载并计算，消耗的网络资源和计算资源较大，而用户大多用不到，默认只有小于100M并且不为M3U8文件时才返回MD5，对MD5强依赖需要联系进行人工配置
  Md5: string;
  // 视频源文件在tos中的uri，获取视频播放地址请不要使用这种方式访问
  Uri: string;
}

/**
 * 上传结果，对于不同的文件类型存在差异，这里可以用范型处理，但是有点麻烦。
 * 为了方便，直接把所以属性都定义出来。
 */
export interface UploadResult {
  // 视频
  // =======
  // 视频 VID
  Vid?: string;
  // 视频meta信息，当添加有获取meta信息的配置时返回
  VideoMeta?: UploadResultVideoMeta;
  // 封面图uri，当添加有截取封面信息的配置时返回
  PosterUri?: string;

  // 图片 & 文件
  // ==========
  // 源文件在tos中的uri，格式为bucket/oid。对于图片来说和 ImageUri 一致
  Uri?: string;

  // 图片
  // ==========
  // 图片的uri，格式为bucket/oid
  ImageUri?: string;
  // 图片宽度
  ImageWidth?: number;
  // 图片高度
  ImageHeight?: number;
  // 图片数据的md5值
  ImageMd5?: string;
  // 文件名，与ImageUri中的oid部分一致
  FileName?: string;

  // 文件
  // ==========
  // 文件meta信息，当添加有获取meta信息的配置时返回
  ObjectMeta?: {
    Md5: string;
    Uri: string;
  };
}

export type ProgressEventInfo = BaseEventInfo;

export type StreamProgressEventInfo = BaseEventInfo;
export type ErrorEventInfo = BaseEventInfo;

export interface CompleteEventInfo extends BaseEventInfo {
  // 上传结果，注意对于不同 type 来说结构不一样，
  uploadResult: UploadResult;
}

export interface EventPayloadMaps {
  complete: CompleteEventInfo;
  progress: ProgressEventInfo;
  'stream-progress': StreamProgressEventInfo;
  error: ErrorEventInfo;
}

type UploadEventName = 'complete' | 'error' | 'progress' | 'stream-progress';

export interface BytedUploader {
  constructor: (config: Config) => void;
  setOption: (options: UpdateOptions) => void;
  addFile: (fileOption: FileOption) => string;
  addImageFile: (imageFileOption: ImageFileOption) => string;
  start: (key?: string, startOptions?: StartOptions) => void;
  pause: (key?: string) => void;
  cancel: (key?: string) => void;
  removeFile: (key?: string) => void;
  refreshSTSToken: (stsToken: STSToken) => void;

  addStreamUploadTask: (streamOption: StreamTaskOption) => string;
  addStreamSlice: (streamSlice: StreamSliceOption) => void;
  completeStreamUpload: () => void;

  on: <T extends UploadEventName>(
    eventName: T,
    callback: (info: EventPayloadMaps[T]) => void,
  ) => void;
  once: <T extends UploadEventName>(
    eventName: T,
    callback: (info: EventPayloadMaps[T]) => void,
  ) => void;
  removeListener: <T extends UploadEventName>(
    eventName: T,
    callback: (info: EventPayloadMaps[T]) => void,
  ) => void;
  removeAllListeners: (eventName: UploadEventName) => void;
}
