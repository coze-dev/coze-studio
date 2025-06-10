import { type FC } from 'react';

import { type NodeSearchCategoryData, type PluginNodeTemplate } from '@/typing';

import { useNodePanelContext } from '../../hooks/node-panel-context';
import { PluginNodeList } from './plugin-node-list';
export interface PluginCategoryListProps {
  data: Array<NodeSearchCategoryData<PluginNodeTemplate>>;
}
export const PluginCategoryList: FC<PluginCategoryListProps> = ({ data }) => {
  const { onLoadMore } = useNodePanelContext();

  return (
    <>
      {data.map(({ id, categoryName, nodeList, hasMore, cursor }) => (
        <PluginNodeList
          key={id}
          categoryName={categoryName ?? ''}
          pluginNodeList={nodeList}
          hasMore={hasMore}
          onLoadMore={async () => {
            await onLoadMore?.(id, cursor ?? '');
          }}
        />
      ))}
    </>
  );
};
