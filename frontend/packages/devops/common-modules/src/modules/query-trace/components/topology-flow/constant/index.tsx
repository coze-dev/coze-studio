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
  IconCozDatabaseFill,
  IconCozLongTermMemory,
} from '@coze-arch/coze-design/icons';
import {
  IconSpanAgent,
  IconSpanBMBatch,
  IconSpanBMConnector,
  IconSpanBMParallel,
  IconSpanCard,
  IconSpanCode,
  IconSpanCondition,
  IconSpanKnowledge,
  IconSpanLLMCall,
  IconSpanMessage,
  IconSpanPluginTool,
  IconSpanUnknown,
  IconSpanHook,
  IconSpanVar,
  IconSpanWorkflow,
  IconSpanWorkflowEnd,
  IconSpanWorkflowStart,
} from '@coze-arch/bot-icons';
import { SpanCategory, SpanType } from '@coze-arch/bot-api/ob_query_api';
import { ResourceType } from '@coze-arch/bot-api/dp_manage_api';

import {
  type TopologicalStatusData,
  type TopologicalLayoutBizData,
  type TopologicalLayoutCommonData,
} from '../typing';

export const TOPOLOGY_COMMON_NODE_TEXT_FONT = '14px SF Pro Display';
export const TOPOLOGY_COMMON_NODE_TEXT_DEFAULT_WIDTH = 100;
export const TOPOLOGY_COMMON_NODE_TEXT_HEIGHT = 24;
export const TOPOLOGY_COMMON_NODE_TEXT_MAX_WIDTH = 200;
export const TOPOLOGY_COMMON_NODE_TEXT_ADDITIONAL_WIDTH = 62;
export const TOPOLOGY_COMMON_EDGE_OFFSET_WIDTH = 12;
export const TOPOLOGY_DEFAULT_NODE_ICON = <IconSpanUnknown />;

export enum NodeEdgeCategory {
  Common = 'common',
}

export enum TopologyLayoutDirection {
  TB = 'TB',
  LR = 'LR',
}

export const TOPOLOGY_LAYOUT_RECORD: Partial<
  Record<SpanType, TopologyLayoutDirection>
> = {
  [SpanType.InvokeAgent]: TopologyLayoutDirection.TB,
  [SpanType.UserInput]: TopologyLayoutDirection.TB,
  [SpanType.UserInputV2]: TopologyLayoutDirection.TB,
  [SpanType.Workflow]: TopologyLayoutDirection.LR,
};

export const RESOURCE_TYPE_RECORD: Partial<Record<SpanType, ResourceType>> = {
  [SpanType.InvokeAgent]: ResourceType.Bot,
  [SpanType.UserInput]: ResourceType.Bot,
  [SpanType.UserInputV2]: ResourceType.Bot,
  [SpanType.Workflow]: ResourceType.Workflow,
};

export enum NodeLayoutCategory {
  Common,
}

export const TOPOLOGY_LAYOUT_COMMON_MAP: Record<
  NodeLayoutCategory,
  TopologicalLayoutCommonData
> = {
  [NodeLayoutCategory.Common]: {
    height: TOPOLOGY_COMMON_NODE_TEXT_HEIGHT,
  },
};

export const TOPOLOGY_LAYOUT_BIZ_MAP: Record<
  SpanCategory,
  TopologicalLayoutBizData
> = {
  [SpanCategory.Unknown]: {
    icon: <IconSpanUnknown />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Start]: {
    icon: <IconSpanWorkflowStart />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Agent]: {
    icon: <IconSpanAgent />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.LLMCall]: {
    icon: <IconSpanLLMCall />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Workflow]: {
    icon: <IconSpanWorkflow />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },

  [SpanCategory.WorkflowStart]: {
    icon: <IconSpanWorkflowStart />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.WorkflowEnd]: {
    icon: <IconSpanWorkflowEnd />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },

  [SpanCategory.Plugin]: {
    icon: <IconSpanPluginTool />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },

  [SpanCategory.Knowledge]: {
    icon: <IconSpanKnowledge />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },

  [SpanCategory.Code]: {
    icon: <IconSpanCode />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Condition]: {
    icon: <IconSpanCondition />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Card]: {
    icon: <IconSpanCard />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Message]: {
    icon: <IconSpanMessage />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Variable]: {
    icon: <IconSpanVar />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Database]: {
    icon: <IconCozDatabaseFill />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.LongTermMemory]: {
    icon: <IconCozLongTermMemory />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Hook]: {
    icon: <IconSpanHook />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Batch]: {
    icon: <IconSpanBMBatch />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Loop]: {
    icon: <IconSpanBMBatch />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Parallel]: {
    icon: <IconSpanBMParallel />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Script]: {
    icon: <IconSpanCode />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.CallFlow]: {
    icon: <IconSpanWorkflow />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
  [SpanCategory.Connector]: {
    icon: <IconSpanBMConnector />,
    ...TOPOLOGY_LAYOUT_COMMON_MAP[NodeLayoutCategory.Common],
  },
};

export enum TopologyEdgeStatus {
  STATIC,
  DYNAMIC,
  ERROR,
}

export const TOPOLOGY_EDGE_STATUS_MAP: Record<
  TopologyEdgeStatus,
  TopologicalStatusData
> = {
  [TopologyEdgeStatus.STATIC]: {
    edgeColor: '#C8C8CA',
    nodeClassName: 'common-node-container_static',
  },
  [TopologyEdgeStatus.DYNAMIC]: {
    edgeColor: '#3EC254',
    nodeClassName: 'common-node-container_dynamic',
  },
  [TopologyEdgeStatus.ERROR]: {
    edgeColor: '#FF441E',
    nodeClassName: 'common-node-container_error',
  },
};
