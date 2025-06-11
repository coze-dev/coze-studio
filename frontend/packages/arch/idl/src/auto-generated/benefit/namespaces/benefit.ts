/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as benefit_common from './benefit_common';

export type Int64 = string | number;

export interface AddBenefitContent {
  AddMessageCreditsBenefit?: AddMessageCreditsBenefitStruct;
  AddTopUpCreditsBenefit?: AddTopUpCreditsBenefitStruct;
}

export interface AddMessageCreditsBenefitStruct {
  AmountPerDay: Int64;
  ActiveDays: Int64;
}

export interface AddTopUpCreditsBenefitStruct {
  Amount: Int64;
  Expired: Int64;
}

export interface BenefitDetail {
  BenefitType?: benefit_common.BenefitType;
  MessageCreditDetail?: MessageCreditDetail;
  BonusMessageCreditDetail?: MessageCreditDetail;
  TopUpMessageCreditDetail?: MessageCreditDetail;
}

export interface BenefitInfo {
  benefit_id?: string;
  /** 2 : optional benefit_common.BenefitType BenefitType (api.body= "benefit_type"),
3 : optional string ActiveMode (go.tag="json:\"active_mode\""),
4 : optional i64 StartedAt (go.tag="json:\"started_at\""),
5 : optional i64 EndedAt(go.tag="json:\"ended_at\""),
6 : optional i32 Duration (go.tag="json:\"duration\""), */
  limit?: Int64;
  status?: benefit_common.EntityBenefitStatus;
  entity_type?: benefit_common.BenefitEntityType;
  entity_id?: string;
  trigger_unit?: benefit_common.LimitationTriggerUnit;
  trigger_time?: Int64;
}

export interface BenefitTypeInfo {
  BasicInfo?: benefit_common.CommonCounter;
  ItemInfos?: Array<BenefitTypeInfoItem>;
}

export interface BenefitTypeInfoItem {
  ItemID?: string;
  ItemInfo?: benefit_common.CommonCounter;
}

export interface ChargeDetail {
  Cost?: number;
  Unit?: string;
}

export interface ChargeResourceInfo {
  ResourceID?: Int64;
  ResourceType?: benefit_common.ChargeResourceType;
  IsCharge?: boolean;
  ChargeInfo?: Record<benefit_common.ChargeItemType, ChargeDetail>;
}

export interface CreateBenefitLimitationData {
  benefit_info?: BenefitInfo;
}

export interface DenyReason {
  Code: number;
  Message: string;
}

export interface HistoryBotInfo {
  BotID?: Int64;
  IsDraft?: boolean;
  IsTried?: boolean;
}

export interface HistoryConsumeItem {
  EntityID?: Int64;
  ChangeCredit?: Int64;
  Type?: benefit_common.BenefitHistoryType;
  ResourceID?: string;
}

export interface HistoryConsumeItemV2 {
  ResourceID?: string;
  ChangeCredit?: number;
}

export interface HistoryEntityInfo {
  EntityID?: Int64;
  IsDraft?: boolean;
  IsTried?: boolean;
  Name?: string;
}

export interface HistoryEntityInfoV2 {
  EntityID?: Int64;
  Name?: string;
}

export interface HistoryWorkflowInfo {
  WorkflowID?: Int64;
}

export interface ListBenefitLimitationData {
  benefit_infos?: Array<BenefitInfo>;
  has_more?: boolean;
  page_token?: string;
}

export interface MessageCreditDetail {
  TotalQuota?: number;
  UsedQuota?: number;
  MessageCreditItems?: Array<MessageCreditItem>;
  IsInUse?: boolean;
  Expired?: Int64;
  PluginCreditItems?: Array<PluginCreditItem>;
}

export interface MessageCreditItem {
  ModelID?: Int64;
  ModelName?: string;
  UseMode?: benefit_common.BenefitUseMode;
  Quota?: number;
  Used?: number;
  QuataOnceCost?: number;
}

