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

/* eslint-disable */
/* tslint:disable */
// @ts-nocheck

export type Int64 = string | number;

export interface DuplicateTemplateData {
  /** 复制后的实体ID，如果复制的是智能体模板，对应复制后的智能体ID */
  entity_id?: string;
  /** 枚举类型，目前只有 agent（智能体） */
  entity_type?: string;
}

export interface DuplicateTemplateRequest {
  /** 模板ID（目前仅支持复制智能体） */
  template_id?: string;
  /** 工作空间ID（预期将模板复制该空间） */
  workspace_id?: string;
  /** 复制后的实体名称（对于复制智能体来说，未指定则默认用复制的智能体的名称） */
  name?: string;
}

export interface DuplicateTemplateResponse {
  code?: number;
  msg?: string;
  data?: DuplicateTemplateData;
}

export interface ListCategoryData {
  /** 分类 */
  items?: Array<ProductCategory>;
  /** 分页: 是否还有更多 */
  has_more?: boolean;
}

export interface ListCategoryRequest {
  /** 实体类型 */
  entity_type?: string;
  /** 分页: 页码 */
  page_num?: number;
  /** 分页: 每页数量 */
  page_size?: number;
}

export interface ListCategoryResponse {
  code?: number;
  msg?: string;
  data?: ListCategoryData;
}

export interface ListPluginData {
  /** 插件 */
  items?: Array<ProductPluginInfo>;
  /** 分页: 是否还有更多 */
  has_more?: boolean;
}

export interface ListPluginRequest {
  /** 关键词 */
  keyword?: string;
  /** 是否官方 */
  is_official?: boolean;
  /** 分类 ID */
  category_id?: string;
  /** 分页: 页码 */
  page_num?: number;
  /** 分页: 每页数量 */
  page_size?: number;
  /** 排序: 相关性、最受欢迎、最近发布 */
  sort_type?: string;
}

export interface ListPluginResponse {
  code?: number;
  msg?: string;
  data?: ListPluginData;
}

/** 插件特定信息 */
export interface PluginInfo {
  /** 插件描述 */
  description?: string;
  /** 工具总个数 */
  total_tools_count?: number;
  /** 收藏量 */
  favorite_count?: number;
  /** 热度 */
  heat?: number;
  /** 成功率 */
  success_rate?: number;
  /** 执行时间（单位：毫秒） */
  avg_exec_duration_ms?: number;
  /** 智能体数据(数仓维护的数据) */
  bots_use_count?: Int64;
  /** 相关智能体(商店维护的数据) */
  associated_bots_use_count?: Int64;
  /** 调用量 */
  call_count?: Int64;
}

/** 商品分类信息 */
export interface ProductCategory {
  /** 分类 ID */
  id?: string;
  /** 分类名称 */
  name?: string;
}

/** 商品元信息 */
export interface ProductMetainfo {
  /** 商品 ID */
  product_id?: string;
  /** 实体 ID (比如是插件 id) */
  entity_id?: string;
  /** 实体版本 */
  entity_version?: string;
  /** 实体类型 */
  entity_type?: string;
  /** 商品名称 */
  name?: string;
  /** 商品描述 */
  description?: string;
  /** 商家信息 */
  user_info?: ProductUserInfo;
  /** 商品分类 */
  category?: ProductCategory;
  /** 商品图标 URL */
  icon_url?: string;
  /** 商品上架时间 */
  listed_at?: Int64;
  /** 商品付费类型 */
  paid_type?: string;
  /** 商品是否官方 */
  is_official?: boolean;
  /** 商店商品链接 */
  product_url?: string;
}

export interface ProductPluginInfo {
  /** 商品元信息 */
  metainfo?: ProductMetainfo;
  /** 插件特定信息 */
  plugin_info?: PluginInfo;
}

export interface ProductUserInfo {
  user_id?: Int64;
  user_name?: string;
  nick_name?: string;
  avatar_url?: string;
}
/* eslint-enable */
