/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
