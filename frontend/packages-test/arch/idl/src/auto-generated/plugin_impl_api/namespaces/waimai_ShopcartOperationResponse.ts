/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as waimai from './waimai';

export type Int64 = string | number;

export interface PreviewOrderRes {
  preview_order_info?: waimai.PreviewOrderInfo;
  preview_food_list?: Array<waimai.OrderFoodInfo>;
  address_info?: waimai.AddressInfo;
  token?: string;
}
/* eslint-enable */
