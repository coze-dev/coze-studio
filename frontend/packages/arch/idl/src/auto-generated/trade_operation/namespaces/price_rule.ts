/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';
import * as marketplace_common from './marketplace_common';

export type Int64 = string | number;

export interface GetPricingRulesData {
  rules?: Array<PricingRule>;
}

export interface GetPricingRulesRequest {
  scene: common.Scene;
  coze_account_id?: Int64;
  coze_account_type?: common.CozeAccountType;
}

export interface GetPricingRulesResponse {
  data?: GetPricingRulesData;
  code: number;
  message: string;
}

export interface PricingRule {
  rule: common.AmountType;
  calculation_type: common.DiscountCalculationType;
  discount: number;
  minimum: string;
  maximum: string;
  unit_price?: marketplace_common.Price;
}
/* eslint-enable */
