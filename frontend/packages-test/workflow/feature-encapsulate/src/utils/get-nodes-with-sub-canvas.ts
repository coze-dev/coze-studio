import { uniq } from 'lodash-es';
import {
  type WorkflowNodeRegistry,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

/**
 * 获取有子节点的节点列表
 * @param nodes
 * @returns
 */
export const getNodesWithSubCanvas = (nodes: FlowNodeEntity[]) =>
  uniq(
    nodes
      .map(node => {
        const registry = node.getNodeRegistry() as WorkflowNodeRegistry;
        const subCanvas = registry?.meta?.subCanvas;

        return [
          node,
          // 子画布对应的所有子节点
          ...(subCanvas?.(node)?.canvasNode?.allCollapsedChildren || []),
        ];
      })
      .flat(),
  );
