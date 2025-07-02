/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as waimai from './waimai';

export type Int64 = string | number;

export interface FoodListRes {
  food_spus?: Array<waimai.Spu>;
  restaurant_info?: waimai.RestaurantInfo;
}
/* eslint-enable */
