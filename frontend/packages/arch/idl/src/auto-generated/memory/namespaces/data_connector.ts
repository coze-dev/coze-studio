/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

import * as data_connector_common from './data_connector_common';
import * as base from './base';

export type Int64 = string | number;

export interface AssociateFileParam {
  third_party_file_id?: string;
  file_name?: string;
  source_file_type?: data_connector_common.SourceFileType;
  file_url?: string;
}

export interface AssociateFileRequest {
  params?: Record<Int64, Array<AssociateFileParam>>;
  Base?: base.Base;
}

export interface AssociateFileResponse {
  file_mapping?: Record<Int64, Array<SourceFileInfo>>;
  code: Int64;
  msg: string;
}

export interface CheckSourceFileRequest {
  source_file_id?: string;
  redirect_uri?: string;
  Base?: base.Base;
}

export interface CheckSourceFileResponse {
  is_exist?: boolean;
  is_authorized?: boolean;
  /** 未授权or文件不存在会返回授权链接 */
  authorization_url?: string;
  /** 未授权or文件不存在会返回授权列表 */
  data_source_infos?: Array<DataSourceInfo>;
  code: Int64;
  msg: string;
}

/** 数据源的基本信息 */
export interface DataSourceInfo {
  data_source_id?: string;
  data_source_type?: data_connector_common.DataSourceType;
  data_source_name?: string;
  data_source_icon?: string;
}

export interface FileNode {
  file_id?: string;
  file_type?: data_connector_common.FileNodeType;
  file_name?: string;
  icon_url?: string;
  has_children_nodes?: boolean;
  children_nodes?: Array<FileNode>;
  file_url?: string;
}

export interface GetAuthorizationFileListRequest {
  data_source_id?: string;
  file_type: Array<data_connector_common.FileNodeType>;
  Base?: base.Base;
}

export interface GetAuthorizationFileListResponse {
  /** 三方数据平台文件列表 */
  third_party_file_tree?: Array<FileNode>;
  code: Int64;
  msg: string;
}

export interface GetConnectorGrayRequest {
  host?: string;
  Base?: base.Base;
}

export interface GetConnectorGrayResponse {
  connector_info_list?: Array<data_connector_common.DataSourceType>;
  code: Int64;
  msg: string;
}

export interface GetUserDataSourceListRequest {
  /** 授权成功之后跳转的前端url */
  redirect_url?: string;
  host?: string;
  Base?: base.Base;
}

export interface GetUserDataSourceListResponse {
  authorization_url_map?: Record<data_connector_common.DataSourceType, string>;
  data_source_map?: Record<
    data_connector_common.DataSourceType,
    Array<DataSourceInfo>
  >;
  code: Int64;
  msg: string;
}

export interface GetWeChatTicketRequest {
  encrypt_type?: string;
  timestamp?: Int64;
  nonce?: string;
  msg_signature?: string;
  signature?: string;
  Data?: Blob;
  Base?: base.Base;
}

export interface GetWeChatTicketResponse {
  Msg?: string;
}

export interface SourceFileInfo {
  source_file_id?: string;
  user_id?: string;
  data_source_id?: string;
  data_source_type?: data_connector_common.DataSourceType;
  file_type?: data_connector_common.SourceFileType;
  file_name?: string;
  status?: data_connector_common.FileStatus;
}

export interface SubmitUserPolicyRecordRequest {
  policy_type: string;
  user_policy_action: data_connector_common.UserPolicyAction;
  Base?: base.Base;
}

export interface SubmitUserPolicyRecordResponse {
  code: Int64;
  msg: string;
}
/* eslint-enable */
