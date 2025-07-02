/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface AutoChargeConfig {
  is_enabled?: boolean;
  threshold_amount?: number;
  charge_amount?: number;
  max_charge_amount_per_day?: number;
}

export interface AutoChargeConfigData {
  /** 自动充值相关配置 */
  auto_charge_config?: AutoChargeConfig;
  /** 自动充值状态 */
  auto_charge_state?: AutoChargeState;
}

export interface AutoChargeState {
  today_charge_amount?: number;
}

export interface CancelAutoChargeRequest {
  UserID?: Int64;
}

export interface CancelAutoChargeResponse {
  code?: number;
  message?: string;
}

export interface GetAutoChargeConfigRequest {
  UserID?: Int64;
}

export interface GetAutoChargeConfigResponse {
  code?: number;
  message?: string;
  data?: AutoChargeConfigData;
}

export interface SignAutoChargeRequest {
  UserID?: Int64;
  threshold_amount?: number;
  charge_amount?: number;
  max_charge_amount_per_day?: number;
}

export interface SignAutoChargeResponse {
  code?: number;
  message?: string;
}
/* eslint-enable */
