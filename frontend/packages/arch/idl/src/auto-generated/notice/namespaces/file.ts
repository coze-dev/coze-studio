/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface UploadFileData {
  upload_url?: string;
  upload_uri?: string;
}

export interface UploadFileRequest {
  /** 文件类型，后缀 */
  file_type?: string;
  data?: string;
}

export interface UploadFileResponse {
  code?: number;
  msg?: string;
  data?: UploadFileData;
}
/* eslint-enable */
