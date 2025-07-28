// eslint-disable unicorn/filename-case
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

export type Int64 = string | number;

export enum BotTableRWMode {
  /** 单用户模式 */
  LimitedReadWrite = 1,
  /** 只读模式 */
  ReadOnly = 2,
  /** 多用户模式 */
  UnlimitedReadWrite = 3,
  /** Max 边界值 */
  RWModeMax = 4,
}

export enum BotTableStatus {
  /** 初始化（不可用） */
  Init = 0,
  /** 已上线 */
  Online = 1,
  /** 删除 */
  Delete = 2,
  /** 草稿态（未 publish） */
  Draft = 3,
}

export enum FieldItemType {
  /** 文本 */
  Text = 1,
  /** 数字 */
  Number = 2,
  /** 时间 */
  Date = 3,
  /** float */
  Float = 4,
  /** bool */
  Boolean = 5,
}

/** Table model相关常量，结构体定义 */
export enum FieldType {
  /** 文本 */
  Text = 1,
  /** 数字 */
  Number = 2,
  /** 时间 */
  Date = 3,
  /** float */
  Float = 4,
  /** bool */
  Boolean = 5,
}

export enum ImportFileTaskStatus {
  /** 任务初始化 */
  Init = 1,
  /** 任务处理中 */
  Enqueue = 2,
  /** 任务成功 */
  Succeed = 3,
  /** 任务失败 */
  Failed = 4,
}

export enum Language {
  /** 中文 */
  Chinese = 1,
  /** 英文 */
  English = 2,
}

export enum TableType {
  /** 草稿 */
  DraftTable = 1,
  /** 线上 */
  OnlineTable = 2,
}

export interface FieldItem {
  /** 字段名称，用户自定义，可能为中文 */
  name: string;
  desc?: string;
  type: FieldItemType;
  must_required?: boolean;
  /** 字段Id，服务端生成，全局唯一（新增为0） */
  id?: Int64;
  /** 字段名称语言类型 */
  lang?: Language;
  /** 物理字段名，服务端生成，单个table下唯一 */
  physics_name?: string;
  /** 是否主键 */
  primary_key?: boolean;
  /** 字段可见性，1:用户自定义；2:业务定义，对用户可见；3:业务定义，对用户隐藏 */
  visibility?: number;
  /** 在excel文档中使用，映射到excel中对应的列 */
  sequence?: string;
  /** 业务自定义扩展field元数据 */
  map_ext_meta?: Record<string, string>;
}
/* eslint-enable */
