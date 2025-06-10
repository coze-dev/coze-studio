/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as marketplace_common from './marketplace_common';
import * as common from './common';

export type Int64 = string | number;

export enum UnitType {
  YEAR = 1,
  MONTH = 2,
  WEEK = 3,
  DAY = 4,
  HOUR = 5,
  MINUTE = 6,
}

export interface ProductInfo {
  meta_info?: ProductMetaInfo;
  sku_list?: Array<SKUInfo>;
}

export interface ProductMetaInfo {
  id?: string;
  name?: string;
  description?: string;
  last_listing_at?: string;
}

export interface SKUAttr {
  key?: string;
  value?: string;
}

export interface SKUInfo {
  id?: string;
  name?: string;
  description?: string;
  price?: Array<marketplace_common.Price>;
  attr?: Array<SKUAttr>;
  /** 订阅类商品才会有 */
  SubscriptionInfo?: SubscriptionSKUDetail;
}

export interface SubscriptionAutoRenewSKU {
  /** 购买周期 */
  billing_period?: SubscriptionPeriod;
  /** 订阅整个周期数目(trail期和intro期也被计算在内),单位是一个SubscriptionPeriod。续费超过该次数后，不再继续续费。0或不输入均表示不限制。 */
  billing_period_count?: number;
  /** 折扣期 */
  trial_period?: SubscriptionPeriod;
  /** 折扣期次数（最小为1） */
  trial_period_count?: number;
  /** 宽限期 */
  grade_period?: SubscriptionPeriod;
}

export interface SubscriptionPeriod {
  /** 时间周期单位，YEAR/MONTH/DAY/HOUR/MINUTE/WEEK */
  unit?: string;
  /** 时间周期长度，单位是一个unit */
  length?: number;
  unit_type?: UnitType;
}

export interface SubscriptionSKUDetail {
  sku_type?: common.SubsSKUType;
  /** 对于SubsMessageCredit：0-Free；10-premium，20-Premium Plus */
  sku_level?: number;
  auto_renew_detail?: SubscriptionAutoRenewSKU;
}
/* eslint-enable */
