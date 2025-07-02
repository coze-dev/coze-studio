/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as base from './base';

export type Int64 = string | number;

/** typedef string SubLinkDiscoveryTaskStatus
const SubLinkDiscoveryTaskStatus SUB_LINK_DISCOVERY_TASK_STATUS_RUNNING = "running"
const SubLinkDiscoveryTaskStatus SUB_LINK_DISCOVERY_TASK_STATUS_SUCCESS = "finished"
const SubLinkDiscoveryTaskStatus SUB_LINK_DISCOVERY_TASK_STATUS_ABORTED = "aborted" */
export enum SubLinkDiscoveryTaskStatus {
  SUB_LINK_DISCOVERY_TASK_STATUS_UNKNOWN = 0,
  SUB_LINK_DISCOVERY_TASK_STATUS_RUNNING = 1,
  SUB_LINK_DISCOVERY_TASK_STATUS_SUCCESS = 2,
  SUB_LINK_DISCOVERY_TASK_STATUS_ABORTED = 3,
  SUB_LINK_DISCOVERY_TASK_STATUS_FINISHED_WITH_ERROR = 4,
}

export interface AbortSubLinkDiscoveryTaskRequest {
  task_id?: string;
  Base?: base.Base;
}

export interface AbortSubLinkDiscoveryTaskResponse {
  BaseResp?: base.BaseResp;
}

export interface CreateSubLinkDiscoveryTaskRequest {
  url?: string;
  creator_id?: Int64;
  Base?: base.Base;
}

export interface CreateSubLinkDiscoveryTaskResponse {
  task_id?: string;
  BaseResp?: base.BaseResp;
}

export interface GetSubLinkDiscoveryTaskRequest {
  task_id?: string;
  Base?: base.Base;
}

export interface GetSubLinkDiscoveryTaskResponse {
  urls?: Array<string>;
  status?: SubLinkDiscoveryTaskStatus;
  BaseResp?: base.BaseResp;
}

export interface ParseSiteMapRequest {
  sitemap_url?: string;
  creator_id?: Int64;
  Base?: base.Base;
}

export interface ParseSiteMapResponse {
  urls?: Array<string>;
  BaseResp?: base.BaseResp;
}

export interface SubmitBatchCrawlTaskRequest {
  web_urls?: Array<string>;
  creator_id?: Int64;
  Base?: base.Base;
}

export interface SubmitBatchCrawlTaskResponse {
  web_ids?: Array<string>;
  BaseResp: base.BaseResp;
}
/* eslint-enable */
