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

import { type ProductShowFrontParams } from '@coze-arch/bot-tea';
import {
  ProductEntityType,
  type ProductMetaInfo,
} from '@coze-arch/bot-api/product_api';

const entityIdKeyMap = {
  [ProductEntityType.Bot]: 'bot_id',
  [ProductEntityType.Project]: 'project_id',
  [ProductEntityType.Plugin]: 'plugin_id',
} satisfies Partial<Record<ProductEntityType, keyof ProductShowFrontParams>>;

const entityTypeMap = {
  [ProductEntityType.Bot]: 'bot',
  [ProductEntityType.Project]: 'project',
  [ProductEntityType.Plugin]: 'plugin',
} satisfies Partial<
  Record<ProductEntityType, ProductShowFrontParams['entity_type']>
>;

export const getProductShowFrontCommonParams = (metaInfo: ProductMetaInfo) => {
  const entityIdKey =
    entityIdKeyMap[metaInfo.entity_type ?? ProductEntityType.Bot];
  const entityType =
    entityTypeMap[metaInfo.entity_type ?? ProductEntityType.Bot];

  return {
    product_id: metaInfo.id ?? '',
    product_name: metaInfo.name ?? '',
    ...(entityIdKey
      ? {
          [entityIdKey]: metaInfo.entity_id,
        }
      : {}),
    entity_type: entityType ?? 'bot',
  } satisfies Partial<ProductShowFrontParams>;
};
