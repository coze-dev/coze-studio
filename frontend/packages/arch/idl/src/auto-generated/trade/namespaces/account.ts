/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as marketplace_common from './marketplace_common';
import * as common from './common';

export type Int64 = string | number;

export interface BillDetail {
  amount?: string;
  timestamp?: string;
  desc?: string;
}

export interface GetAccountBalance {
  amount?: string;
}

export interface GetAccountBalanceRequest {
  account_type?: string;
  UserID?: Int64;
}

export interface GetAccountBalanceResponse {
  data?: GetAccountBalance;
  code: number;
  message: string;
}

export interface GetAccountBills {
  bill_details?: Array<BillDetail>;
}

export interface GetAccountBillsRequest {
  account_type?: string;
  start_timestamp_ms?: Int64;
  end_timestamp_ms?: Int64;
  UserID?: Int64;
}

export interface GetAccountBillsResponse {
  data?: GetAccountBills;
  code: number;
  message: string;
}

export interface GetModelCostRules {
  model_cost_rules?: Array<ModelCostRule>;
  plugin_cost_rules?: Array<PluginCostRule>;
}

export interface GetModelCostRulesRequest {}

export interface GetModelCostRulesResponse {
  data?: GetModelCostRules;
  code: number;
  message: string;
}

export interface ModelCostRule {
  model_name?: string;
  model_icon?: string;
  input_coze_token_cost_per_k?: Int64;
  ouput_coze_token_cost_per_k?: Int64;
  input_token_use?: Int64;
  input_token_cost?: Int64;
  input_token_amount?: Int64;
  output_token_use?: Int64;
  output_token_cost?: Int64;
  output_token_amount?: Int64;
  input_token_price?: marketplace_common.Price;
  output_token_price?: marketplace_common.Price;
}

export interface PluginCostRule {
  plugin_name?: string;
  plugin_icon?: string;
  per_funcation_call_token_cost?: Int64;
}

/** 获取用户的订阅付费信息 */
export interface SubsMsgCreditData {
  /** 订阅付费类型 */
  SubsMsgCreditLevel: common.SubsMsgCreditLevel;
}
/* eslint-enable */
