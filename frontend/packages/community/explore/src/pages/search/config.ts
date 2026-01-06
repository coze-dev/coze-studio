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
  getAllowEntitySortList,
  defaultEntityAreaSort,
  entityUrlMap,
} from '@coze-community/components/search-input/config.js';
import { I18n } from '@coze-arch/i18n';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';

import {
  type ValidEntityType,
  type FilterConfig,
  type SearchFilter,
} from './type';

export { getAllowEntitySortList, defaultEntityAreaSort, entityUrlMap };
// tab项的 i18nKey
export const entitySelectorI18nKeyMap: Record<ValidEntityType, string> = {
  [ProductEntityType.Bot]: 'project_store_search_result',
  [ProductEntityType.Plugin]: 'store_search_result2',
  [ProductEntityType.TemplateCommon]: 'store_search_result6',
  [ProductEntityType.WorkflowTemplate]: 'store_search_result3',
  [ProductEntityType.WorkflowTemplateV2]: 'store_search_result3',
  [ProductEntityType.SocialScene]: 'scene_mkpl_search_tab_title2',
  [ProductEntityType.ImageflowTemplate]: 'store_search_result3',
  [ProductEntityType.ImageflowTemplateV2]: 'store_search_result3',
};

// 搜索框中默认的数实例对象 { bot: 0, socialScene: 0}
export const defaultEntityNumMap: Partial<Record<ProductEntityType, number>> =
  Object.fromEntries(defaultEntityAreaSort.map(item => [item, 0]));

// 搜索框中默认的数实例对象
export const defaultEntityFilterConfigMap: FilterConfig = {
  [ProductEntityType.Bot]: {},
  [ProductEntityType.Plugin]: {},
  [ProductEntityType.TemplateCommon]: {},
  [ProductEntityType.WorkflowTemplate]: {},
  [ProductEntityType.WorkflowTemplateV2]: {},
  [ProductEntityType.SocialScene]: {},
  [ProductEntityType.ImageflowTemplate]: {},
  [ProductEntityType.ImageflowTemplateV2]: {},
};

// 搜索框中默认的数实例对象
export const defaultEntitySearchFilterMap: SearchFilter = {
  [ProductEntityType.Bot]: {},
  [ProductEntityType.Plugin]: {},
  [ProductEntityType.TemplateCommon]: {},
  [ProductEntityType.WorkflowTemplate]: {},
  [ProductEntityType.WorkflowTemplateV2]: {},
  [ProductEntityType.SocialScene]: {},
  [ProductEntityType.ImageflowTemplate]: {},
  [ProductEntityType.ImageflowTemplateV2]: {},
};

export const emptyText = {
  [ProductEntityType.Bot]: () => I18n.t('store_bot_create'),
  [ProductEntityType.Plugin]: () => I18n.t('store_search_create_plugin'),
  [ProductEntityType.TemplateCommon]: () => false,
  [ProductEntityType.WorkflowTemplate]: () =>
    I18n.t('store_search_create_workflow'),
  [ProductEntityType.WorkflowTemplateV2]: () => false,
  [ProductEntityType.SocialScene]: () => I18n.t('scene_create_scene'),
  [ProductEntityType.ImageflowTemplate]: () =>
    I18n.t('store_search_create_imageflow'),
  [ProductEntityType.ImageflowTemplateV2]: () => false,
};

const defaultResponsiveNum = {
  sm: 1,
  md: 2,
  lg: 3,
};
export const gridResponsiveNumMap = {
  [ProductEntityType.Bot]: defaultResponsiveNum,
  [ProductEntityType.Plugin]: defaultResponsiveNum,
  [ProductEntityType.TemplateCommon]: defaultResponsiveNum,
  [ProductEntityType.WorkflowTemplate]: defaultResponsiveNum,
  [ProductEntityType.WorkflowTemplateV2]: defaultResponsiveNum,
  [ProductEntityType.SocialScene]: defaultResponsiveNum,
  [ProductEntityType.ImageflowTemplate]: defaultResponsiveNum,
  [ProductEntityType.ImageflowTemplateV2]: defaultResponsiveNum,
};
