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
    // If you choose a variable in the Variable of the Loop
    if (keyPath?.[0] === nodeId) {
      return ASTFactory.createProperty({
        key: _input?.name,
        // Direct reference to variables
        initializer: ASTFactory.createKeyPathExpression({
          keyPath: _input?.input?.content?.keyPath || [],
        }),
      });
    }

    return ASTFactory.createProperty({
      key: _input?.name,
      // Output Type Packet Layer Array
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
 * loop output variable synchronization
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
