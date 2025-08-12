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

export type ProductEventSource =
  | 'add_plugin_menu'
  | 'bots_card'
  | 'explore_card'
  | 'plugin_card'
  | 'project_card'
  | 'top_card'
  | 'bots_detailpage'
  | 'explore_bot_detailpage'
  | 'workflow_card'
  | 'plugin_detailpage'
  | 'project_detailpage'
  | 'imageflow_card'
  | 'home_recommend'
  | 'home_feed'
  | 'store_search_suggestion'
  | 'store_search_resultspage'
  | 'user_profile';

export type ProductEventFilterTag = 'all' | 'recommend' | 'recent';

export type ProductEventEntityType =
  | 'bot'
  | 'plugin'
  | 'workflow'
  | 'imageflow'
  | 'project';

export interface ProductShowFrontParams {
  product_id: string;
  product_name: string;
  entity_type: ProductEventEntityType;
  bot_id?: string;
  plugin_id?: string;
  project_id?: string;
  c_position: number;
  filter_tag: string;
  source: ProductEventSource;
  from?: ProductEventSource;
}

export type ProductActionType = 'run';

export interface ProductRunFrontParams {
  product_id: string;
  product_name: string;
  entity_id?: string;
  entity_type: ProductEventEntityType;
  action: ProductActionType;
}

export interface ProductClickFrontParams {
  bot_id?: string;
  plugin_id?: string;
  entity_type: ProductEventEntityType;
  product_name: string;
  product_id: string;
  c_position: number;
  filter_tag: string;
  source: ProductEventSource;
  from?: string;
  action: 'enter_detailpage' | 'expand_tools';
  access_entrance?: string;
}
