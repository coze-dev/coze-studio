/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as task_struct from './task_struct';

export type Int64 = string | number;

export interface DraftProjectInnerTaskListData {
  task_list?: Array<task_struct.ProjectInnerTaskInfo>;
}

export interface DraftProjectInnerTaskListRequest {
  project_id: string;
}

export interface DraftProjectInnerTaskListResponse {
  data?: DraftProjectInnerTaskListData;
  code: Int64;
  msg: string;
}
/* eslint-enable */
