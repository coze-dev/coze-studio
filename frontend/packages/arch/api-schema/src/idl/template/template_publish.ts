/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createAPI } from './../../api/config';
export interface PublishAsTemplateRequest {
  agent_id: string,
  title: string,
  description?: string,
  category_id?: string,
  labels?: string[],
  is_public: boolean,
  cover_uri?: string,
}
export interface PublishAsTemplateResponse {
  template_id: string,
  status: string,
  code: number,
  msg: string,
}
export interface GetMyTemplateListRequest {
  page_num?: number,
  page_size?: number,
}
export interface GetMyTemplateListResponse {
  templates: TemplateInfo[],
  has_more: boolean,
  total: number,
  code: number,
  msg: string,
}
export interface TemplateInfo {
  template_id: string,
  agent_id: string,
  title: string,
  description?: string,
  status: string,
  created_at: string,
  heat?: string,
  cover_uri?: string,
}
export interface DeleteTemplateRequest {
  template_id: string
}
export interface DeleteTemplateResponse {
  code: number,
  msg: string,
}
export interface UnpublishTemplateRequest {
  agent_id: string
}
export interface UnpublishTemplateResponse {
  code: number,
  msg: string,
}
export interface CheckPublishStatusRequest {
  agent_id: string
}
export interface CheckPublishStatusResponse {
  is_published: boolean,
  template_info?: TemplateInfo,
  code: number,
  msg: string,
}
export interface UploadTemplateIconRequest {
  file_head: CommonFileInfo,
  data: string,
}
export interface CommonFileInfo {
  file_type: string,
  biz_type: FileBizType,
}
export enum FileBizType {
  BIZ_UNKNOWN = 0,
  BIZ_TEMPLATE_ICON = 11,
}
export interface UploadTemplateIconResponse {
  data: TemplateIconData,
  code: number,
  msg: string,
}
export interface TemplateIconData {
  upload_url: string,
  upload_uri: string,
}
/** 发布到商店的请求结构 */
export interface PublishToStoreRequest {
  agent_id: string,
  title: string,
  description?: string,
  tags?: string[],
  cover_uri?: string,
}
export interface PublishToStoreResponse {
  store_template_id: string,
  status: string,
  code: number,
  msg: string,
}
/** 获取商店模板列表的请求结构 */
export interface GetStoreTemplateListRequest {
  page_num?: number,
  page_size?: number,
  search_keyword?: string,
  tags?: string[],
}
export interface GetStoreTemplateListResponse {
  templates: StoreTemplateInfo[],
  has_more: boolean,
  total: number,
  code: number,
  msg: string,
}
/** 商店模板信息结构 */
export interface StoreTemplateInfo {
  template_id: string,
  agent_id: string,
  title: string,
  description?: string,
  status: string,
  created_at: string,
  heat?: string,
  cover_uri?: string,
  cover_url?: string,
  tags?: string[],
  author_name?: string,
  author_avatar?: string,
}
/** 从商店取消发布的请求结构 */
export interface UnpublishFromStoreRequest {
  agent_id: string
}
export interface UnpublishFromStoreResponse {
  code: number,
  msg: string,
}
/** 检查商店发布状态的请求结构 */
export interface CheckStorePublishStatusRequest {
  agent_id: string
}
export interface CheckStorePublishStatusResponse {
  is_published: boolean,
  template_info?: StoreTemplateInfo,
  code: number,
  msg: string,
}
export const PublishAsTemplate = /*#__PURE__*/createAPI<PublishAsTemplateRequest, PublishAsTemplateResponse>({
  "url": "/api/template/publish",
  "method": "POST",
  "name": "PublishAsTemplate",
  "reqType": "PublishAsTemplateRequest",
  "reqMapping": {
    "body": ["agent_id", "title", "description", "category_id", "labels", "is_public", "cover_uri"]
  },
  "resType": "PublishAsTemplateResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const GetMyTemplateList = /*#__PURE__*/createAPI<GetMyTemplateListRequest, GetMyTemplateListResponse>({
  "url": "/api/template/my-list",
  "method": "GET",
  "name": "GetMyTemplateList",
  "reqType": "GetMyTemplateListRequest",
  "reqMapping": {
    "query": ["page_num", "page_size"]
  },
  "resType": "GetMyTemplateListResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const DeleteTemplate = /*#__PURE__*/createAPI<DeleteTemplateRequest, DeleteTemplateResponse>({
  "url": "/api/template/{template_id}",
  "method": "DELETE",
  "name": "DeleteTemplate",
  "reqType": "DeleteTemplateRequest",
  "reqMapping": {
    "path": ["template_id"]
  },
  "resType": "DeleteTemplateResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const UnpublishTemplate = /*#__PURE__*/createAPI<UnpublishTemplateRequest, UnpublishTemplateResponse>({
  "url": "/api/template/unpublish",
  "method": "POST",
  "name": "UnpublishTemplate",
  "reqType": "UnpublishTemplateRequest",
  "reqMapping": {
    "body": ["agent_id"]
  },
  "resType": "UnpublishTemplateResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const CheckPublishStatus = /*#__PURE__*/createAPI<CheckPublishStatusRequest, CheckPublishStatusResponse>({
  "url": "/api/template/check-status",
  "method": "GET",
  "name": "CheckPublishStatus",
  "reqType": "CheckPublishStatusRequest",
  "reqMapping": {
    "query": ["agent_id"]
  },
  "resType": "CheckPublishStatusResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const UploadTemplateIcon = /*#__PURE__*/createAPI<UploadTemplateIconRequest, UploadTemplateIconResponse>({
  "url": "/api/template/upload_icon",
  "method": "POST",
  "name": "UploadTemplateIcon",
  "reqType": "UploadTemplateIconRequest",
  "reqMapping": {
    "body": ["file_head", "data"]
  },
  "resType": "UploadTemplateIconResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
/** 商店相关接口 */
export const PublishToStore = /*#__PURE__*/createAPI<PublishToStoreRequest, PublishToStoreResponse>({
  "url": "/api/template/store/publish",
  "method": "POST",
  "name": "PublishToStore",
  "reqType": "PublishToStoreRequest",
  "reqMapping": {
    "body": ["agent_id", "title", "description", "tags", "cover_uri"]
  },
  "resType": "PublishToStoreResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const GetStoreTemplateList = /*#__PURE__*/createAPI<GetStoreTemplateListRequest, GetStoreTemplateListResponse>({
  "url": "/api/template/store/list",
  "method": "GET",
  "name": "GetStoreTemplateList",
  "reqType": "GetStoreTemplateListRequest",
  "reqMapping": {
    "query": ["page_num", "page_size", "search_keyword", "tags"]
  },
  "resType": "GetStoreTemplateListResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const UnpublishFromStore = /*#__PURE__*/createAPI<UnpublishFromStoreRequest, UnpublishFromStoreResponse>({
  "url": "/api/template/store/unpublish",
  "method": "POST",
  "name": "UnpublishFromStore",
  "reqType": "UnpublishFromStoreRequest",
  "reqMapping": {
    "body": ["agent_id"]
  },
  "resType": "UnpublishFromStoreResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});
export const CheckStorePublishStatus = /*#__PURE__*/createAPI<CheckStorePublishStatusRequest, CheckStorePublishStatusResponse>({
  "url": "/api/template/store/check-status",
  "method": "GET",
  "name": "CheckStorePublishStatus",
  "reqType": "CheckStorePublishStatusRequest",
  "reqMapping": {
    "query": ["agent_id"]
  },
  "resType": "CheckStorePublishStatusResponse",
  "schemaRoot": "api://schemas/idl_template_template_publish",
  "service": "template_publish"
});