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

import { I18n } from '@coze-arch/i18n';
import {
  ProductEntityType,
  type ProductInfo,
} from '@coze-arch/bot-api/product_api';

export interface RecommendAreaRef {
  getResultList: () => ProductInfo[];
  isLoading: () => boolean;
}

// 用于搜索框的展示顺序
export const defaultEntityAreaSort = [ProductEntityType.Plugin];

// 精简的程序列表， 按顺序
export const simpleEntitySelecotorSort: Array<ProductEntityType> = [
  ProductEntityType.Plugin,
];

// 搜索框中默认的数据数量。{ bot: 0, socialScene: 0}
export const defaultEntityAreaNumMap = Object.fromEntries(
  defaultEntityAreaSort.map(item => [item, 0]),
);

// 搜索框中默认的数实例对象 { bot: null, socialScene: null}
export const defaultEntityAreaRefMap: Partial<
  Record<ProductEntityType, RecommendAreaRef | null>
> = Object.fromEntries(defaultEntityAreaSort.map(item => [item, null]));

// 用于搜索框中的 模块标题
export const entityNameMap: Partial<Record<ProductEntityType, () => string>> = {
  [ProductEntityType.Bot]: () => I18n.t('project_store_search'),
  [ProductEntityType.Plugin]: () => I18n.t('store_search_recommend_result2'),
  [ProductEntityType.TemplateCommon]: () => I18n.t('template_name'),
};

// 用于跳转链接，以及数据上报
export const entityUrlMap: Partial<Record<ProductEntityType, string>> = {
  [ProductEntityType.Bot]: 'bot',
  [ProductEntityType.Plugin]: 'plugin',
  [ProductEntityType.TemplateCommon]: 'template',
};

// 用于跳转链接，不传id跳转列表页，传id跳转详情页
export const getEntityUrl = (
  entityType: ProductEntityType,
  id?: string,
  from?: string,
) => {
  const fromQuery = from ? `?from=${from}` : '';
  switch (entityType) {
    case ProductEntityType.Plugin:
    case ProductEntityType.SaasPlugin:
      return id
        ? `https://www.coze.cn/store/plugin/${id}${fromQuery}`
        : '/explore/plugin';
    default:
      return '#';
  }
};

// 用于显示entity的数据信息
export const entityShowStaticsMap: Partial<
  Record<
    ProductEntityType,
    Array<{
      label: (productInfo?: ProductInfo) => string;
      getValue: (productInfo: ProductInfo) => number;
    }>
  >
> = {
  [ProductEntityType.Bot]: [
    {
      label: () => I18n.t('store_search_chat'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.bot_extra?.chat_conversation_count) || 0,
    },
    {
      label: () => I18n.t('store_search_use'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.bot_extra?.user_count) || 0,
    },
    {
      label: () => I18n.t('store_search_collect'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.meta_info?.favorite_count) || 0,
    },
  ],
  [ProductEntityType.Project]: [
    {
      label: () => I18n.t('store_search_use'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.project_extra?.user_count) || 0,
    },
    {
      label: () => I18n.t('template_run'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.project_extra?.execute_count) || 0,
    },
    {
      label: () => I18n.t('mkpl_num_favorites'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.meta_info?.favorite_count) || 0,
    },
  ],
  [ProductEntityType.Plugin]: [
    {
      label: () => I18n.t('store_search_use'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.plugin_extra?.bots_use_count) || 0,
    },
    {
      label: () => I18n.t('store_search_collect'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.meta_info?.favorite_count) || 0,
    },
    {
      label: () => I18n.t('store_search_call'),
      getValue: (productInfo: ProductInfo) =>
        Number(productInfo?.plugin_extra?.call_amount) || 0,
    },
  ],
  [ProductEntityType.TemplateCommon]: [
    {
      label: () => I18n.t('workflowstore_card_duplicate'),
      getValue: (productInfo: ProductInfo) => productInfo?.meta_info?.heat || 0,
    },
  ],
  [ProductEntityType.BotTemplate]: [
    {
      label: () => I18n.t('workflowstore_card_duplicate'),
      getValue: (productInfo: ProductInfo) => productInfo?.meta_info?.heat || 0,
    },
    {
      label: () => I18n.t('store_search_chat'),
      getValue: productInfo =>
        Number(productInfo?.bot_extra?.chat_conversation_count),
    },
  ],
  [ProductEntityType.ProjectTemplate]: [
    {
      label: () => I18n.t('workflowstore_card_duplicate'),
      getValue: productInfo => productInfo?.meta_info?.heat || 0,
    },
    {
      label: () => I18n.t('template_search_run'),
      getValue: productInfo => productInfo?.project_extra?.execute_count || 0,
    },
  ],
  [ProductEntityType.WorkflowTemplateV2]: [
    {
      label: () => I18n.t('workflowstore_card_duplicate'),
      getValue: productInfo => productInfo?.meta_info?.heat || 0,
    },
    {
      label: () => I18n.t('template_search_run'),
      getValue: productInfo =>
        Number(productInfo?.workflow_extra?.used_count) || 0,
    },
  ],
  [ProductEntityType.ImageflowTemplateV2]: [
    {
      label: () => I18n.t('workflowstore_card_duplicate'),
      getValue: productInfo => productInfo?.meta_info?.heat || 0,
    },
    {
      label: () => I18n.t('template_search_run'),
      getValue: productInfo =>
        Number(productInfo?.workflow_extra?.used_count) || 0,
    },
  ],
};

export const getAllowEntitySortList = ({ isLogin }: { isLogin?: boolean }) => {
  if (!isLogin) {
    return simpleEntitySelecotorSort;
  }

  return defaultEntityAreaSort;
};
