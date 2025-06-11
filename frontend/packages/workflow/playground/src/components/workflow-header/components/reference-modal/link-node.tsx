import React from 'react';

import { I18n } from '@coze-arch/i18n';
import { IconCozLongArrowTopRight } from '@coze/coze-design/icons';
import { Tooltip, IconButton } from '@coze/coze-design';
import { NodeType, DependencyOrigin } from '@coze-common/resource-tree';

import { usePluginDetail } from '@coze-workflow/playground';
import { navigateResource } from './utils';

export const LinkNode = ({
  extraInfo,
  spaceId,
  projectId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extraInfo: any;
  spaceId: string;
  projectId?: string;
}) => {
  // 新标签页打开
  // 业务侧的 navigate 跳转逻辑
  const isStorePlugin =
    extraInfo.type === NodeType.PLUGIN &&
    extraInfo.from === DependencyOrigin.SHOP;
  const { isLoading, storePluginId } = usePluginDetail({
    pluginId: extraInfo.id,
    needQuery: isStorePlugin,
  });

  const handleJump = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateResource({
      info: {
        ...extraInfo,
        id: storePluginId,
      },
      spaceId,
      projectId,
    });
  };
  return (
    <Tooltip
      content={I18n.t('reference_graph_node_open_in_new_tab')}
      theme="dark"
    >
      <IconButton
        loading={isLoading}
        size="small"
        icon={<IconCozLongArrowTopRight />}
        onClick={handleJump}
      />
    </Tooltip>
  );
};
