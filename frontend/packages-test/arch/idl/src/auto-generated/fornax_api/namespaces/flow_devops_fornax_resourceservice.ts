/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as resource from './resource';

export type Int64 = string | number;

export interface GetResourceReq {
  resourceType: resource.ResourceType;
  resourceID: string;
}

export interface GetResourceResp {
  resource?: resource.Resource;
}
/* eslint-enable */
