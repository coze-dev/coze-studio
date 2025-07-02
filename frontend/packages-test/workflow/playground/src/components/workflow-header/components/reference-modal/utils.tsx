import { isNil } from 'lodash-es';
import { NodeType, DependencyOrigin } from '@coze-common/resource-tree';

export const navigateResource = ({
  info,
  spaceId,
  projectId,
}: {
  info: {
    id: string;
    type: NodeType;
    from: DependencyOrigin;
  };
  spaceId: string;
  projectId?: string;
}) => {
  if (!spaceId) {
    return;
  }
  if (!(info.id && !isNil(info.type))) {
    return;
  }

  if (info.from === DependencyOrigin.APP && projectId) {
    switch (info.type) {
      case NodeType.PLUGIN:
        window.open(
          `/space/${spaceId}/project-ide/${projectId}/plugin/${info.id}`,
        );
        break;
      case NodeType.WORKFLOW:
      case NodeType.CHAT_FLOW:
        window.open(
          `/space/${spaceId}/project-ide/${projectId}/workflow/${info.id}`,
        );
        break;
      case NodeType.KNOWLEDGE:
        window.open(
          `/space/${spaceId}/project-ide/${projectId}/knowledge/${info.id}`,
        );
        break;
      case NodeType.DATABASE:
        window.open(
          `/space/${spaceId}/project-ide/${projectId}/database/${info.id}`,
        );
        break;
      default:
        return;
    }
  }

  if (info.from === DependencyOrigin.LIBRARY) {
    switch (info.type) {
      case NodeType.PLUGIN:
        window.open(`/space/${spaceId}/plugin/${info.id}`);
        break;
      case NodeType.WORKFLOW:
      case NodeType.CHAT_FLOW:
        window.open(`/work_flow?space_id=${spaceId}&workflow_id=${info.id}`);
        break;
      case NodeType.KNOWLEDGE:
        window.open(`/space/${spaceId}/knowledge/${info.id}`);
        break;
      case NodeType.DATABASE:
        window.open(`/space/${spaceId}/database/${info.id}`);
        break;
      default:
        return;
    }
  }
  // 只有插件可能是来源为商店
  if (info.type === NodeType.PLUGIN && info.from === DependencyOrigin.SHOP) {
    window.open(`/store/plugin/${info.id}`);
  }
};
