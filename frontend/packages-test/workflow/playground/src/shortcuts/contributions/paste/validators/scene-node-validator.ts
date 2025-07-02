import { StandardNodeType } from '@coze-workflow/base';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class SceneNodeValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node } = context;

    // 不允许跨工作流复制场景工作流专属节点
    if (
      node.type === StandardNodeType.SceneChat ||
      node.type === StandardNodeType.SceneVariable
    ) {
      return false;
    }

    return null;
  }
}
