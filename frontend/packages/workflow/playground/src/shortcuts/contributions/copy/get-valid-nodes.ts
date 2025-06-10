import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import type {
  WorkflowNodeEntity,
  WorkflowNodeMeta,
} from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

/** 获取可用节点 */
export const getValidNodes = (
  nodes: WorkflowNodeEntity[],
): WorkflowNodeEntity[] =>
  nodes.filter(n => {
    if (
      [
        StandardNodeType.Start,
        StandardNodeType.End,
        FlowNodeBaseType.SUB_CANVAS,
      ].includes(n.flowNodeType as StandardNodeType)
    ) {
      return false;
    }
    if (n.getNodeMeta<WorkflowNodeMeta>().copyDisable) {
      return false;
    }
    return true;
  });
