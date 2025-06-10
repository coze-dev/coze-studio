/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as common from './common';

export type Int64 = string | number;

export interface BatchCreateVolcanoDatasetRequest {
  /** 空间id */
  space_id: string;
  /** project ID project内创建 */
  project_id?: string;
  /** 火山侧知识库id */
  volcano_dataset_id_list?: Array<string>;
}

export interface BatchCreateVolcanoDatasetResponse {
  /** 返回创建的知识库id列表 */
  dataset_id_list?: Array<string>;
  code?: Int64;
  msg?: string;
}

export interface GetVolcanoDatasetListData {
  volcano_dataset_list?: Array<common.VolcanoDataset>;
  /** 跳转火山对应项目的新建知识库页面 */
  create_volcano_dataset_link?: string;
}

export interface GetVolcanoDatasetListRequest {
  /** 空间id */
  space_id: string;
  /** 火山知识库项目空间名称 */
  project_name: string;
}

export interface GetVolcanoDatasetListResponse {
  data?: GetVolcanoDatasetListData;
  code?: Int64;
  msg?: string;
}

export interface GetVolcanoDatasetProjectListData {
  volcano_dataset_project_list?: Array<common.VolcanoDatasetProject>;
  /** 跳转火山创建项目页面链接 */
  create_volcano_dataset_project_link?: string;
}

export interface GetVolcanoDatasetProjectListRequest {
  /** 空间id */
  space_id: string;
}

export interface GetVolcanoDatasetProjectListResponse {
  data?: GetVolcanoDatasetProjectListData;
  code?: Int64;
  msg?: string;
}

export interface GetVolcanoDatasetServiceListData {
  volcano_dataset_service_list?: Array<common.VolcanoDatasetService>;
  /** 跳转火山知识库下知识服务创建页面 */
  create_volcano_dataset_service_link?: string;
}

export interface GetVolcanoDatasetServiceListRequest {
  /** 知识库id */
  dataset_id?: string;
  volcano_dataset_service_ids?: Array<string>;
  /** 传volcano_dataset_service_ids时需要提供对应的space id */
  space_id?: string;
}

export interface GetVolcanoDatasetServiceListResponse {
  data?: GetVolcanoDatasetServiceListData;
  code?: Int64;
  msg?: string;
}
/* eslint-enable */
