/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface FileData {
  bytes?: Int64;
  file_name?: string;
}

export interface UploadLoopFileRequest {
  /** 文件类型 */
  'Content-Type': string;
  /** 二进制数据 */
  body: Blob;
  Base?: base.Base;
}

export interface UploadLoopFileResponse {
  code?: number;
  msg?: string;
  data?: FileData;
  BaseResp?: base.BaseResp;
}
/* eslint-enable */
