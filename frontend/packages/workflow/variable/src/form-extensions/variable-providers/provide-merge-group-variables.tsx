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

import {
  ASTFactory,
  ASTKind,
  type ObjectType,
} from '@flowgram-adapter/free-layout-editor';
import { type VariableProviderAbilityOptions } from '@flowgram-adapter/free-layout-editor';
import { type EffectOptions } from '@flowgram-adapter/free-layout-editor';

import { createEffectFromVariableProvider } from '../../utils/variable-provider';
import { setValueIn } from '../../utils/form';
import { type RefExpression } from '../../typings';
import {
  createMergeGroupExpression,
  MergeStrategy,
} from '../../core/extend-ast/merge-group-expression';
import { createRefExpression } from '../../core/extend-ast/custom-key-path-expression';
import { WorkflowVariableFacadeService } from '../../core';

interface MergeGroup {
  name: string;
  variables: RefExpression[];
}

/**
 * merge group variable synchronization
 */
export const provideMergeGroupVariables: VariableProviderAbilityOptions = {
  key: 'provide-merge-group-variables',
  namespace: '/node/outputs',
  parse(value: MergeGroup[], context) {
    const nodeId = context.node.id;

    return [
      ASTFactory.createVariableDeclaration({
        key: `${nodeId}.outputs`,
        type: ASTFactory.createObject({
          properties: value?.map(_item =>
            ASTFactory.createProperty({
              key: _item?.name,
              initializer: createMergeGroupExpression({
                mergeStrategy: MergeStrategy.FirstNotEmpty,
                expressions: _item.variables.map(_v =>
                  createRefExpression({
                    keyPath: _v?.content?.keyPath || [],
                    rawMeta: _v?.rawMeta,
                  }),
                ),
              }),
            }),
          ),
        }),
      }),
    ];
  },
  onInit(ctx) {
    const facadeService = ctx.node.getService(WorkflowVariableFacadeService);

    return ctx.scope.ast.subscribe(() => {
      // Monitor output variable changes and backfill to the form's outputs.
      const outputVariable = ctx.scope.output.variables[0];
      if (outputVariable?.type?.kind === ASTKind.Object) {
        const { properties } = outputVariable.type as ObjectType;

        const nextOutputs = properties
          .map(
            _property =>
              // In the OutputTree component, the keys of all tree nodes need to be guaranteed to be unique
              facadeService.getVariableFacadeByField(_property)
                .viewMetaWithUniqKey,
          )
          .filter(Boolean);

        setValueIn(ctx.node, 'outputs', nextOutputs);
      }
    });
  },
};

export const provideMergeGroupVariablesEffect: EffectOptions[] =
  createEffectFromVariableProvider(provideMergeGroupVariables);
