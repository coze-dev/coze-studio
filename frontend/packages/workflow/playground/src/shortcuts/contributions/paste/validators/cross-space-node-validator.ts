import { StandardNodeType } from '@coze-workflow/base';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class CrossSpaceNodeValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node } = context;

    // 不允许跨空间复制的节点
    if (
      [
        StandardNodeType.Dataset,
        StandardNodeType.DatasetWrite,
        StandardNodeType.Database,
        StandardNodeType.DatabaseQuery,
        StandardNodeType.DatabaseCreate,
        StandardNodeType.DatabaseUpdate,
        StandardNodeType.DatabaseDelete,
        StandardNodeType.SubWorkflow,
        StandardNodeType.Imageflow,
      ].includes(node.type as StandardNodeType)
    ) {
      return false;
    }

    return null;
  }
}
