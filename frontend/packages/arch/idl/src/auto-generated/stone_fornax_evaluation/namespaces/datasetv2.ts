/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum ContentType {
  /** 基础类型 */
  Text = 1,
  Image = 2,
  Audio = 3,
  Video = 4,
  /** 图文混排 */
  MultiPart = 100,
}

export enum DatasetCategory {
  General = 1,
  Training = 2,
  Validation = 3,
  Evaluation = 4,
}

export enum DatasetStatus {
  Available = 1,
  Deleted = 2,
  Expired = 3,
  Importing = 4,
  Exporting = 5,
  Indexing = 6,
}

export enum DatasetVisibility {
  /** 所有空间可见 */
  Public = 1,
  /** 当前空间可见 */
  Space = 2,
  /** 用户不可见 */
  System = 3,
}

export enum FieldDisplayFormat {
  PlainText = 1,
  Markdown = 2,
  JSON = 3,
  YAML = 4,
  Code = 5,
}

export enum FieldStatus {
  Available = 1,
  Deleted = 2,
}

export enum ItemErrorType {
  /** schema 不匹配 */
  MismatchSchema = 1,
  /** 空数据 */
  EmptyData = 2,
  /** 单条数据大小超限 */
  ExceedMaxItemSize = 3,
  /** 数据集容量超限 */
  ExceedDatasetCapacity = 4,
  /** 文件格式错误 */
  MalformedFile = 5,
  /** 包含非法内容 */
  IllegalContent = 6,
  /** system error */
  InternalError = 100,
}

export enum SchemaKey {
  String = 1,
  Integer = 2,
  Float = 3,
  Bool = 4,
  Message = 5,
}

export enum SecurityLevel {
  L1 = 1,
  L2 = 2,
  L3 = 3,
  L4 = 4,
}

export enum SnapshotStatus {
  Unstarted = 1,
  InProgress = 2,
  Completed = 3,
  Failed = 4,
}

export enum StorageProvider {
  TOS = 1,
  VETOS = 2,
  HDFS = 3,
  ImageX = 4,
  /** 后端内部使用 */
  Abase = 100,
  RDS = 101,
  LocalFS = 102,
}

export interface DatasetFeatures {
  /** 变更 schema */
  editSchema?: boolean;
  /** 多轮数据 */
  repeatedData?: boolean;
  /** 多模态 */
  multiModal?: boolean;
}

export interface DatasetSpec {
  /** 条数上限 */
  maxItemCount?: string;
  /** 字段数量上限 */
  maxFieldCount?: number;
  /** 单条数据字数上限 */
  maxItemSize?: string;
}

export interface ItemErrorDetail {
  message?: string;
  /** 单条错误数据在输入数据中的索引。从 0 开始，下同 */
  index?: number;
  /** [startIndex, endIndex] 表示区间错误范围, 如 ExceedDatasetCapacity 错误时 */
  startIndex?: number;
  endIndex?: number;
}

export interface ItemErrorGroup {
  type?: ItemErrorType;
  summary?: string;
  /** 错误条数 */
  errorCount?: number;
  /** 批量写入时，每类错误至多提供 5 个错误详情；导入任务，至多提供 10 个错误详情 */
  details?: Array<ItemErrorDetail>;
}

export interface MultiModalSpec {
  /** 文件数量上限 */
  maxFileCount?: Int64;
  /** 文件大小上限 */
  maxFileSize?: Int64;
  /** 文件格式 */
  supportedFormats?: Array<string>;
}
/* eslint-enable */
