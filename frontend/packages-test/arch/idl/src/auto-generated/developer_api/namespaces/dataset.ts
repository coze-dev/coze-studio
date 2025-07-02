/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface BotSimpleInfo {
  name?: string;
  icon_url?: string;
  bot_id?: string;
  creator_id?: string;
}

export interface GetBotListByDatasetData {
  data?: Array<BotSimpleInfo>;
  total?: number;
}

export interface GetBotListByDatasetReq {
  dataset_id: string;
  page_size?: number;
  /** 从1开始 */
  page_no?: number;
}

export interface GetBotListByDatasetResp {
  code?: number;
  msg?: string;
  data?: GetBotListByDatasetData;
}
/* eslint-enable */
