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

// 避免节点删除后丢失icon、title信息
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
