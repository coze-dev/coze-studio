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

import { type FC } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';
import { type NodeData, WorkflowNodeData } from '@coze-workflow/nodes';
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { CustomError } from '@coze-arch/bot-error';
export {
  NodeIconOutlined,
  type NodeIconOutlinedProps,
} from './node-icon-outlined';
interface NodeIconProps {
  nodeId: string;
  size?: number;
  alt?: string;
}
export const NodeIcon: FC<WithCustomStyle<NodeIconProps>> = props => {
  const { nodeId, className, size, alt } = props;

  const playground = usePlayground();

  let nodeEntity: FlowNodeEntity | undefined;

  try {
    nodeEntity = playground.entityManager.getEntityById(nodeId);
  } catch (e) {
    throw new CustomError(
      `[NodeIcon] get node entity error, id: ${nodeId}`,
      e.message,
    );
  }

  if (!nodeEntity) {
    return null;
  }

  const nodeDataEntity = nodeEntity.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity.getNodeData<keyof NodeData>();

  if (!nodeData?.icon) {
    return null;
  }

  return (
    <div className={className}>
      <img
        className="object-cover"
        src={nodeData.icon}
        alt={alt}
        style={{
          width: size || 'auto',
          height: size || 'auto',
        }}
      />
    </div>
  );
};
