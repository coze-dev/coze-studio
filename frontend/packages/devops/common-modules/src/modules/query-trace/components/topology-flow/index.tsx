import ReactFlow, { ReactFlowProvider } from 'reactflow';
import { useMemo } from 'react';

import classNames from 'classnames';
import { Spin } from '@coze-arch/bot-semi';

import { type TopologyFlowProps } from './typing';

import 'reactflow/dist/style.css';
import { useGenerateTopology, useLayoutTopology } from './hook';
import { CUSTOM_EDGES, CUSTOM_NODES } from './constant/flow';

import s from './index.module.less';

const TopologyFlowContent = (props: TopologyFlowProps) => {
  const { style, className, renderHeader, ...restProps } = props;

  // 计算topo数据
  const [loading, topologicalData] = useGenerateTopology({
    ...restProps,
  });

  // 每次topo数据变更后，计算topo布局信息
  const [topologyFlowDomRef] = useLayoutTopology(topologicalData);

  // 渲染外部自定义header实现（带有业务语义）
  const topologyHeader = useMemo(() => {
    if (!renderHeader || !topologicalData) {
      return null;
    }
    return renderHeader(topologicalData.topoType);
  }, [renderHeader, topologicalData]);

  return topologicalData ? (
    <div
      className={classNames(
        s['topology-flow'],
        className ?? s['topology-flow_default'],
      )}
      style={style}
      ref={topologyFlowDomRef}
    >
      {loading ? (
        <div className={s['topology-flow-loading']}>
          <Spin />
        </div>
      ) : (
        <div className={s['topology-flow-container']}>
          {topologyHeader}
          <div className={s['topology-flow-container-flow']}>
            <ReactFlow
              // @ts-expect-error 使用number类型枚举SpanType作为自定义type，可忽略报错
              nodes={topologicalData.nodes}
              edges={topologicalData.edges}
              nodeTypes={CUSTOM_NODES}
              edgeTypes={CUSTOM_EDGES}
              proOptions={{
                hideAttribution: true,
              }}
              nodesDraggable={false}
              nodesConnectable={false}
            />
          </div>
        </div>
      )}
    </div>
  ) : null;
};

const TopologyFlow = (props: TopologyFlowProps) => (
  <ReactFlowProvider>
    <TopologyFlowContent {...props} />
  </ReactFlowProvider>
);

export default TopologyFlow;
