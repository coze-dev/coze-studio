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

import * as bot_common from './../app/bot_common';
export { bot_common };
import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
export interface CommonUploadRequest {
  ByteData?: Blob,
  uploadID?: string,
  partNumber?: string,
}
export interface Error {
  code: number,
  error: string,
  error_code: number,
  message: string,
}
export interface Payload {
  hash: string,
  key: string,
  uploadID: string,
}
export interface CommonUploadResponse {
  Version: string,
  success: number,
  error: Error,
  payload: Payload,
}
export interface ApplyUploadActionRequest {
  Action?: string,
  Version?: string,
  ServiceId?: string,
  FileExtension?: string,
  FileSize?: string,
  s?: string,
  ByteData?: Blob,
}
export interface ResponseMetadata {
  RequestId: string,
  Action: string,
  Version: string,
  Service: string,
  Region: string,
}
export interface StoreInfo {
  StoreUri: string,
  Auth: string,
  UploadID: string,
}
export interface UploadAddress {
  StoreInfos: StoreInfo[],
  UploadHosts: string[],
  UploadHeader?: {
    [key: string | number]: string
  },
  SessionKey: string,
  Cloud: string,
}
export interface UploadNode {
  StoreInfos: StoreInfo[],
  UploadHost: string,
  UploadHeader?: {
    [key: string | number]: string
  },
  SessionKey: string,
}
export interface InnerUploadAddress {
  UploadNodes: UploadNode[]
}
export interface UploadResult {
  Uri: string,
  UriStatus: number,
}
export interface PluginResult {
  FileName: string,
  SourceUri: string,
  ImageUri: string,
  ImageWidth: number,
  ImageHeight: number,
  ImageMd5: string,
  ImageFormat: string,
  ImageSize: number,
  FrameCnt: number,
}
export interface ApplyUploadActionResult {
  UploadAddress?: UploadAddress,
  FallbackUploadAddress?: UploadAddress,
  InnerUploadAddress?: InnerUploadAddress,
  RequestId?: string,
  SDKParam?: string,
  Results?: UploadResult[],
  PluginResult?: PluginResult[],
}
export interface ApplyUploadActionResponse {
  ResponseMetadata: ResponseMetadata,
  Result: ApplyUploadActionResult,
}
export interface RecordFileInfoRequest {
  FileURI: string,
  FileName: string,
  FileSize?: string,
  FileExtension?: string,
}
export interface RecordFileInfoResponse {}
export const CommonUpload = /*#__PURE__*/createAPI<CommonUploadRequest, CommonUploadResponse>({
  "url": "/api/common/upload/*tos_uri",
  "method": "POST",
  "name": "CommonUpload",
  "reqType": "CommonUploadRequest",
  "reqMapping": {
    "raw_body": [],
    "query": ["uploadID", "partNumber"]
  },
  "resType": "CommonUploadResponse",
  "schemaRoot": "api://schemas/idl_upload_upload",
  "service": "upload"
});
export const ApplyUploadAction = /*#__PURE__*/createAPI<ApplyUploadActionRequest, ApplyUploadActionResponse>({
  "url": "/api/common/upload/apply_upload_action",
  "method": "POST",
  "name": "ApplyUploadAction",
  "reqType": "ApplyUploadActionRequest",
  "reqMapping": {
    "query": ["Action", "Version", "ServiceId", "FileExtension", "FileSize", "s"],
    "raw_body": []
  },
  "resType": "ApplyUploadActionResponse",
  "schemaRoot": "api://schemas/idl_upload_upload",
  "service": "upload"
});
export const RecordFileInfo = /*#__PURE__*/createAPI<RecordFileInfoRequest, RecordFileInfoResponse>({
  "url": "/api/common/record_file_info",
  "method": "POST",
  "name": "RecordFileInfo",
  "reqType": "RecordFileInfoRequest",
  "reqMapping": {
    "body": ["FileURI", "FileName", "FileSize", "FileExtension"]
  },
  "resType": "RecordFileInfoResponse",
  "schemaRoot": "api://schemas/idl_upload_upload",
  "service": "upload"
});