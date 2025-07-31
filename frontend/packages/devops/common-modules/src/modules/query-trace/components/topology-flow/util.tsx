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

import { MarkerType } from 'reactflow';

import { getFlags } from '@coze-arch/bot-flags';
import {
  SpanCategory,
  SpanStatus,
  SpanType,
} from '@coze-arch/bot-api/ob_query_api';
import {
  TopoType,
  type TopoInfo,
  type Node as TopoNode,
} from '@coze-arch/bot-api/dp_manage_api';
import Dagre from '@dagrejs/dagre';

import {
  getSpanTitle as getDynamicSpanTitle,
  type SpanNode,
} from '../../utils/cspan-graph';
import {
  type CSpanAttrInvokeAgent,
  type CSpan,
  type CSpanAttrWorkflow,
  type CSpanAttrPluginTool,
  type CSpanAttrKnowledge,
  type CSpanAttrCondition,
  type CSPanBatch,
  type CSpanAttrLLMCall,
} from '../../typings/cspan';
import { rootBreakSpanId } from '../../constant';
import { spanCategoryConfigMap } from '../../config/cspan';
import {
  type DynamicNodeMap,
  type DynamicTopologyData,
  type TopologicalData,
  type TopologicalNode,
  type TopologicalEdge,
  type ProcessedGetTopoInfoReq,
  type TopoMetaInfo,
} from './typing';
import {
  NodeEdgeCategory,
  TOPOLOGY_COMMON_EDGE_OFFSET_WIDTH,
  TOPOLOGY_COMMON_NODE_TEXT_ADDITIONAL_WIDTH,
  TOPOLOGY_COMMON_NODE_TEXT_DEFAULT_WIDTH,
  TOPOLOGY_COMMON_NODE_TEXT_FONT,
  TOPOLOGY_COMMON_NODE_TEXT_HEIGHT,
  TOPOLOGY_COMMON_NODE_TEXT_MAX_WIDTH,
  TOPOLOGY_DEFAULT_NODE_ICON,
  TOPOLOGY_EDGE_STATUS_MAP,
  TOPOLOGY_LAYOUT_BIZ_MAP,
  TopologyEdgeStatus,
  type TopologyLayoutDirection,
} from './constant';

const assignRecordIfNotExists = <T extends object>(
  object: T,
  key: keyof T,
  value: T[keyof T],
) => {
  if (!object[key]) {
    object[key] = value;
  }
};

