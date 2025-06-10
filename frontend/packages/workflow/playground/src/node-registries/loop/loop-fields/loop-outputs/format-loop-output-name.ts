import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { ValueExpressionType, type ValueExpression } from '@coze-workflow/base';

import { LoopVariablePrefix } from '../../constants';

export const formatLoopOutputName = (params: {
  name: string;
  prefix: string;
  suffix: string;
  input: ValueExpression;
  node: WorkflowNodeEntity;
}): string => {
  const { name, prefix, suffix, input, node } = params;

  // 非引用类型或非节点自身变量，返回循环体变量名称
  if (
    input.type !== ValueExpressionType.REF ||
    input.content?.keyPath?.[0] !== node.id
  ) {
    return `${prefix}${name}${suffix}`;
  }

  // 节点自身变量，去除前缀后返回
  return name.startsWith(LoopVariablePrefix)
    ? name.slice(LoopVariablePrefix.length)
    : name;
};
