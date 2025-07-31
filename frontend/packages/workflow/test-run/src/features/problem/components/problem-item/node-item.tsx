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

import { useEffect, useState } from 'react';

import { isEqual } from 'lodash-es';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { usePlayground } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowNodeData,
  type CommonNodeData,
  type NodeData,
} from '@coze-workflow/nodes';
import { Avatar } from '@coze-arch/coze-design';

import { type ProblemItem } from '../../types';
import { BaseItem } from './base-item';

interface NodeItemProps {
  problem: ProblemItem;
  onClick: (p: ProblemItem) => void;
}

// Avoid losing icon and title information after node deletion
const useMetaMemo = (nodeId: string) => {
  const [nodeMeta, setNodeMeta] = useState<CommonNodeData>();
  const playground = usePlayground();

  const node = playground.entityManager.getEntityById<FlowNodeEntity>(nodeId);
  const nodeData = node?.getData<WorkflowNodeData>(WorkflowNodeData);
  const meta = nodeData?.getNodeData<keyof NodeData>();

  useEffect(() => {
    if (meta && !isEqual(nodeMeta, meta)) {
      setNodeMeta(meta);
    }
  }, [meta]);

  return nodeMeta;
};

export const NodeItem: React.FC<NodeItemProps> = ({ problem, onClick }) => {
  const meta = useMetaMemo(problem.nodeId);

  return (
    <BaseItem
      problem={problem}
      title={meta?.title || ''}
      icon={<Avatar src={meta?.icon} shape="square" size="small" />}
      onClick={onClick}
    />
  );
};
