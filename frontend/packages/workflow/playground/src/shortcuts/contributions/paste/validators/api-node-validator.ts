import type { ApiNodeData } from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';
import { PluginProductStatus } from '@coze-arch/idl/developer_api';

import {
  BaseNodeValidator,
  type NodeValidationContext,
} from './base-validator';

export class ApiNodeValidator extends BaseNodeValidator {
  protected validate(context: NodeValidationContext): boolean | null {
    const { node } = context;

    if (node.type !== StandardNodeType.Api) {
      return null;
    }

    // 不允许跨空间复制未上架的插件节点
    const apiNodeData = node._temp.externalData as ApiNodeData;
    const isListed =
      apiNodeData?.pluginProductStatus === PluginProductStatus.Listed;
    return isListed;
  }
}