export const filterObjectByKeys = <T extends object>(
  object: T,
  targetList: string[],
) =>
  Object.keys(object)
    .filter(key => targetList.includes(key))
    .reduce<T>((pre, cur) => {
      pre[cur] = object[cur];
      return pre;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as T);

/**
 * Static topo data resource_id different and different data field mapping according to span type
 * @param spanNode current span
 * @param entityId
 * @Returns the id mapped to the static topo
 */
export const getNodeResourceId = (
  spanNode: SpanNode,
  entityId: string,
): string => {
  const { category, id } = spanNode;
  const workflowNodeId =
    // Compatible with merged Batch Nodes
    (spanNode as CSPanBatch).workflow_node_id ??
    (spanNode as CSpanAttrCondition).extra?.workflow_node_id;
  if (workflowNodeId) {
    return workflowNodeId;
  }
  switch (category) {
    case SpanCategory.Agent:
    case SpanCategory.Start:
      return (spanNode as CSpanAttrInvokeAgent).extra?.agent_id || entityId;
    case SpanCategory.Workflow:
      return (spanNode as CSpanAttrWorkflow).extra?.workflow_id || id;
    case SpanCategory.Plugin:
      return (spanNode as CSpanAttrPluginTool).extra?.plugin_id || id;
    case SpanCategory.Knowledge:
      return (spanNode as CSpanAttrKnowledge).extra?.knowledge_id || id;
    case SpanCategory.LLMCall:
      return (spanNode as CSpanAttrLLMCall).extra?.model || id;
    default:
      return id;
  }
};

export const generateStaticTopologyDataMapKey = (
  info: ProcessedGetTopoInfoReq,
) => {
  const { space_id, resource_id, version, env, resource_type } = info;
  return `${space_id}-${resource_id}-${version}-${env}-${resource_type}`;
};

// The SpanType. InvokeAgent node will be removed from the trace under a single agent, and the topology root may be SpanType. UserInput.
export const getTopologyAgentRootType = () => {
  const FLAGS = getFlags();
  return FLAGS['bot.devops.use_user_input_as_agent']
    ? [SpanType.InvokeAgent, SpanType.UserInput, SpanType.UserInputV2]
    : [SpanType.InvokeAgent];
};

export const isTopologyRootSpan = (span: CSpan) => {
  // Only the base workflow shows the topology
  if (span.type === SpanType.Workflow) {
    return (span as CSpanAttrWorkflow).extra?.workflow_schema_type === 1;
  }

  return [...getTopologyAgentRootType()].includes(span.type);
};

export const extractOriginDynamicNodeMap = (
  spanNode: SpanNode,
  entityId: string,
): DynamicTopologyData => {
  const dynamicNodeMap: DynamicNodeMap = {};
  const originDynamicNodeMap: DynamicNodeMap = {};
  const queue = [spanNode];

  while (queue.length > 0) {
    const currentNode = queue.shift() as SpanNode;
    // Filter out broken nodes
    if (currentNode.id === rootBreakSpanId) {
      continue;
    }

    originDynamicNodeMap[currentNode.id] = currentNode;
    assignRecordIfNotExists(
      dynamicNodeMap,
      getNodeResourceId(currentNode, entityId),
      currentNode,
    );

    for (const childNode of currentNode.children ?? []) {
      queue.push(childNode);
    }
  }

  return {
    dynamicNodeMap,
    originDynamicNodeMap,
  };
};

export const findNearestTopologyRootSpanNode = (
  spanNode?: SpanNode,
): SpanNode | undefined => {
  let currentSpanNode = spanNode;
  while (currentSpanNode) {
    if (isTopologyRootSpan(currentSpanNode)) {
      return currentSpanNode;
    }
    currentSpanNode = currentSpanNode.parent;
  }
  return undefined;
};

function findUserInputRootNode(dynamicNodeMap: DynamicNodeMap) {
  return Object.values(dynamicNodeMap).find(
    item =>
      item.type === SpanType.UserInput || item.type === SpanType.UserInputV2,
  );
}

/**
 * Fill the dynamic nodes to the corresponding static nodes and connections to complete their dynamic operation information
 * @param staticTopoInfo
 * @Param dynamicNodeMap The dynamic node map that needs to be displayed at present
 * @param layoutDirection
 * @returns
 */
export const completeDynamicTopologyInfo = (
  staticTopoInfo: TopoInfo,
  dynamicNodeMap: DynamicNodeMap,
  layoutDirection: TopologyLayoutDirection,
): TopologicalData => {
  const FLAGS = getFlags();
  const {
    nodes: staticNodes = [],
    edges: staticEdges = [],
    topo_type = TopoType.AgentFlow,
  } = staticTopoInfo;
  const nodeInfoMap: Record<
    string,
    {
      node: TopoNode;
      resourceId: string;
    }
  > = {};
  const nodes: TopologicalNode[] = staticNodes.map(item => {
    const {
      node_id = '',
      resource_id = '',
      resource_kind,
      resource_name = '',
    } = item;
    nodeInfoMap[node_id] = {
      node: item,
      resourceId: resource_id,
    };

    const typedResourceKind: SpanCategory =
      resource_kind && resource_kind in SpanCategory
        ? Number(resource_kind)
        : SpanCategory.Unknown;

    let dynamicSpanNode = dynamicNodeMap[resource_id] as SpanNode | undefined;

    // Specialized logic: In a single agent scenario, the node information will not include the agent node, and it needs to be replaced with userInput.
    if (
      typedResourceKind === SpanCategory.Agent &&
      !dynamicSpanNode &&
      FLAGS['bot.devops.use_user_input_as_agent']
    ) {
      dynamicSpanNode = findUserInputRootNode(dynamicNodeMap) as
        | SpanNode
        | undefined;
    }

    let title = '';
    if (dynamicSpanNode) {
      title = getDynamicSpanTitle(dynamicSpanNode);
    } else {
      title = getStaticSpanTitle(typedResourceKind, resource_name);
    }

    return {
      id: node_id,
      type: typedResourceKind,
      position: {
        x: 0,
        y: 0,
      },
      data: {
        name: title,
        icon:
          TOPOLOGY_LAYOUT_BIZ_MAP[typedResourceKind]?.icon ??
          TOPOLOGY_DEFAULT_NODE_ICON,
        dynamicSpanNode,
        layoutDirection,
      },
    };
  });

  const edges: TopologicalEdge[] = staticEdges.map(item => {
    const { edge_id = '', source_node_id = '', target_node_id = '' } = item;

    const sourceNodeInfo = nodeInfoMap[source_node_id];
    // Specialized logic: there is no workflow_start node in dynamic tracing, the dynamic node downstream is filled in by default
    const isWorkflowStartNode =
      Number(sourceNodeInfo?.node?.resource_kind) ===
      SpanCategory.WorkflowStart;

    let sourceNode: SpanNode | undefined =
      dynamicNodeMap[sourceNodeInfo?.resourceId];
    const targetNode: SpanNode | undefined =
      dynamicNodeMap[nodeInfoMap[target_node_id]?.resourceId];

    // Specialized logic: In a single agent scenario, the node information will not include the agent node, and it needs to be replaced with userInput.
    if (
      sourceNodeInfo.node.resource_kind === SpanCategory.Agent &&
      !sourceNode &&
      FLAGS['bot.devops.use_user_input_as_agent']
    ) {
      sourceNode = findUserInputRootNode(dynamicNodeMap) as
        | SpanNode
        | undefined;
    }

    let tailDynamicSpanNode: SpanNode | undefined;
    if (isWorkflowStartNode || (sourceNode && targetNode)) {
      tailDynamicSpanNode = targetNode;
    }

    const topologyEdgeStatus = getTopologyItemStatus(tailDynamicSpanNode);
    return {
      id: edge_id,
      source: source_node_id,
      target: target_node_id,
      type: NodeEdgeCategory.Common,
      markerEnd: {
        type: MarkerType.Arrow,
        color: TOPOLOGY_EDGE_STATUS_MAP[topologyEdgeStatus].edgeColor,
        height: 17,
        width: 17,
      },
      data: {
        tailDynamicSpanNode,
      },
    };
  });

  return {
    nodes,
    edges,
    topoType: topo_type,
  };
};

const measureTextCanvas = document.createElement('canvas');
const measureTextContext = measureTextCanvas.getContext('2d');

const getTextWidth = (text: string) => {
  if (!measureTextContext) {
    return TOPOLOGY_COMMON_NODE_TEXT_DEFAULT_WIDTH;
  }
  measureTextContext.font = TOPOLOGY_COMMON_NODE_TEXT_FONT;
  return (
    Math.min(
      Math.round(measureTextContext.measureText(text).width),
      TOPOLOGY_COMMON_NODE_TEXT_MAX_WIDTH,
    ) + TOPOLOGY_COMMON_NODE_TEXT_ADDITIONAL_WIDTH
  );
};

const getStaticSpanTitle = (category: SpanCategory, name: string) => {
  const typeName = spanCategoryConfigMap[category]?.label ?? '';
  if (name && name !== typeName) {
    return `${typeName} ${name}`;
  } else {
    return typeName;
  }
};

/**
 * Layout and style processing of raw topo data
 * @param originTopologicalData
 * @param layoutDirection
 * @returns
 */
export const getLayoutedMeta = (
  originTopologicalData: TopologicalData,
  layoutDirection: TopologyLayoutDirection,
): TopologicalData => {
  const graphInstance = new Dagre.graphlib.Graph().setDefaultEdgeLabel(
    () => ({}),
  );
  graphInstance.setGraph({
    rankdir: layoutDirection,
    align: 'UL',
  });
  const { edges, nodes, topoType } = originTopologicalData;

  edges.forEach(edge => graphInstance.setEdge(edge.source, edge.target));

  nodes.forEach(node => {
    const { type = SpanCategory.Unknown, data } = node;
    const { name } = data;

    graphInstance.setNode(node.id, {
      label: name,
      height:
        TOPOLOGY_LAYOUT_BIZ_MAP[type]?.height ??
        TOPOLOGY_COMMON_NODE_TEXT_HEIGHT,
      width: getTextWidth(name),
    });
  });

  Dagre.layout(graphInstance);

  // Acquire the positioning information of the node for positioning when drawing vertical types of connections
  const nodeXAxisMap: Record<string, number> = {};

  const layoutNodes: TopologicalNode[] = nodes.map(node => {
    const { x, y } = graphInstance.node(node.id);

    nodeXAxisMap[node.id] = x;

    return { ...node, position: { x, y } };
  });

  const layoutEdges: TopologicalEdge[] = edges.map(edge => {
    const { source, target } = edge;
    return {
      ...edge,
      data: {
        ...edge.data,
        layoutInfo: {
          customSourceX:
            nodeXAxisMap[source] + TOPOLOGY_COMMON_EDGE_OFFSET_WIDTH,
          customTargetX:
            nodeXAxisMap[target] + TOPOLOGY_COMMON_EDGE_OFFSET_WIDTH,
        },
      },
    };
  });

  return {
    topoType,
    nodes: layoutNodes,
    edges: layoutEdges,
  };
};

export const getTopologyItemStatus = (spanNode?: SpanNode) => {
  if (!spanNode) {
    return TopologyEdgeStatus.STATIC;
  }
  if (spanNode.status === SpanStatus.Error) {
    return TopologyEdgeStatus.ERROR;
  }
  return TopologyEdgeStatus.DYNAMIC;
};

/**
 * Generate graphs and id maps of upstream nodes for each node using static topo data
 * @param topoInfo
 * @Returns meta information for graphs and maps
 */
export const generateTopologyMetaInfo = (topoInfo: TopoInfo): TopoMetaInfo => {
  const { nodes = [], edges = [] } = topoInfo;
  const resourceIdMap: Record<string, string> = {};
  const nodeIdMap: Record<string, string> = {};
  const topoGraph: Record<string, string[]> = {};
  for (const { node_id = '', resource_id = '' } of nodes) {
    resourceIdMap[node_id] = resource_id;
    nodeIdMap[resource_id] = node_id;
  }
  for (const { source_node_id = '', target_node_id = '' } of edges) {
    if (!topoGraph[target_node_id]) {
      topoGraph[target_node_id] = [];
    }
    topoGraph[target_node_id].push(source_node_id);
  }
  return {
    resourceIdMap,
    nodeIdMap,
    topoGraph,
  };
};

/**
 * Query all upstream nodes of a node in a static topo graph, using DP to reduce complexity
 * @param selectedNodeId Current span id
 * @Param topoGraph holds a graph that records the upstream nodes of each node
 * @Param upstreamNodeMap holds a map that records all upstream nodes of a node
 * @Returns the id list of all nodes upstream
 */
export const getAllUpstreamTopologyNodeIds = (
  selectedNodeId: string,
  topoGraph: Record<string, string[]>,
  upstreamNodeMap: Record<string, string[]>,
) => {
  if (upstreamNodeMap[selectedNodeId]) {
    return upstreamNodeMap[selectedNodeId];
  }
  const upstreamNodeIds = topoGraph[selectedNodeId] ?? [];
  const allUpstreamNodeIds: string[] = [
    ...upstreamNodeIds,
    ...upstreamNodeIds.flatMap(nodeId =>
      getAllUpstreamTopologyNodeIds(nodeId, topoGraph, upstreamNodeMap),
    ),
  ];
  upstreamNodeMap[selectedNodeId] = allUpstreamNodeIds;
  return allUpstreamNodeIds;
};
