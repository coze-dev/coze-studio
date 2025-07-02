/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface CreateVoicePrintGroupData {
  id?: string;
}

export interface CreateVoicePrintGroupFeatureData {
  id?: string;
}

export interface CreateVoicePrintGroupFeatureRequest {
  group_id?: Int64;
  name?: string;
  audio_data?: string;
  /** 测试传一个 AduioURL 方便我们测试 */
  AduioMP3URL?: string;
}

export interface CreateVoicePrintGroupFeatureResponse {
  code?: number;
  msg?: string;
  data?: CreateVoicePrintGroupFeatureData;
}

export interface CreateVoicePrintGroupRequest {
  name?: string;
  desc?: string;
}

export interface CreateVoicePrintGroupResponse {
  code?: number;
  msg?: string;
  data?: CreateVoicePrintGroupData;
}

export interface DeleteVoicePrintGroupFeatureRequest {
  group_id?: Int64;
  feature_id?: Int64;
}

export interface DeleteVoicePrintGroupFeatureResponse {
  code?: number;
  msg?: string;
}

export interface DeleteVoicePrintGroupRequest {
  group_id?: Int64;
}

export interface DeleteVoicePrintGroupResponse {
  code?: number;
  msg?: string;
}

export interface GetVoicePrintGroupFeatureListData {
  items?: Array<VoicePrintGroupFeature>;
  total?: Int64;
}

export interface GetVoicePrintGroupFeatureListRequest {
  group_id?: Int64;
  page_num?: Int64;
  page_size?: Int64;
}

export interface GetVoicePrintGroupFeatureListResponse {
  code?: number;
  msg?: string;
  data?: GetVoicePrintGroupFeatureListData;
}

export interface GetVoicePrintGroupListData {
  items?: Array<VoicePrintGroup>;
  total?: Int64;
}

export interface GetVoicePrintGroupListRequest {
  page_num?: Int64;
  page_size?: Int64;
}

export interface GetVoicePrintGroupListResponse {
  code?: number;
  msg?: string;
  data?: GetVoicePrintGroupListData;
}

export interface UpdateVoicePrintGroupFeatureRequest {
  group_id?: Int64;
  feature_id?: Int64;
  name?: string;
  audio_data?: string;
}

export interface UpdateVoicePrintGroupFeatureResponse {
  code?: number;
  msg?: string;
}

export interface UpdateVoicePrintGroupRequest {
  group_id?: Int64;
  name?: string;
  desc?: string;
}

export interface UpdateVoicePrintGroupResponse {
  code?: number;
  msg?: string;
}

/** -------------------- VoicePrint Group Manage ------------------ */
export interface VoicePrintGroup {
  id?: string;
  name?: string;
  desc?: string;
  created_at?: Int64;
  updated_at?: Int64;
}

export interface VoicePrintGroupFeature {
  id?: string;
  group_id?: string;
  name?: string;
  audio_url?: string;
  created_at?: Int64;
  updated_at?: Int64;
}
/* eslint-enable */
