import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';
import { ASTFactory } from '@flowgram-adapter/free-layout-editor';

import { createWrapArrayExpression } from '../../core/extend-ast/wrap-array-expression';
import { type InputItem, uniqInputs } from './common';

export const parseLoopOutputsByViewVariableMeta = (
  nodeId: string,
  value: InputItem[],
) => {
  const properties = uniqInputs(value || []).map(_input => {
    const keyPath = _input?.input?.content?.keyPath;
    // 如果选择的是 Loop 的 Variable 内的变量
    if (keyPath?.[0] === nodeId) {
      return ASTFactory.createProperty({
        key: _input?.name,
        // 直接引用变量
        initializer: ASTFactory.createKeyPathExpression({
          keyPath: _input?.input?.content?.keyPath || [],
        }),
      });
    }

    return ASTFactory.createProperty({
      key: _input?.name,
      // 输出类型包一层 Array
      initializer: createWrapArrayExpression({
        keyPath: _input?.input?.content?.keyPath || [],
      }),
    });
  });

  return [
    ASTFactory.createVariableDeclaration({
      key: `${nodeId}.outputs`,
      type: ASTFactory.createObject({
        properties,
      }),
    }),
  ];
};

/**
 * 循环输出变量同步
 */
export const provideLoopOutputsVariables: VariableProviderAbilityOptions = {
  key: 'provide-loop-output-variables',
  namespace: '/node/outputs',
  private: false,
  scope: 'public',
  parse(value, context) {
    return parseLoopOutputsByViewVariableMeta(context.node.id, value);
  },
};
