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
 
export type UploadEventName = 'complete' | 'error' | 'progress';
export interface UploadResult {
  // 图片 & 文件 uri资源标识，用于换取url·

  Uri?: string;
  // 图片 & 文件 url

  Url?: string;
  // 图片宽度

  ImageWidth?: number;
  // 图片高度

  ImageHeight?: number;
}

export type FileType = 'object' | 'image' | undefined;

export interface BaseEventInfo {
  type: 'success' | 'error'; // 当前任务状态，成功／失败
  // 当前状态的描述（随着生命周期不断变化）
  extra: {
    error?: unknown;
    errorCode?: number;
    message: string;
  };
}
export interface CompleteEventInfo extends BaseEventInfo {
  // 上传结果，注意对于不同 type 来说结构不一样，
  uploadResult: UploadResult;
}
export interface ProgressEventInfo extends BaseEventInfo {
  // 当前上传总体进度百分比（％）
  percent: number;
}
export interface EventPayloadMaps {
  complete: CompleteEventInfo;
  progress: ProgressEventInfo;
  error: BaseEventInfo;
}

export interface UploadConfig {
  file: File;
  fileType: 'object' | 'image' | undefined;
}

export interface UploadPluginProps {
  file: File;
  type: FileType;
}

// 上传插件构造函数
export interface UploadPluginConstructor<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  new (props: UploadPluginProps & P): UploadPluginInterface;
}

// 上传插件接口实现
export interface UploadPluginInterface<
  M extends EventPayloadMaps = EventPayloadMaps,
> {
  pause: () => void;
  cancel: () => void;
  on: <T extends keyof M>(eventName: T, callback: (info: M[T]) => void) => void;
}
export interface UploadAuthTokenInfo {
  access_key_id?: string;
  secret_access_key?: string;
  session_token?: string;
  expired_time?: string;
  current_time?: string;
}
export interface GetUploadAuthTokenData {
  service_id?: string;
  upload_path_prefix?: string;
  auth?: UploadAuthTokenInfo;
  upload_host?: string;
}
