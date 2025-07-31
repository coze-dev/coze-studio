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

/** The type value on the upload page url */
export enum UnitType {
  /** Text format: local documents, upload PDF, TXT, DOCX local files */
  TEXT_DOC = 'text_doc',
  /** Text format: online data, automatically captures online web content */
  TEXT_URL = 'text_url',
  /** Text format: online data, manual access to online web content */
  TEXT_EXTENSION = 'text_extension',
  /** Text format: custom content, support for creation & editing */
  TEXT_CUSTOM = 'text_custom',
  /** Text Format: Import Notion pages and databases into the knowledge base */
  TEXT_NOTION = 'text_notion',
  /** Text formatting to import Google Docs into the Knowledge Base */
  TEXT_GOOGLE_DRIVE = 'text_google_drive',
  /** Text format: Feishu document, imported into the knowledge base */
  TEXT_FEISHU = 'text_feishu',
  /** Text format: official account */
  TEXT_WECHAT = 'text_wechat',
  /** Text format: Lark document, imported into the knowledge base */
  TEXT_LARK = 'text_lark',
  /** Table format: local document, upload Excel or CSV format document */
  TABLE_DOC = 'table_doc',
  /** Table format: API fetches API content in JSON format */
  TABLE_API = 'table_api',
  /** Table format: custom, custom content, support for creation & editing */
  TABLE_CUSTOM = 'table_custom',
  /** Table Format: Import Google Sheets into the Knowledge Base */
  TABLE_GOOGLE_DRIVE = 'table_google_drive',
  /** Table format: Import the Feishu table into the knowledge base */
  TABLE_FEISHU = 'table_feishu',
  /** Table format: Import Lark tables into the knowledge base */
  TABLE_LARK = 'table_lark',
  /** Image format: local image, upload PNG, JPG, JPEG and other format images */
  IMAGE_FILE = 'image_file',
  /** table format */
  TABLE = 'table',
  /** text format */
  TEXT = 'text',
  /** image format */
  IMAGE = 'image',
}

/**
 * Unit operation type
 * Upload page supports the following ways
 * - ADD created for the first time
 * - UPDATE data
 * - INCREMENTAL INCREMENTAL DATA
 * - RESEGMENT
 */
export enum OptType {
  RESEGMENT = 'resegment',
  ADD = 'add',
  UPDATE = 'update',
  INCREMENTAL = 'incremental',
}

/** Footer button status */
export enum FooterBtnStatus {
  DISABLE = 'disable',
  LOADING = 'loading',
  ENABLE = 'enable',
}

/** Create unit global process state. Note the difference with UploadStatus*/
export enum CreateUnitStatus {
  UPLOAD_UNIT = 'uploadUnit',
  GET_TASK_PROGRESS = 'getTaskProGress',
  TASK_FINISH = 'taskFinish',
}

/**
 * UploadStatus is the upload-unit-file, upload-unit-table components, the status of the upload file process
 * Prototype from import {type FileItemStatus} from '@douyinfe/semi-foundation/lib/es/upload/foundation';
 * There is a problem with the writing of FileItemStatus
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
