/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface OceanProjectCreateData {
  project_id?: string;
}

export interface OceanProjectCreateRequest {
  space_id?: string;
  name?: string;
  description?: string;
  icon_uri?: string;
}

export interface OceanProjectCreateResponse {
  data?: OceanProjectCreateData;
  code: Int64;
  msg: string;
}

export interface OceanProjectDevPermission {
  has_permission: boolean;
}

export interface OceanProjectUpdateRequest {
  project_id: string;
  name?: string;
  description?: string;
  icon_uri?: string;
}

export interface OceanProjectUpdateResponse {
  code: Int64;
  msg: string;
}
/* eslint-enable */
