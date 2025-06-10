/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

export interface CreateApiRouteRequest {
  menu_id: string;
  api_paths: Array<string>;
  Base?: base.Base;
}

export interface CreateApiRouteResponse {
  data: base.EmptyData;
  code: Int64;
  msg: string;
}

export interface CreateMenuRequest {
  parent_id?: string;
  menu_name: string;
  uri?: string;
  icon?: string;
  visible: boolean;
  Base?: base.Base;
}

export interface CreateMenuResponse {
  data?: MenuInfo;
  code: Int64;
  msg: string;
}

export interface DelMenuRequest {
  id: string;
  Base?: base.Base;
}

export interface DelMenuResponse {
  data: base.EmptyData;
  code: Int64;
  msg: string;
}

export interface MenuInfo {
  id: string;
  parent_id: string;
  name: string;
  uri?: string;
  is_visible: boolean;
  icon?: string;
}

export interface QueryApiPathRequest {
  menu_id: string;
  Base?: base.Base;
}

export interface QueryApiPathResponse {
  data: Array<string>;
  code: Int64;
  msg: string;
}

export interface QueryMenuListRequest {
  Base?: base.Base;
}

export interface QueryMenuListResponse {
  data: Array<MenuInfo>;
  code: Int64;
  msg: string;
}

export interface UpdateMenuRequest {
  id: string;
  parent_id?: string;
  menu_name: string;
  uri?: string;
  icon?: string;
  visible: boolean;
  Base?: base.Base;
}

export interface UpdateMenuResponse {
  data?: MenuInfo;
  code: Int64;
  msg: string;
}
/* eslint-enable */
