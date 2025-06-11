import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';

import { getVariableInfoFromExpression } from '../variable-support/utils';

interface Options {
  required?: boolean;
  emptyMessage?: string;
  invalidMessage?: string;
}

export const expressionStringValidator = (
  expressionStr: string,
  { node }: NodeFormContext,
  options: Options,
) => {
  const { required = true, emptyMessage, invalidMessage } = options;
  const doubleBracedPattern = /{{([^}]+)}}/g;
  const matches = expressionStr?.match(doubleBracedPattern);
  // 去除字符串里的 {{}}
  const matchesContent = matches?.map((varStr: string) =>
    varStr.replace(/^{{|}}$/g, ''),
  );
  let hasInvalidVar = false;
  matchesContent?.forEach((varStr: string) => {
    const { fieldKeyPath } = getVariableInfoFromExpression(varStr);
    const workflowVariable =
      node.context.variableService.getWorkflowVariableByKeyPath(fieldKeyPath, {
        node,
      });

    if (!workflowVariable) {
      hasInvalidVar = true;
    }
  });

  if (required && !expressionStr) {
    return emptyMessage;
  } else if (hasInvalidVar) {
    return invalidMessage;
  }
  return;
};

export const createEexpressionStringValidator =
  ({ required, emptyMessage, invalidMessage }: Options) =>
  ({ value, context }) =>
    expressionStringValidator(value, context, {
      required,
      emptyMessage,
      invalidMessage,
    });
