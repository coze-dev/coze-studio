/**
 * 节点来源
 */

import { I18n } from '@coze-arch/i18n';
import { IconCozStore, IconCozTray } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useNodeOrigin } from './use-node-origin';

interface ReferenceNodeOriginProps {
  node: FlowNodeEntity;
}

export const ReferenceNodeOrigin: React.FC<ReferenceNodeOriginProps> = ({
  node,
}) => {
  const { isFromStore, isFromLibrary } = useNodeOrigin(node);

  if (isFromStore) {
    return (
      <Tooltip content={I18n.t('workflow_node_from_store')}>
        <IconButton icon={<IconCozStore />} size="mini" color="secondary" />
      </Tooltip>
    );
  }

  if (isFromLibrary) {
    return (
      <Tooltip content={I18n.t('workflow_version_origin_tooltips')}>
        <IconButton icon={<IconCozTray />} size="mini" color="secondary" />
      </Tooltip>
    );
  }

  return null;
};
