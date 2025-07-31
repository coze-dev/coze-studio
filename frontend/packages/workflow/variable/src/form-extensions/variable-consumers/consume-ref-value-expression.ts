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

import { ASTFactory, type ASTNode } from '@flowgram-adapter/free-layout-editor';
import { type VariableConsumerAbilityOptions } from '@flowgram-adapter/free-layout-editor';

/**
 * The variable-consumer in the TODO array cannot get the value value.
 */
export const consumeRefValueExpression: VariableConsumerAbilityOptions = {
  key: 'consume-ref-value-expression',
  parse(v, ctx) {
    console.log(
      '[ debugger test change ] > ',
      ctx.formItem?.formModel,
      ctx.formItem?.path,
      v,
    );

    return ASTFactory.createKeyPathExpression({
      keyPath: v?.content?.keyPath,
    });
  },
  onInit(ctx) {
    const { options, scope, formItem } = ctx;

    const astKey = options?.namespace || formItem?.path || '';

    return scope.ast.subscribe<ASTNode>(
      _type => {
        console.log('[ debugger type ] >', _type);
      },
      {
        selector: _ast => _ast.get(astKey)?.returnType as ASTNode,
      },
    );
  },
};
