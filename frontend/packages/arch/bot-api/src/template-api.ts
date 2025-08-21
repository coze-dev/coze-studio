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

import { axiosInstance, type BotAPIRequestConfig } from './axios';

export interface PublishAsTemplateRequest {
  agent_id: string; // 使用字符串避免精度丢失
  title: string;
  description?: string;
  category_id?: number;
  labels?: string[];
  is_public: boolean;
  cover_uri?: string;
}

export interface PublishAsTemplateResponse {
  template_id: number;
  status: string;
  code: number;
  msg: string;
}

export interface GetMyTemplateListRequest {
  page_num?: number;
  page_size?: number;
}

export interface TemplateInfo {
  template_id: number;
  agent_id: string; // 使用字符串避免精度丢失
  title: string;
  description?: string;
  status: string;
  created_at: number;
  heat?: number;
  cover_uri?: string;
  cover_url?: string; // 可访问的URL
}

export interface GetMyTemplateListResponse {
  templates: TemplateInfo[];
  has_more: boolean;
  total: number;
  code: number;
  msg: string;
}

export interface DeleteTemplateRequest {
  template_id: number;
}

export interface DeleteTemplateResponse {
  code: number;
  msg: string;
}

export interface UnpublishTemplateRequest {
  agent_id: string; // 使用字符串避免精度丢失
}

export interface UnpublishTemplateResponse {
  code: number;
  msg: string;
}

export interface CheckPublishStatusRequest {
  agent_id: string; // 使用字符串避免精度丢失
}

export interface CheckPublishStatusResponse {
  is_published: boolean;
  template_info?: TemplateInfo;
  code: number;
  msg: string;
}

export interface UploadTemplateIconRequest {
  file_head: {
    file_type: string;
    biz_type: number; // BIZ_TEMPLATE_ICON = 11
  };
  data: string; // base64 encoded file data
}

export interface UploadTemplateIconResponse {
  data: {
    upload_url: string;
    upload_uri: string;
  };
  code: number;
  msg: string;
}

// ========== 商店相关接口定义 ==========

export interface PublishToStoreRequest {
  agent_id: string; // 使用字符串避免精度丢失
  title: string;
  description?: string;
  tags?: string[];
  cover_uri?: string;
}

export interface PublishToStoreResponse {
  store_template_id: number;
  status: string;
  code: number;
  msg: string;
}

export interface GetStoreTemplateListRequest {
  page_num?: number;
  page_size?: number;
  search_keyword?: string;
  tags?: string[];
}

export interface StoreTemplateInfo {
  template_id: string; // 使用字符串避免精度丢失
  agent_id: string; // 使用字符串避免精度丢失
  title: string;
  description?: string;
  status: string;
  created_at: string; // 使用字符串避免精度丢失
  heat?: string; // 使用字符串避免精度丢失
  cover_uri?: string;
  cover_url?: string;
  tags?: string[];
  author_name?: string;
  author_avatar?: string;
}

export interface GetStoreTemplateListResponse {
  templates: StoreTemplateInfo[];
  has_more: boolean;
  total: number;
  code: number;
  msg: string;
}

export interface UnpublishFromStoreRequest {
  agent_id: string; // 使用字符串避免精度丢失
}

export interface UnpublishFromStoreResponse {
  code: number;
  msg: string;
}

export interface CheckStorePublishStatusRequest {
  agent_id: string; // 使用字符串避免精度丢失
}

export interface CheckStorePublishStatusResponse {
  is_published: boolean;
  template_info?: StoreTemplateInfo;
  code: number;
  msg: string;
}

class TemplateApiService {
  async publishAsTemplate(
    data: PublishAsTemplateRequest,
    config?: BotAPIRequestConfig,
  ): Promise<PublishAsTemplateResponse> {
    return await axiosInstance.post('/api/template/publish', data, config);
  }

  async getMyTemplateList(
    params?: GetMyTemplateListRequest,
    config?: BotAPIRequestConfig,
  ): Promise<GetMyTemplateListResponse> {
    return await axiosInstance.get('/api/template/my-list', { params, ...config });
  }

  async deleteTemplate(
    templateId: number,
    config?: BotAPIRequestConfig,
  ): Promise<DeleteTemplateResponse> {
    return await axiosInstance.delete(`/api/template/${templateId}`, config);
  }

  async unpublishTemplate(
    data: UnpublishTemplateRequest,
    config?: BotAPIRequestConfig,
  ): Promise<UnpublishTemplateResponse> {
    return await axiosInstance.post('/api/template/unpublish', data, config);
  }

  async checkPublishStatus(
    params: CheckPublishStatusRequest,
    config?: BotAPIRequestConfig,
  ): Promise<CheckPublishStatusResponse> {
    return await axiosInstance.get('/api/template/check-status', { params, ...config });
  }

  async uploadTemplateIcon(
    data: UploadTemplateIconRequest,
    config?: BotAPIRequestConfig,
  ): Promise<UploadTemplateIconResponse> {
    return await axiosInstance.post('/api/template/upload_icon', data, config);
  }

  // ========== 商店相关方法 ==========

  async publishToStore(
    data: PublishToStoreRequest,
    config?: BotAPIRequestConfig,
  ): Promise<PublishToStoreResponse> {
    return await axiosInstance.post('/api/template/store/publish', data, config);
  }

  async getStoreTemplateList(
    params?: GetStoreTemplateListRequest,
    config?: BotAPIRequestConfig,
  ): Promise<GetStoreTemplateListResponse> {
    return await axiosInstance.get('/api/template/store/list', { params, ...config });
  }

  async unpublishFromStore(
    data: UnpublishFromStoreRequest,
    config?: BotAPIRequestConfig,
  ): Promise<UnpublishFromStoreResponse> {
    return await axiosInstance.post('/api/template/store/unpublish', data, config);
  }

  async checkStorePublishStatus(
    params: CheckStorePublishStatusRequest,
    config?: BotAPIRequestConfig,
  ): Promise<CheckStorePublishStatusResponse> {
    return await axiosInstance.get('/api/template/store/check-status', { params, ...config });
  }
}

export const templateApi = new TemplateApiService();