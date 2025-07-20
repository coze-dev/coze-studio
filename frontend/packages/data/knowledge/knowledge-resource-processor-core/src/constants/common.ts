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
 
/** upload页面url上的type取值 */
export enum UnitType {
  /** 文本格式：本地文档，上传 PDF, TXT, DOCX 格式的本地文件 */
  TEXT_DOC = 'text_doc',
  /** 文本格式：在线数据，自动获取在线网页内容 */
  TEXT_URL = 'text_url',
  /** 文本格式：在线数据，手动获取在线网页内容 */
  TEXT_EXTENSION = 'text_extension',
  /** 文本格式：自定义内容，支持创建&编辑 */
  TEXT_CUSTOM = 'text_custom',
  /** 文本格式：将 Notion 页面和数据库导入到知识库中 */
  TEXT_NOTION = 'text_notion',
  /** 文本格式 将 Google Docs 导入到知识库中 */
  TEXT_GOOGLE_DRIVE = 'text_google_drive',
  /** 文本格式：飞书文档 导入到知识库中 */
  TEXT_FEISHU = 'text_feishu',
  /** 文本格式：公众号 */
  TEXT_WECHAT = 'text_wechat',
  /** 文本格式：Lark文档 导入到知识库中 */
  TEXT_LARK = 'text_lark',
  /** 表格格式：本地文档，上传Excel或者CSV格式的文档 */
  TABLE_DOC = 'table_doc',
  /** 表格格式：API 获取JSON格式API内容 */
  TABLE_API = 'table_api',
  /** 表格格式：自定义 自定义内容，支持创建&编辑 */
  TABLE_CUSTOM = 'table_custom',
  /** 表格格式：将 Google Sheets 导入到知识库中 */
  TABLE_GOOGLE_DRIVE = 'table_google_drive',
  /** 表格格式：将 飞书表格 导入到知识库中 */
  TABLE_FEISHU = 'table_feishu',
  /** 表格格式：将 Lark表格 导入到知识库中 */
  TABLE_LARK = 'table_lark',
  /** 图片格式：本地图片，上传PNG，JPG，JPEG等格式图片 */
  IMAGE_FILE = 'image_file',
  /** 表格格式 */
  TABLE = 'table',
  /** 文本格式 */
  TEXT = 'text',
  /** 图片格式 */
  IMAGE = 'image',
}

/**
 * unit 操作类型
 * upload页面支持以下几种方式
 * - ADD 首次创建
 * - UPDATE 更新数据
 * - INCREMENTAL 增量数据
 * - RESEGMENT 重新切片
 */
export enum OptType {
  RESEGMENT = 'resegment',
  ADD = 'add',
  UPDATE = 'update',
  INCREMENTAL = 'incremental',
}

/** footer 按钮状态 */
export enum FooterBtnStatus {
  DISABLE = 'disable',
  LOADING = 'loading',
  ENABLE = 'enable',
}

/** create unit 全局过程状态。注意与UploadStatus的区别*/
export enum CreateUnitStatus {
  UPLOAD_UNIT = 'uploadUnit',
  GET_TASK_PROGRESS = 'getTaskProGress',
  TASK_FINISH = 'taskFinish',
}

/**
 * UploadStatus 是 upload-unit-file、upload-unit-table组件 上传文件过程的状态
 * 原型来自 import { type FileItemStatus } from '@douyinfe/semi-foundation/lib/es/upload/foundation';
 * FileItemStatus的写法有问题
 */
export enum UploadStatus {
  SUCCESS = 'success',
  UPLOAD_FAIL = 'uploadFail',
  VALIDATE_FAIL = 'validateFail',
  VALIDATING = 'validating',
  UPLOADING = 'uploading',
  WAIT = 'wait',
}

export enum FileNodeType {
  FileNodeTypeFolder = 'folder',
  FileNodeTypeDocument = 'document',
  FileNodeTypeSheet = 'sheet',
}

export enum EntityStatus {
  EntityStatusProcess = 'process',
  EntityStatusSuccess = 'success',
  EntityStatusFail = 'failure',
}

export enum CheckedStatus {
  LOADING = 0,
  NO_AUTH = 1,
  NO_FILE = 2,
  SIMPLE = 3,
  HAD_SEGMENT_RULES = 4,
}
