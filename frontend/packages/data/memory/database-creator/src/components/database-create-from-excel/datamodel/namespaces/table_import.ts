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
 
/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as table_base from './table_base';
import * as base from './base';

export type Int64 = string | number;

export interface AddTableRequest {
  /** table schema */
  table: ImportTableInfo;
  /** file source */
  file: FileInfo;
  rw_mode: table_base.BotTableRWMode;
  Base?: base.Base;
}

export interface AddTableResponse {
  /** 相关id. bot_id */
  bot_id: string;
  /** table_id */
  table_id: string;
  /** 表名 */
  table_name: string;
  /** 上传 TableFile 的 task id，用于后期查询使用.
DataModelService 使用 GID 保证 task_id 全局唯一，后续查询时只需要 task_id.
DataModel 服务会记录 table 的 lastTaskID, 查询时可以通过 table_id 查到唯一的
task_id */
  task_id: Int64;
  code: number;
  msg: string;
}

export interface FileInfo {
  /** tos uri */
  tos_uri: string;
  /** Excel 行号 */
  header_row: Int64;
  /** Excel 数据开始行 */
  start_data_row: Int64;
  /** Excel sheet id, 0 for default */
  sheet_id?: number;
}

export interface ImportTableInfo {
  /** table 所属的 bot_id */
  bot_id: string;
  /** 表名 */
  table_name: string;
  /** 表描述 */
  table_desc?: string;
  /** 字段信息 */
  table_meta: Array<table_base.FieldItem>;
  /** 空间ID */
  space_id: string;
}

export interface PreviewTableFileRequest {
  table: ImportTableInfo;
  file: FileInfo;
  Base?: base.Base;
}

export interface PreviewTableFileResponse {
  preview_data?: SheetInfo;
  code: number;
  msg: string;
}

export interface QueryTableFileTaskStatusRequest {
  table_id: string;
  bot_id?: string;
  task_id?: Int64;
  Base?: base.Base;
}

export interface QueryTableFileTaskStatusResponse {
  table_id: string;
  /** filled by server. callers may use it to do some additional business */
  table_name: string;
  /** filled by server. callers may use it to do some additional business */
  bot_id: string;
  /** filled by server. callers may use it to do some additional business */
  task_id: Int64;
  /** 10 for 10%, 100 for 100% */
  progress: Int64;
  status: table_base.ImportFileTaskStatus;
  /** in json format */
  summary: string;
  /** tos url */
  error_detail_url: string;
  code: number;
  msg: string;
}

export interface SheetInfo {
  headers?: Array<string>;
  datas?: Array<Array<string>>;
  total_rows?: Int64;
  preview_rows?: Int64;
}
/* eslint-enable */
