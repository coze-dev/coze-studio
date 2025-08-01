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

import { useRequest } from 'ahooks';
import { type ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

export interface CategoryOptions {
  label: string;
  value: string;
}

export function useProductCategoryOptions(entityType: ProductEntityType) {
  const { data: categoryOptions, loading } = useRequest(async () => {
    const res = await ProductApi.PublicGetProductCategoryList({
      need_empty_category: true,
      entity_type: entityType,
    });
    return res.data?.categories?.map(item => ({
      label: item.name,
      value: item.id,
    })) as CategoryOptions[];
  });
  return { categoryOptions, loading };
}
