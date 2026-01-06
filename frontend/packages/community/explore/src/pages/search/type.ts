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

import {
  type product_common,
  type SearchProductRequest,
  type ProductEntityType,
  type FilterType,
  type FilterInfo,
  type ProductCategory,
} from '@coze-arch/bot-api/product_api';

export interface SearchFilter {
  // NOTE project 与 agent 混排，但是这里只能有一个 entityType 值，project 复用 agent 的值
  [ProductEntityType.Bot]: {
    /** 开闭源 */
    publish_mode?: product_common.ProductPublishMode;
    /** 使用的模型 */
    model_ids?: SearchProductRequest['model_ids'];
    /** 多模态 */
    bot_mod_type?: SearchProductRequest['bot_mod_type'];
    /** 子属性 */
    components?: SearchProductRequest['components'];
    /** 发布渠道 id */
    publish_platform_ids?: SearchProductRequest['publish_platform_ids'];
    /** 分类 */
    category_ids?: SearchProductRequest['category_ids'];
    /** 分类 支持筛选 bot or project or both  */
    entity_types?: ProductEntityType[];
  };
  [ProductEntityType.Plugin]: {
    is_official?: SearchProductRequest['is_official'];
    plugin_type?: SearchProductRequest['plugin_type'];
    product_paid_type?: SearchProductRequest['product_paid_type'];
    category_ids?: SearchProductRequest['category_ids'];
  };
  [ProductEntityType.TemplateCommon]: {
    is_official?: SearchProductRequest['is_official'];
    category_ids?: SearchProductRequest['category_ids'];
  };
  [ProductEntityType.WorkflowTemplate]: {
    category_ids?: SearchProductRequest['category_ids'];
  };
  [ProductEntityType.WorkflowTemplateV2]: {
    category_ids?: SearchProductRequest['category_ids'];
  };

  [ProductEntityType.SocialScene]: {
    publish_mode?: product_common.ProductPublishMode;
    category_ids?: SearchProductRequest['category_ids'];
  };
  [ProductEntityType.ImageflowTemplate]: {
    category_ids?: SearchProductRequest['category_ids'];
  };
  [ProductEntityType.ImageflowTemplateV2]: {
    category_ids?: SearchProductRequest['category_ids'];
  };
}

export interface FilterConfig {
  [ProductEntityType.Bot]: {
    categoryIds?: ProductCategory[];
    filterInfo?: Record<FilterType, Array<FilterInfo>>;
  };

  [ProductEntityType.Plugin]: {
    categoryIds?: ProductCategory[];
  };
  [ProductEntityType.TemplateCommon]: {
    categoryIds?: ProductCategory[];
  };
  [ProductEntityType.WorkflowTemplate]: {
    categoryIds?: ProductCategory[];
  };
  [ProductEntityType.WorkflowTemplateV2]: {
    categoryIds?: ProductCategory[];
  };
  [ProductEntityType.SocialScene]: {
    categoryIds?: ProductCategory[];
  };
  [ProductEntityType.ImageflowTemplate]: {
    categoryIds?: ProductCategory[];
  };
  [ProductEntityType.ImageflowTemplateV2]: {
    categoryIds?: ProductCategory[];
  };
}

export type ValidEntityType =
  | ProductEntityType.Bot
  | ProductEntityType.Plugin
  | ProductEntityType.TemplateCommon
  | ProductEntityType.WorkflowTemplate
  | ProductEntityType.WorkflowTemplateV2
  | ProductEntityType.SocialScene
  | ProductEntityType.ImageflowTemplate
  | ProductEntityType.ImageflowTemplateV2;
