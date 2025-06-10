import { ASTFactory } from '@flowgram-adapter/free-layout-editor';
import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';

import { ValueExpressionType } from '../../typings';
import { createRefExpression } from '../../core/extend-ast/custom-key-path-expression';
import { type InputItem, uniqInputs, uniqProperties } from './common';
interface ValueType {
  inputParameters?: InputItem[];
  variableParameters?: InputItem[];
}

export const parseLoopInputsByViewVariableMeta = (
  nodeId: string,
  value: ValueType,
) => {
  const { inputParameters, variableParameters } = value || {};
  const batchProperties = uniqInputs(inputParameters).map(_input =>
    ASTFactory.createProperty({
      key: _input?.name,
      meta: {
        label: `item (in ${_input?.name})`,
      },
      initializer: ASTFactory.createEnumerateExpression({
        enumerateFor: createRefExpression({
          keyPath: _input?.input?.content?.keyPath || [],
          rawMeta: _input?.input?.rawMeta,
        }),
      }),
    }),
  );

  const variableProperties = uniqInputs(variableParameters).map(_input => {
    // 没有 rawMeta 时，可能是历史数据，走下面的兜底逻辑
    if (_input?.input?.rawMeta?.type) {
      return ASTFactory.createProperty({
        key: _input?.name,
        meta: {
          mutable: true,
        },
        initializer: createRefExpression({
          keyPath: _input?.input?.content?.keyPath || [],
          rawMeta: _input?.input?.rawMeta,
        }),
      });
    }
    if (_input?.input?.type === ValueExpressionType.REF) {
      return ASTFactory.createProperty({
        key: _input?.name,
        meta: {
          mutable: true,
        },
        // 直接引用变量
        initializer: ASTFactory.createKeyPathExpression({
          keyPath: _input?.input?.content?.keyPath || [],
        }),
      });
    }

    return ASTFactory.createProperty({
      key: _input?.name,
      meta: {
        mutable: true,
      },
      type: ASTFactory.createString(),
    });
  });

  const indexProperties = [
    ASTFactory.createProperty({
      key: 'index',
      type: ASTFactory.createInteger(),
    }),
  ];

  const properties = uniqProperties([
    ...batchProperties,
    ...indexProperties,
    ...variableProperties,
  ]);

  return [
    ASTFactory.createVariableDeclaration({
      key: `${nodeId}.locals`,
      type: ASTFactory.createObject({
        properties,
      }),
    }),
  ];
};

/**
 * 循环输入变量同步
 */
export const provideLoopInputsVariables: VariableProviderAbilityOptions = {
  key: 'provide-loop-input-variables',
  namespace: '/node/locals',
  private: true,
  scope: 'private',
  parse(value: ValueType, context) {
    return parseLoopInputsByViewVariableMeta(context.node.id, value);
  },
};
