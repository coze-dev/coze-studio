/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as storage from './storage';

export type Int64 = string | number;

export enum IndexType {
  /** userId维度，appId+botId+typeId+userId拼接 */
  UserIdDimension = 1,
}

export enum StatusCode {
  /** ok */
  Ok = 0,
  /** 1-19 reserved
invalid params */
  InvalidParams = 20,
  /** missing params */
  MissingParams = 21,
  /** invalid params: text len */
  InvalidParams_TextLen = 22,
  /** invalid params: empty text */
  InvalidParams_EmptyText = 23,
  /** invalid params: empty biz_id */
  InvalidParams_EmptyBizId = 24,
  /** conflicted memory */
  ConflictedMemory = 80,
  /** repeated memory */
  RepeatedMemory = 81,
  /** no persmission */
  NoPermission = 100,
  /** hit secutiry risk */
  SecurityRisk = 110,
  /** internal error */
  InternalError = 255,
}

/** the commands to handle item related request */
export enum StorageItemCommands {
  /** add single item */
  AddItem = 1,
  /** upd a single item, specified by app, bot, type, uid, iid/biz_id; and update accured values */
  UpdateItem = 2,
  /** delete a sigle item, specified by app, bot, type, uid, iid/biz_id */
  DeleteItem = 3,
  /** get a sigle item, specified by app, bot, type, uid, iid/biz_id */
  GetItem = 4,
  /** get the list of current items, ORDER BY event_ms DESC */
  ListItems = 5,
  /** get items acording to a list of storage.ItemIndex(es) */
  MgetItems = 6,
  /** delete items according to a list of storage.ItemIndex(es) */
  MdeleteItems = 7,
  /** Insert or Update an Item, depends on the if there is an exsisting item */
  UpsertItem = 8,
  /** Reflect the unrefected items specified by item_meta */
  FlushReflection = 9,
  /** 业务层的应用命令
forget the target items specified by item */
  ForgetMemory = 50,
}

/** the source where the command comes from, e.g. user operation, offline data process, etc. */
export enum StorageItemCommandSource {
  /** user operation */
  UserOperation = 1,
  /** Personally Identifiable Information, 合规检查 */
  PiiProcess = 2,
  /** offline data clean up process, in this case, reflection process might be ignored */
  OfflineDataCleanUp = 3,
}

/** 过滤器 */
export interface Condition {
  /** 字段名称， */
  field: string;
  /** 操作类型：eq,lt,lte,ge,gte,in，支持哪些范围需先和search模板的同学确认 */
  op: string;
  /** lt,lte,ge,gte 则只有一个值，取第一个 */
  values?: Array<string>;
}

export interface Filter {
  /** 过滤条件 */
  conditions?: Array<Condition>;
  /** And(默认),Or */
  op?: string;
}

export interface SearchItem {
  item: storage.Item;
  sources?: Array<SourceMeta>;
}

export interface SourceMeta {
  recall_type: string;
  raw_query?: string;
  rewrite_query?: string;
  keywords?: Array<string>;
  is_rewrite?: boolean;
  score?: number;
  ext?: Record<string, string>;
}
/* eslint-enable */
