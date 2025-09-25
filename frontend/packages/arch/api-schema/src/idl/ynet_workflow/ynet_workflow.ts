import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
/** Version History API - 版本历史相关结构 */
export interface VersionHistoryListRequest {
  space_id: string,
  workflow_id: string,
  type: number,
  limit: number,
  last_commit_id?: string,
}
export interface UserInfo {
  user_name: string,
  user_avatar?: string,
}
export interface VersionMetaInfo {
  commit_id: string,
  version: string,
  created_at: number,
  creator_name: string,
  description?: string,
  offline?: boolean,
  create_time?: number,
  desc?: string,
  type?: number,
  user?: UserInfo,
  submit_commit_id?: string,
  env?: string,
  update_time?: number,
}
export interface VersionHistoryListResponse {
  version_list: VersionMetaInfo[],
  has_more: boolean,
  cursor?: string,
  code: number,
  msg: string,
}
/** Revert Draft API - 版本回滚相关结构 */
export interface RevertDraftRequest {
  space_id: string,
  workflow_id: string,
  commit_id: string,
  type: number,
  env?: string,
}
export interface RevertDraftResponse {
  success: boolean,
  message?: string,
  code: number,
  msg: string,
}
/** Get Version Schema API - 版本历史查看相关结构 */
export interface GetVersionSchemaRequest {
  space_id: string,
  workflow_id: string,
  commit_id: string,
  /** 1: 草稿, 2: 发布版本 */
  type: number,
  env?: string,
}
export interface GetVersionSchemaResponse {
  schema: string,
  name: string,
  description?: string,
  icon_url?: string,
  version: string,
  commit_id: string,
  created_at: number,
  input_params?: string,
  output_params?: string,
  flow_mode: number,
  code: number,
  msg: string,
}
/** Version History API */
export const VersionHistoryList = /*#__PURE__*/createAPI<VersionHistoryListRequest, VersionHistoryListResponse>({
  "url": "/api/workflow_api/version_list",
  "method": "POST",
  "name": "VersionHistoryList",
  "reqType": "VersionHistoryListRequest",
  "reqMapping": {
    "body": ["space_id", "workflow_id", "type", "limit", "last_commit_id"]
  },
  "resType": "VersionHistoryListResponse",
  "schemaRoot": "api://schemas/idl_ynet_workflow_ynet_workflow",
  "service": "ynet_workflow"
});
/** Revert Draft API */
export const RevertDraft = /*#__PURE__*/createAPI<RevertDraftRequest, RevertDraftResponse>({
  "url": "/api/workflow_api/revert_draft",
  "method": "POST",
  "name": "RevertDraft",
  "reqType": "RevertDraftRequest",
  "reqMapping": {
    "body": ["space_id", "workflow_id", "commit_id", "type", "env"]
  },
  "resType": "RevertDraftResponse",
  "schemaRoot": "api://schemas/idl_ynet_workflow_ynet_workflow",
  "service": "ynet_workflow"
});
/** Get Version Schema API */
export const GetVersionSchema = /*#__PURE__*/createAPI<GetVersionSchemaRequest, GetVersionSchemaResponse>({
  "url": "/api/workflow_api/get_version_schema",
  "method": "POST",
  "name": "GetVersionSchema",
  "reqType": "GetVersionSchemaRequest",
  "reqMapping": {
    "body": ["space_id", "workflow_id", "commit_id", "type", "env"]
  },
  "resType": "GetVersionSchemaResponse",
  "schemaRoot": "api://schemas/idl_ynet_workflow_ynet_workflow",
  "service": "ynet_workflow"
});