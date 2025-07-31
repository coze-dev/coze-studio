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
import {
  ASTKind,
  DataEvent,
  type FlowNodeEntity,
  FlowNodeVariableData,
  type Effect,
  type Scope,
  type EffectOptions,
} from '@flowgram-adapter/free-layout-editor';

/**
 * Generating FormV2 Effects from VariableProvider
 * @param options
 * @returns
 */
export function createEffectFromVariableProvider(
  options: VariableProviderAbilityOptions,
): EffectOptions[] {
  const getScope = (node: FlowNodeEntity): Scope => {
    const variableData: FlowNodeVariableData =
      node.getData(FlowNodeVariableData);

    if (options.private) {
      return variableData.initPrivate();
    }
    return variableData.public;
  };

  const transformValueToAST: Effect = ({ value, context }) => {
    if (!context) {
      return;
    }
    const { node } = context;
    const scope = getScope(node);

    const defaultNamespace = options.private ? '/node/locals' : '/node/outputs';

    scope.ast.set(options.namespace || defaultNamespace, {
      kind: ASTKind.VariableDeclarationList,
      declarations: options.parse(value, {
        node,
        scope,
        options,
        formItem: undefined,
      }),
    });
  };

  return [
    {
      event: DataEvent.onValueInit,
      effect: (params => {
        const { context } = params;

        const scope = getScope(context.node);
        const disposable = options.onInit?.({
          node: context.node,
          scope,
          options,
          formItem: undefined,
          // @ts-expect-error New form engine not supported
          triggerSync: undefined,
        });

        if (disposable) {
          // Destroy the listener at the same time when the scope is destroyed
          scope.toDispose.push(disposable);
        }

        transformValueToAST(params);
      }) as Effect,
    },
    {
      event: DataEvent.onValueChange,
      effect: (params => {
        transformValueToAST(params);
      }) as Effect,
    },
  ];
}
