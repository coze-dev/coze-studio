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

import { useState } from 'react';

import { uniqBy } from 'lodash-es';
import { StandardNodeType } from '@coze-workflow/base';
import { type FavoriteProductInfo } from '@coze-arch/bot-api/product_api';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type PluginNodeTemplate } from '@/typing';
import { createApiNodeInfo } from '@/hooks/use-add-node-modal/helper';

import { PAGE_SIZE } from '../constant';
const formatPluginProduct = (
  productInfoList?: FavoriteProductInfo[],
): PluginNodeTemplate[] =>
  productInfoList?.map(({ product }) => {
    const pluginId = product.meta_info?.entity_id ?? '';
    const pluginName = product.meta_info?.name ?? '';
    const icon = product.meta_info?.icon_url ?? '';
    const pluginNodeTemplate: PluginNodeTemplate = {
      plugin_id: pluginId,
      name: pluginName,
      desc: product.meta_info?.description ?? '',
      icon_url: product.meta_info?.icon_url ?? '',
      tools:
        product.plugin_extra?.tools?.map(tool => {
          const nodeJSON = createApiNodeInfo(
            {
              name: tool.name,
              plugin_name: pluginName,
              api_id: tool.id,
              plugin_id: pluginId,
              desc: tool.description,
            },
            icon,
          );
          return {
            type: StandardNodeType.Api,
            name: tool.name,
            desc: tool.description,
            plugin_id: pluginId,
            api_id: tool.id,
            icon_url: icon,
            nodeJSON,
            version: '',
          };
        }) ?? [],
    };
    return pluginNodeTemplate;
  }) ?? [];

export const useFavoritePluginNodeList = (): {
  hasMore: boolean;
  pluginNodeList: PluginNodeTemplate[];
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
} => {
  const context = useService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );

  const [hasMore, setHasMore] = useState(
    context.favoritePlugins?.has_more ?? false,
  );

  const [pluginNodeList, setPluginNodeList] = useState<PluginNodeTemplate[]>(
    formatPluginProduct(context.favoritePlugins?.favorite_products),
  );

  const loadMore = async () => {
    if (!hasMore) {
      return;
    }
    const pageSize = PAGE_SIZE;
    const pageNum = Math.floor(pluginNodeList.length / pageSize + 1);
    const resp = await context.fetchFavoritePlugins({ pageNum, pageSize });
    setHasMore(resp?.has_more ?? false);
    setPluginNodeList(prev => {
      const moreList = formatPluginProduct(resp?.favorite_products);
      const newList = uniqBy(prev.concat(moreList), 'plugin_id');
      return newList;
    });
    // Update the list of plugins saved on the context and keep loading more the next time you open the node panel
    context.favoritePlugins = {
      favorite_products: context.favoritePlugins?.favorite_products?.concat(
        resp?.favorite_products ?? [],
      ),
      has_more: resp?.has_more,
    };
  };

  const refetch = async () => {
    try {
      const pageSize = Math.max(
        context.favoritePlugins?.favorite_products?.length ?? PAGE_SIZE,
        PAGE_SIZE,
      );
      const pageNum = 1;
      const resp = await context.fetchFavoritePlugins({ pageNum, pageSize });
      setHasMore(resp?.has_more ?? false);
      setPluginNodeList(formatPluginProduct(resp?.favorite_products));
      context.favoritePlugins = resp;
    } catch (e) {
      console.error('refetchFavoritePlugins error', e);
    }
  };

  return { pluginNodeList, hasMore, loadMore, refetch };
};
