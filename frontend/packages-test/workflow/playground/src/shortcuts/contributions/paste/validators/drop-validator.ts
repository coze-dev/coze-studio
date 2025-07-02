import type { StandardNodeType } from '@coze-workflow/base';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class DropValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node, dragService, parent } = context;

    const canDropInfo = dragService.canDropToNode({
      dragNodeType: node.type as StandardNodeType,
      dropNode: parent,
    });
    if (!canDropInfo.allowDrop) {
      return false;
    }
    return null;
  }
}
