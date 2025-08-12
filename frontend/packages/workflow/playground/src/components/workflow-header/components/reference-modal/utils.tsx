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
  // Only plugins may be sourced for the store
  if (info.type === NodeType.PLUGIN && info.from === DependencyOrigin.SHOP) {
    window.open(`/store/plugin/${info.id}`);
  }
};
