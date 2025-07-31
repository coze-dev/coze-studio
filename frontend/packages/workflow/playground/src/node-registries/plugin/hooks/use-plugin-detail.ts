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

import { useQuery } from '@tanstack/react-query';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

interface Params {
  pluginId: string;
  /** Do you need to request the store ID? If it is a locally developed plug-in, it is not on the shelves. You don't need to request it, just return the pluginId directly. */
  needQuery: boolean;
}

/** Internal cache, key is pluginID, value is pluginId productId in store */
const cache = new Map<string, string>();

export function usePluginDetail({ pluginId, needQuery }: Params) {
  const { isLoading, data } = useQuery({
    queryKey: ['plugin-detail', pluginId],
    // Failed Try again to avoid jitter
    retry: 1,
    queryFn: async () => {
      if (!needQuery) {
        return pluginId;
      }

      // If the cache is hit
      if (cache.get(pluginId)) {
        return cache.get(pluginId);
      }

      const res = await ProductApi.PublicGetProductDetail(
        {
          entity_type: ProductEntityType.Plugin,
          entity_id: pluginId,
          need_audit_failed: true,
          product_id: '',
        },
        {
          __disableErrorToast: true,
        },
      );

      const id = res?.data?.meta_info?.id;
      if (id) {
        cache.set(pluginId, id);
      }

      return id;
    },
  });

  return { isLoading, storePluginId: data };
}
