/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as marketplace_common from './marketplace_common';

export type Int64 = string | number;

export enum BalanceType {
  Unknown = 0,
  LegalTender = 1,
}

export enum TradeType {
  Unknown = 0,
  Purchase = 1,
  Refund = 2,
  ChargeBack = 3,
}

export enum WalletHistoryDirection {
  Unknown = 0,
  Income = 1,
  Outcome = 2,
}

export enum WalletHistoryType {
  Unknown = 0,
  Withdraw = 1,
  Template = 2,
}

export interface PublicGetUserBalanceRequest {
  balance_type_list?: Array<BalanceType>;
  'Tt-Agw-Client-Ip'?: string;
}

export interface PublicGetUserBalanceResponse {
  code?: number;
  message?: string;
  data?: UserBalanceData;
}

export interface PublicGetUserProfitDetailRequest {
  'Tt-Agw-Client-Ip'?: string;
}

export interface PublicGetUserProfitDetailResponse {
  code?: number;
  message?: string;
  data?: UserProfitData;
}

export interface PublicGetUserWalletDetailRequest {
  balance_type?: BalanceType;
  'Tt-Agw-Client-Ip'?: string;
}

export interface PublicGetUserWalletDetailResponse {
  code?: number;
  message?: string;
  data?: UserWalletDetailData;
}

export interface PublicGetUserWalletHistoryRequest {
  /** 第一次不用传 */
  index?: string;
  /** 每页数量 */
  count?: Int64;
  /** 类型列表 */
  type_list?: Array<WalletHistoryType>;
}

export interface PublicGetUserWalletHistoryResponse {
  code?: number;
  message?: string;
  data?: UserWalletHistoryData;
}

export interface UserBalanceData {
  balance_map?: Record<BalanceType, Int64>;
}

export interface UserProfitData {
  today_predict_profit?: string;
  total_profit?: string;
}

export interface UserWalletDetailData {
  /** 当前提现余额，单位：分 */
  current_balance?: string;
  /** 累计结算总额，单位：分 */
  total_settled_amount?: string;
}

export interface UserWalletHistoryData {
  history_list?: Array<UserWalletHistoryItem>;
  /** 是否还有下一页 */
  has_more?: boolean;
  /** 下次请求的分页 index */
  next_index?: string;
}

export interface UserWalletHistoryItem {
  id?: string;
  name?: string;
  desc?: string;
  icon_url?: string;
  type?: WalletHistoryType;
  direction?: WalletHistoryDirection;
  amount?: string;
  /** 单位：秒 */
  timestamp?: string;
  /** 只有收入有该字段，该笔收入来源的类型 */
  income_from_user_role?: marketplace_common.UserRole;
}
/* eslint-enable */
