/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface LongTermMemoryClearAllRequest {
  bot_id: string;
  connector_id: string;
  /** 仅旧链路xmemory使用  1: 原始对话 2: 总结后的话题 3: 精华记忆 */
  time_capsule_item_type?: number;
}

export interface LongTermMemoryClearAllResponse {}

export interface LongTermMemoryDeleteRequest {
  bot_id: string;
  connector_id: string;
  biz_ids: Array<string>;
  /** xmemory使用  1: 原始对话 2: 总结后的话题 3: 精华记忆 */
  time_capsule_item_type?: number;
  /** xmemory使用 */
  iids?: Array<string>;
}

export interface LongTermMemoryDeleteResponse {}

export interface LongTermMemoryItem {
  /** 业务id 火山侧的mempryID、xmemory侧的BizId */
  biz_id: string;
  /** 事件文本 */
  text: string;
  /** 事件时间（时间戳） */
  event_time: string;
  /** xmemory侧的记忆扩展 */
  ext?: Record<string, string>;
  /** xmemory记忆标签 */
  tags?: Array<string>;
  /** xmemory记忆类型  1: 原始对话 2: 总结后的话题 3: 精华记忆 */
  time_capsule_item_type?: number;
  /** xmemory记忆的Iid */
  iid?: string;
}

export interface LongTermMemoryListRequest {
  bot_id: string;
  connector_id: string;
  /** offset、limit仅旧链路xmemory使用，火山侧没有分页 */
  offset?: number;
  limit?: number;
  /** 仅旧链路xmemory使用  1: 原始对话 2: 总结后的话题 3: 精华记忆 */
  time_capsule_item_type?: number;
}

export interface LongTermMemoryListResponse {
  time_capsule_items: Array<LongTermMemoryItem>;
  total: number;
  /** 最近一次清空的时间戳 */
  last_clear_all_time?: string;
}

export interface LongTermMemoryUpdateRequest {
  bot_id: string;
  connector_id: string;
  biz_id: string;
  new_content: string;
  /** 事件时间（时间戳） */
  event_ms?: string;
  /** xmemory侧的记忆扩展 */
  ext?: Record<string, string>;
  /** xmemory记忆标签 */
  tags?: Array<string>;
  /** xmemory记忆类型  1: 原始对话 2: 总结后的话题 3: 精华记忆 */
  time_capsule_item_type?: number;
  /** xmemory记忆的Iid */
  iid?: string;
}

export interface LongTermMemoryUpdateResponse {}

export interface LongTermMemoryVersionRequest {
  bot_id: string;
}

export interface LongTermMemoryVersionResponse {
  /** 是否走Mars长期记忆 */
  MarsLongTermMemory: boolean;
}
/* eslint-enable */
