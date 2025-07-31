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
  /** Related id bot_id */
  bot_id: string;
  /** table_id */
  table_id: string;
  /** table name */
  table_name: string;
  /** Upload the task id of TableFile for later query use.
DataModelService uses GID to ensure that task_id globally unique, and subsequent queries only require task_id.
The DataModel service will record the lastTaskID of the table, which can be found by table_id when querying
task_id */
  task_id: Int64;
  code: number;
  msg: string;
}

export interface FileInfo {
  /** tos uri */
  tos_uri: string;
  /** Excel line number */
  header_row: Int64;
  /** Excel data start line */
  start_data_row: Int64;
  /** Excel sheet id, 0 for default */
  sheet_id?: number;
}

export interface ImportTableInfo {
  /** Table belongs to bot_id */
  bot_id: string;
  /** table name */
  table_name: string;
  /** table description */
  table_desc?: string;
  /** Field information */
  table_meta: Array<table_base.FieldItem>;
  /** Space ID */
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
