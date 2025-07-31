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

import { useEffect, forwardRef, useImperativeHandle } from 'react';

import { I18n } from '@coze-arch/i18n';

import { useFavoritePluginNodeList } from '../../hooks';
import { PluginNodeList } from './plugin-node-list';
export interface FavoritePluginNodeListRefType {
  refetch: () => Promise<void>;
}
export const FavoritePluginNodeList = forwardRef<FavoritePluginNodeListRefType>(
  (props, ref) => {
    const { pluginNodeList, hasMore, loadMore, refetch } =
      useFavoritePluginNodeList();

    useImperativeHandle(ref, () => ({
      refetch,
    }));
    useEffect(() => {
      refetch();
    }, []);

    if (!pluginNodeList?.length) {
      return null;
    }
    return (
      <PluginNodeList
        categoryName={I18n.t('workflow_0224_03')}
        pluginNodeList={pluginNodeList}
        hasMore={hasMore}
        onLoadMore={loadMore}
        showExploreMore
      />
    );
  },
);
