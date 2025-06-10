import { useEffect, useState } from 'react';

import { pick } from 'lodash-es';
import { FlowNodeRenderData } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
type SimpleNodeRenderData = Pick<FlowNodeRenderData, 'expanded' | 'node'>;

const pickSimpleNodeRenderData = (data: FlowNodeRenderData) =>
  pick(data, 'expanded', 'node');

/**
 * @deprecated
 * TODO @liuyangxing 全局清理这个函数，Coze V2 没有节点折叠
 * 获取当前节点的渲染数据，包括expanded等渲染相关的状态
 */
export const useNodeRenderData = () => {
  const node = useCurrentEntity();
  const initialRenderData =
    node.getData<FlowNodeRenderData>(FlowNodeRenderData);
  const [nodeRenderData, setNodeRenderData] = useState<SimpleNodeRenderData>(
    pickSimpleNodeRenderData(initialRenderData),
  );

  useEffect(() => {
    const disposable = initialRenderData.onDataChange(data => {
      setNodeRenderData(pickSimpleNodeRenderData(data as FlowNodeRenderData));
    });

    return () => {
      disposable?.dispose();
    };
  }, []);

  return {
    ...nodeRenderData,
    expanded: true, // Coze V2 没有节点折叠
    toggleNodeExpand: initialRenderData.toggleExpand.bind(initialRenderData),
  };
};
