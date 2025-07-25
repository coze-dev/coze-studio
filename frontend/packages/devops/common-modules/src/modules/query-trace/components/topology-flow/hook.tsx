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
 
import { useReactFlow, useStoreApi } from 'reactflow';
import { type RefObject, useEffect, useRef, useState } from 'react';

import { useAsyncEffect, useSize, useThrottle } from 'ahooks';
import {
  Env,
  type ResourceType,
  type GetTopoInfoReq,
  type TopoInfo,
  TopoType,
} from '@coze-arch/bot-api/dp_manage_api';
import { dpManageApi } from '@coze-arch/bot-api';

import { buildTraceTree } from '../../utils/cspan-graph';
import { DataSourceTypeEnum } from '../../typings/graph';
import {
  type CSpanAttrUserInput,
  type CSpanAttrInvokeAgent,
  type CSpanAttrWorkflow,
} from '../../typings/cspan';
import {
  completeDynamicTopologyInfo,
  extractOriginDynamicNodeMap,
  filterObjectByKeys,
  findNearestTopologyRootSpanNode,
  generateStaticTopologyDataMapKey,
  generateTopologyMetaInfo,
  getAllUpstreamTopologyNodeIds,
  getLayoutedMeta,
  getNodeResourceId,
  getTopologyAgentRootType,
} from './util';
import {
  type DynamicNodeMap,
  type DynamicTopologyData,
  type StaticTopologyDataCache,
  type UseGenerateTopologyHookData,
  type TopologicalData,
  type ProcessedGetTopoInfoReq,
} from './typing';
import {
  RESOURCE_TYPE_RECORD,
  TOPOLOGY_LAYOUT_RECORD,
  type TopologyLayoutDirection,
} from './constant';

export const useLayoutTopology = (
  topologicalData: TopologicalData | undefined,
): [RefObject<HTMLDivElement>] => {
  const topologyFlowDomRef = useRef<HTMLDivElement>(null);
  const topologyFlowBoxSize = useSize(topologyFlowDomRef);
  const throttledTopologyFlowBoxSize = useThrottle(topologyFlowBoxSize);
  const { setCenter } = useReactFlow();
  const store = useStoreApi();

  useEffect(() => {
    if (topologicalData && throttledTopologyFlowBoxSize) {
      const { nodeInternals } = store.getState();
      const nodes = Array.from(nodeInternals).map(([, node]) => node);
      if (nodes.length > 0) {
        const node = nodes[0];
        const zoom = 0.7;
        const { height, width } = throttledTopologyFlowBoxSize;
        const x = node.position.x + (node.width || 0) / 2 + (width / 2) * zoom;
        const y =
          node.position.y + (node.height || 0) / 2 + (height / 2) * zoom;
        setCenter(x, y, { zoom, duration: 1000 });
      }
    }
  }, [topologicalData, setCenter, store, throttledTopologyFlowBoxSize]);

  return [topologyFlowDomRef];
};

const notShowTopo = (topoInfo: TopoInfo | undefined): topoInfo is undefined => {
  if (!topoInfo) {
    return true;
  }
  if (!topoInfo.nodes) {
    return true;
  }

  if (!topoInfo.topo_type || topoInfo.topo_type === TopoType.AgentFlow) {
    return true;
  }
  return false;
};

