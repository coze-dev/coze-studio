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
    // Without rawMeta, it may be historical data, follow the fallback logic below
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
        // Direct reference to variables
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
 * loop input variable synchronization
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
