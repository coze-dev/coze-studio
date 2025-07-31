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
   * Tt-uploader logic,
   * The schema needs to be dynamically obtained according to the deployment environment of the current user
   * Schema values are only available in HTTPS and HTTP.
   * The SDK consumes schema internally, but there is no type definition, which is compatible with specialization.
   */
  schema?: string;

  useFileExtension?: boolean;
  useServerCurrentTime?: boolean;
  bizType?: string;
  getSliceFunc?: (fileSize: number) => number;
  uploadSliceCount?: number;
  uploadHttpMethod?: string;
  // upload timeout
  uploadTimeout?: number;
  // Upload gateway timeout
  gatewayTimeout?: number;
  // Skip download, only video upload is supported.
  skipDownload?: boolean;
  // Skip getting meta information, only picture upload support
  skipMeta?: boolean;
  noLog?: boolean;
  // multi-instance identification
  instanceId?: string;
  // Passing appId and userId through
  openExperiment?: boolean;
  // Client side encryption
  clientEncrypt?: boolean;
  // Skip 1005, only support ImageX
  skipCommit?: boolean;
  // Whether to enable breakpoint continuation
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
  // Client side encryption
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
  // File start upload timestamp, milliseconds
  startTime: number;
  // File completion upload timestamp
  endTime: number;
  // Phase start timestamp
  stageStartTime: number;
  // Phase completion timestamp
  stageEndTime: number;
  // Phase duration, calculated as stageEndTime - stageStartTime
  duration: number;
  // Current video file size
  fileSize: number;
  // The key of the current video file (automatically generated when addFile)
  key: string;
  // Stored file ID (preUpload)
  oid: string;
  // Current Upload Overall Progress Percentage (%)
  percent: number;
  // Upload the required signature information (preUpload)
  signature: string;
  // The size of each sharding (obtained by crc32)
  sliceLength: number;
  // The current lifecycle, if it is an unsupported browser, the value is'browserError'
  stage: string;
  // File upload running status, 1 means running, 2 means canceling, and 3 means pausing.
  status: 1 | 2 | 3;
  // Task queue instance
  task: any;
  type: 'success' | 'error'; // Current task status, success/failure
  // Upload the required uploadID (get initUploadID)
  uploadID: string;
  // Description of the current state (constantly changing with the lifecycle)
  extra: {
    error?: any;
    errorCode?: number;
    message: string;
  };
}

export interface UploadResultVideoMeta {
  // Video duration in seconds
  Duration: number;
  // video width
  Width: number;
  // video height
  Height: number;
  // video format
  Format: string;
  // Video bit rate
  Bitrate: number;
  // file type
  FileType: string;
  // Video file size
  Size: number;
  // Video file md5 value, Note: Since MD5 needs to be downloaded and calculated, it consumes a large amount of network resources and computing resources, and most users do not use it. By default, MD5 is only returned when it is less than 100M and not an M3U8 file. Strong dependence on MD5 needs to be contacted for manual configuration.
  Md5: string;
  // The video source file is URI in tos, get the video broadcast address, please do not use this way to access
  Uri: string;
}

/**
 * Upload results, there are differences for different file types, which can be handled with paradigms here, but it is a bit cumbersome.
 * For convenience, all the attributes are directly defined.
 */
export interface UploadResult {
  // video
  // =======
  // video VID
  Vid?: string;
  // Video meta information, returned when a configuration for obtaining meta information is added
  VideoMeta?: UploadResultVideoMeta;
  // Cover image URI, returned when a configuration for capturing cover information is added
  PosterUri?: string;

  // Pictures & Files
  // ==========
  // The URI of the source file in tos, in the format bucket/oid. Consistent with ImageUri for images
  Uri?: string;

  // picture
  // ==========
  // Image URI in bucket/oid format
  ImageUri?: string;
  // image width
  ImageWidth?: number;
  // image height
  ImageHeight?: number;
  // The md5 value of the image data
  ImageMd5?: string;
  // File name, consistent with the oid section in ImageUri
  FileName?: string;

  // file
  // ==========
  // File meta information, returned when a configuration for obtaining meta information is added
  ObjectMeta?: {
    Md5: string;
    Uri: string;
  };
}

export type ProgressEventInfo = BaseEventInfo;

export type StreamProgressEventInfo = BaseEventInfo;
export type ErrorEventInfo = BaseEventInfo;

export interface CompleteEventInfo extends BaseEventInfo {
  // Upload the results, note that the structure is different for different types,
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
