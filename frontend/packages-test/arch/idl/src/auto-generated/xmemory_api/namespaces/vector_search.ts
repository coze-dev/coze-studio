/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

/** the struct to define vector search index */
export interface SearchIndex {
  /** name of db, the underlying implement db */
  db_name: string;
  /** name of index, not the underlying implement index, might be empty when upsert */
  index?: string;
}

/** just to define the source of traffic */
export interface TrafficSource {
  app_id: string;
  bot_id: string;
  user_id: string;
}
/* eslint-enable */
