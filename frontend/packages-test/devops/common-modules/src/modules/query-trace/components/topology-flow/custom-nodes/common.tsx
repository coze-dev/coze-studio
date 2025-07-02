import {
  Handle,
  type NodeProps,
  Position,
  useUpdateNodeInternals,
} from 'reactflow';

import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { Typography } from '@coze-arch/bot-semi';
import { SpanCategory } from '@coze-arch/bot-api/ob_query_api';

import { getTopologyItemStatus } from '../util';
import { type NodeData } from '../typing';
import {
  TOPOLOGY_EDGE_STATUS_MAP,
  TopologyEdgeStatus,
  TopologyLayoutDirection,
} from '../constant';

import s from './common.module.less';

const { Text } = Typography;

export const CommonNode = (props: NodeProps<NodeData>) => {
  const {
    id,
    type,
    data: { name, icon, layoutDirection, dynamicSpanNode },
  } = props;

  // 特化逻辑：动态tracing中没有workflow_start节点，topo中workflow_start节点默认高亮
  const topologyNodeStatus =
    Number(type) === SpanCategory.WorkflowStart
      ? TopologyEdgeStatus.DYNAMIC
      : getTopologyItemStatus(dynamicSpanNode);

  const updateNodeInternals = useUpdateNodeInternals();

  useUpdateEffect(() => {
    updateNodeInternals(id);
  }, [layoutDirection]);

  return (
    <div className={s['common-node']}>
      <Handle
        type="target"
        position={
          layoutDirection === TopologyLayoutDirection.LR
            ? Position.Left
            : Position.Top
        }
      />
      <Handle
        type="source"
        position={
          layoutDirection === TopologyLayoutDirection.LR
            ? Position.Right
            : Position.Bottom
        }
      />
      <div
        className={classNames(
          s['common-node-container'],
          s[TOPOLOGY_EDGE_STATUS_MAP[topologyNodeStatus].nodeClassName],
        )}
      >
        {icon}
        <Text
          className={s['common-node-container-text']}
          ellipsis={{ showTooltip: true }}
        >
          {name}
        </Text>
      </div>
    </div>
  );
};