export interface PluginCreditItem {
  PluginID?: Int64;
  PluginName?: string;
  UseMode?: benefit_common.BenefitUseMode;
  QuataOnceCost?: number;
}

export interface PublicCreateBenefitLimitationRequest {
  entity_type?: benefit_common.BenefitEntityType;
  entity_id?: string;
  benefit_info?: BenefitInfo;
}

export interface PublicCreateBenefitLimitationResponse {
  code?: number;
  msg?: string;
  data?: CreateBenefitLimitationData;
}

export interface PublicGetUserBenefitRequest {
  /** 不传仅返回用户信息 */
  benefit_types?: Array<benefit_common.BenefitType>;
  /** 必填。这里指的是Coze的AccountID */
  coze_account_id?: string;
  /** 这里指的是Coze的AccountType */
  coze_account_type?: benefit_common.CozeAccountType;
}

export interface PublicGetUserBenefitResponse {
  code?: number;
  message?: string;
  data?: UserBenefitData;
}

export interface PublicListBenefitLimitationRequest {
  entity_type?: benefit_common.BenefitEntityType;
  entity_id?: string;
  benefit_type?: benefit_common.BenefitType;
  status?: benefit_common.EntityBenefitStatus;
  page_token?: string;
  page_size?: number;
}

export interface PublicListBenefitLimitationResponse {
  code?: number;
  msg?: string;
  data?: ListBenefitLimitationData;
}

export interface PublicUpdateBenefitLimitationRequest {
  benefit_id?: string;
  /** 2 : optional string ActiveMode (api.body = "active_mode"),
3 : optional i64 StartedAt (api.body = "started_at"),
4 : optional i64 EndedAt (api.body = "ended_at"),
5 : optional i32 Duration (api.body = "duration"), */
  limit?: Int64;
  status?: benefit_common.EntityBenefitStatus;
  trigger_unit?: benefit_common.LimitationTriggerUnit;
  trigger_time?: Int64;
}

export interface PublicUpdateBenefitLimitationResponse {
  code?: number;
  msg?: string;
}

export interface RefundTopUpCreditInfo {
  Amount?: number;
  Used?: number;
}

export interface UserBasicBenefit {
  Status?: benefit_common.AccountStatus;
  AccountID?: Int64;
  UserBenefitInfo?: Record<
    benefit_common.BenefitType,
    benefit_common.CommonCounter
  >;
}

export interface UserBenefitData {
  /** 用户基本信息 */
  user_basic_info: benefit_common.PublicUserBasicInfo;
  benefit_type_infos?: Record<
    benefit_common.BenefitType,
    benefit_common.CommonCounter
  >;
}

export interface UserBenefitHistory {
  ChangeBalance?: number;
  Date?: Int64;
  Type?: benefit_common.BenefitRootHistoryType;
  ConnectorID?: Int64;
  SpaceID?: Int64;
  EntityInfo?: HistoryEntityInfoV2;
  EntityItems?: Record<
    benefit_common.ConsumeResourceType,
    Array<HistoryConsumeItemV2>
  >;
}

export interface UserBenefitHistroy {
  ChangeCredit?: Int64;
  Date?: Int64;
  Type?: benefit_common.BenefitHistoryType;
  ConnectorID?: Int64;
  /** 已废弃 */
  HistoryBotInfo?: HistoryBotInfo;
  IsExpired?: boolean;
  /** 已废弃 */
  HistoryWorkflowInfo?: HistoryWorkflowInfo;
  /** 后续废弃，用EntityItems */
  ModelHistoryItems?: Array<HistoryConsumeItem>;
  PluginHistoryItems?: Array<HistoryConsumeItem>;
  EntityInfo?: HistoryEntityInfo;
}

export interface UserExtraBenefit {
  BenefitType?: benefit_common.BenefitType;
  UUID?: string;
  Counter?: benefit_common.CommonCounter;
  ResourceID?: string;
}
/* eslint-enable */
