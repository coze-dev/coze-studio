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

  // Specialization logic: There are no workflow_start nodes in dynamic tracing, workflow_start nodes in topo are highlighted by default
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
