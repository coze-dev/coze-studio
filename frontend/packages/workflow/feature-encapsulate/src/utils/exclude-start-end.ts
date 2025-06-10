import { StandardNodeType } from '@coze-workflow/base';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

/**
 * 排除开始和结束节点
 * @param nodes
 * @returns
 */
export function excludeStartEnd(
  nodes: WorkflowNodeEntity[],
): WorkflowNodeEntity[] {
  return nodes.filter(
    node =>
      ![StandardNodeType.Start, StandardNodeType.End].includes(
        node.flowNodeType as StandardNodeType,
      ),
  );
}
