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
  // Image & file URI resource ID, used in exchange for url ·

  Uri?: string;
  // Image & file url

  Url?: string;
  // image width

  ImageWidth?: number;
  // image height

  ImageHeight?: number;
}

export type FileType = 'object' | 'image' | undefined;

export interface BaseEventInfo {
  type: 'success' | 'error'; // Current task status, success/failure
  // Description of the current state (constantly changing with the lifecycle)
  extra: {
    error?: unknown;
    errorCode?: number;
    message: string;
  };
}
export interface CompleteEventInfo extends BaseEventInfo {
  // Upload the results, note that the structure is different for different types,
  uploadResult: UploadResult;
}
export interface ProgressEventInfo extends BaseEventInfo {
  // Current Upload Overall Progress Percentage (%)
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

// Upload plugin constructor
export interface UploadPluginConstructor<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  new (props: UploadPluginProps & P): UploadPluginInterface;
}

// Upload plug-in interface implementation
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
