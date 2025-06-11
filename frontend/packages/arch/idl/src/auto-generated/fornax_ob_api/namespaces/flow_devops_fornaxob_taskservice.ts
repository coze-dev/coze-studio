/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';
import * as task from './task';
import * as filter from './filter';

export type Int64 = string | number;

export enum OrderType {
  Unknown = 0,
  Asc = 1,
  Desc = 2,
}

export interface CheckTaskNameRequest {
  workspace_id: Int64;
  name: string;
  Base?: base.Base;
}

export interface CheckTaskNameResponse {
  pass?: boolean;
  message?: string;
  BaseResp?: base.BaseResp;
}

export interface CreateTaskRequest {
  task: task.Task;
  base?: base.Base;
}

export interface CreateTaskResponse {
  task_id?: string;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}

export interface GetTaskRequest {
  task_id: string;
  workspace_id: string;
  base?: base.Base;
}

export interface GetTaskResponse {
  task?: task.Task;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}

export interface ListTasksRequest {
  workspace_id: string;
  task_filters?: filter.TaskFilterFields;
  /** default 20 max 200 */
  limit?: number;
  offset?: number;
  order_by?: OrderType;
  base?: base.Base;
}

export interface ListTasksResponse {
  tasks?: Array<task.Task>;
  total?: string;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}

export interface UpdateTaskRequest {
  task_id: string;
  workspace_id: string;
  task_status?: string;
  description?: string;
  effective_time?: task.EffectiveTime;
  sample_rate?: number;
  base?: base.Base;
}

export interface UpdateTaskResponse {
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  code?: number;
  /** 仅供http请求使用; 内部RPC不予使用，统一通过BaseResp获取Code和Msg */
  msg?: string;
}
/* eslint-enable */
