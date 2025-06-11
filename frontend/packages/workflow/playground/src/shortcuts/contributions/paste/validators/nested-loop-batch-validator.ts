import { FlowNodeBaseType } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class NestedLoopBatchValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node, parent } = context;
    const nodeType = node.type as StandardNodeType;

    if (!parent) {
      return null;
    }

    // Loop / Batch 不允许嵌套
    if ([StandardNodeType.Loop, StandardNodeType.Batch].includes(nodeType)) {
      return parent.flowNodeType !== FlowNodeBaseType.SUB_CANVAS;
    }

    return null;
  }
}
