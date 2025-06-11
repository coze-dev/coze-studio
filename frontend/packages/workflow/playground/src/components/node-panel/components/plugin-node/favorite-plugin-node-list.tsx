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