export const useGenerateTopology = (
  data: UseGenerateTopologyHookData,
): [boolean, TopologicalData | undefined] => {
  const { botId, entityId, spaceId, dataSource, selectedSpanId } = data;

  const [loading, setLoading] = useState(false);

  const [topologicalData, setTopologicalData] = useState<TopologicalData>();

  // 静态topo接口原始数据及计算数据缓存
  const staticTopologyDataRef = useRef<Record<string, StaticTopologyDataCache>>(
    {},
  );
  // 某个span最近的上游可查询到topo的span节点缓存
  const nearestTopologyRootSpanMapRef = useRef<DynamicNodeMap>({});

  const resetStatus = () => {
    setTopologicalData(undefined);
    setLoading(false);
  };

  const fetchStaticTopologyData = async (req: GetTopoInfoReq) => {
    const resp = await dpManageApi.GetTopoInfo({
      ...req,
    });
    return resp.data;
  };

  const getOriginDynamicData = (): DynamicTopologyData | undefined => {
    const { type, spanData = [] } = dataSource;
    if (type === DataSourceTypeEnum.SpanData) {
      const traceTree = buildTraceTree(spanData, false);
      return extractOriginDynamicNodeMap(traceTree, botId || entityId || '');
    } else {
      // TraceId类型暂不实现
      return undefined;
    }
  };

  useAsyncEffect(async () => {
    try {
      if (!selectedSpanId) {
        resetStatus();
        return;
      }

      setLoading(true);
      /**
       * Step 1
       * 获取动态tracing tree数据，找到当前选中节点
       */
      const originDynamicData = getOriginDynamicData();
      const currentSelectedSpanNode =
        originDynamicData?.originDynamicNodeMap?.[selectedSpanId];

      if (!originDynamicData || !currentSelectedSpanNode) {
        resetStatus();
        return;
      }

      const getNearestTopologyRootSpanNode = () => {
        // 命中缓存
        if (nearestTopologyRootSpanMapRef.current[selectedSpanId]) {
          return nearestTopologyRootSpanMapRef.current[selectedSpanId];
        }
        const node = findNearestTopologyRootSpanNode(currentSelectedSpanNode);
        if (!node) {
          return undefined;
        }

        nearestTopologyRootSpanMapRef.current[selectedSpanId] = node;
        return node;
      };

      /**
       * Step 2
       * 从当前节点开始向上找到最近的可绘制topo的节点，并请求得到静态原始topo数据
       */
      const nearestTopologyRootSpanNode = getNearestTopologyRootSpanNode() as
        | CSpanAttrInvokeAgent
        | CSpanAttrWorkflow
        | CSpanAttrUserInput
        | undefined;

      if (!nearestTopologyRootSpanNode) {
        resetStatus();
        return;
      }

      const { type } = nearestTopologyRootSpanNode;

      // 当前支持InvokeAgent和Workflow类型，分别取bot和workflow的id以及version
      const getStaticTopologyMetaData = (): Partial<
        Pick<GetTopoInfoReq, 'resource_id' | 'version'>
      > => {
        if (
          getTopologyAgentRootType().includes(nearestTopologyRootSpanNode.type)
        ) {
          return {
            resource_id: botId || entityId || '',
            version: nearestTopologyRootSpanNode.extra?.bot_version,
          };
        } else {
          const typedNearestTopologyRootSpanNode =
            nearestTopologyRootSpanNode as CSpanAttrWorkflow;
          return {
            resource_id: typedNearestTopologyRootSpanNode.extra?.workflow_id,
            version: typedNearestTopologyRootSpanNode.extra?.workflow_version,
          };
        }
      };

      const { resource_id, version } = getStaticTopologyMetaData();

      if (!resource_id || !version) {
        resetStatus();
        return;
      }

      const processedGetTopoInfoReq: ProcessedGetTopoInfoReq = {
        space_id: spaceId,
        env: Env.Online,
        resource_type: RESOURCE_TYPE_RECORD[type] as ResourceType,
        resource_id: resource_id ?? '',
        version: version ?? '',
      };
      const staticTopologyDataMapKey = generateStaticTopologyDataMapKey(
        processedGetTopoInfoReq,
      );

      const staticTopologyDataCache = staticTopologyDataRef.current[
        staticTopologyDataMapKey
      ] as StaticTopologyDataCache | undefined;

      const topoInfo =
        // 优先从缓存读取
        staticTopologyDataCache?.topoInfoMap ??
        (await fetchStaticTopologyData(processedGetTopoInfoReq));

      if (notShowTopo(topoInfo)) {
        resetStatus();
        return;
      }

      /**
       * Step 3
       * 过滤出当前静态topo节点中需要展示动态调用链路的节点
       */
      const topoMetaInfo =
        // 优先从缓存读取
        staticTopologyDataCache?.topoMetaInfo ??
        generateTopologyMetaInfo(topoInfo);

      const upstreamNodeMap = staticTopologyDataCache?.upstreamNodeMap ?? {};

      // 判断当前节点自身是否有topo信息（即当前所需要展示的topo的根节点）
      const isSelectedNodeTopologyRoot =
        currentSelectedSpanNode.id === nearestTopologyRootSpanNode.id;

      const currentSelectedSpanNodeTopoNodeId =
        topoMetaInfo.nodeIdMap[
          getNodeResourceId(currentSelectedSpanNode, botId || entityId || '')
        ];

      // 如果当前节点为topo根节点，那么展示所有动态节点信息；
      // 否则，过滤出当前节点在静态topo中的所有上游节点，只对这些上游节点进行展示
      const currentDynamicNodeMap = isSelectedNodeTopologyRoot
        ? originDynamicData.dynamicNodeMap
        : filterObjectByKeys(
            originDynamicData.dynamicNodeMap,
            [
              currentSelectedSpanNodeTopoNodeId,
              ...getAllUpstreamTopologyNodeIds(
                currentSelectedSpanNodeTopoNodeId,
                topoMetaInfo.topoGraph,
                upstreamNodeMap,
              ),
            ].map(nodeId => topoMetaInfo.resourceIdMap[nodeId]),
          );

      const layoutDirection = TOPOLOGY_LAYOUT_RECORD[
        type
      ] as TopologyLayoutDirection;

      /**
       * Step 4
       * 补齐动态节点信息 & 布局信息到静态topo
       */
      const originalTopologicalData = completeDynamicTopologyInfo(
        topoInfo,
        currentDynamicNodeMap,
        layoutDirection,
      );

      const layoutTopologicalData = getLayoutedMeta(
        originalTopologicalData,
        layoutDirection,
      );

      // 存入缓存
      staticTopologyDataRef.current[staticTopologyDataMapKey] = {
        topoInfoMap: topoInfo,
        topoMetaInfo,
        upstreamNodeMap,
      };

      setTopologicalData(layoutTopologicalData);
      // eslint-disable-next-line @coze-arch/use-error-in-catch
    } catch (e) {
      resetStatus();
    } finally {
      setLoading(false);
    }
  }, [botId, entityId, spaceId, dataSource, selectedSpanId]);

  useEffect(
    // 销毁时清空缓存
    () => () => {
      staticTopologyDataRef.current = {
        topoInfoMap: {},
        upstreamNodeMap: {},
      };
      nearestTopologyRootSpanMapRef.current = {};
    },
    [],
  );

  return [loading, topologicalData];
};
