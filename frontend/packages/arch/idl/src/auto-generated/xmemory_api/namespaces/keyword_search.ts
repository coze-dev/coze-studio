/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** enums for order by method */
export enum OrderBy {
  Score = 1,
  Field = 2,
}

/** enums for sorting ordering */
export enum OrderType {
  Desc = 1,
  Asc = 2,
}

/** the index type to search */
export enum SearchIndexType {
  /** app-bot-type-userid 作为索引类型 */
  UserIdDimension = 1,
}

export interface Filter {
  /** start of event_ms */
  start_event_ms: Int64;
  /** end of start_me */
  end_event_ms: Int64;
  /** ItemTypes 字段优先级高于SearchIndex.ItemType */
  item_types?: Array<string>;
}

export interface Query {
  /** for now only support query string */
  query_string?: string;
}

/** the struct to define keyword search index */
export interface SearchIndex {
  /** the type of index */
  index_type: SearchIndexType;
  /** field to specific the index */
  app_id: string;
  /** field to specific the index */
  bot_id: string;
  /** field to specific the index */
  item_type: string;
  /** field to specific the index */
  user_id: string;
}

export interface SortClause {
  /** desc or asc */
  order_type: OrderType;
  /** avaliable only when order_by equals OrderBy.Value */
  field?: string;
}
/* eslint-enable */
