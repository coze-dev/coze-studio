/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface Kctx {
  tenant_id: Int64;
  user_id?: Int64;
  tenant_domain_name: string;
  user_setting?: string;
  lang_id: number;
  request_id: string;
  host?: string;
  TenantResourceRouteKey?: string;
  Namespace?: string;
  tenant_type?: Int64;
  transaction_id?: Int64;
  consistency_retry_type?: string;
  psm_link?: string;
  breakout_retry_psm?: string;
  credentialID?: string;
  authentication_type?: string;
}
/* eslint-enable */
