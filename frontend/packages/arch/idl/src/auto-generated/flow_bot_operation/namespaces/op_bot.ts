/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export enum BotInfoType {
  /** 草稿bot */
  DraftBot = 1,
  /** 线上bot */
  BotVersion = 2,
}

export interface GetDraftBotModelDetailRequest {
  bot_id: string;
  /** 获取bot的信息类型 */
  bot_info_type?: BotInfoType;
  /** 线上bot的版本 */
  bot_version?: string;
  /** 渠道id */
  connector_id?: string;
}

export interface GetDraftBotModelDetailResponse {
  data?: Array<ModelProfile>;
  code: Int64;
  msg: string;
}

export interface ModelDetail {
  /** 模型展示名（对用户） */
  name?: string;
  /** 模型名（对内部） */
  model_name?: string;
  /** 模型ID */
  model_id?: string;
  /** 模型类别 */
  model_family?: Int64;
  /** IconURL */
  model_icon_url?: string;
}

export interface ModelProfile {
  model_detail?: ModelDetail;
  /** 模型的映射Id:专业版为基座模型名称+版本+CustomModelId，普通版为model_id */
  reflect_id?: string;
}
/* eslint-enable */
