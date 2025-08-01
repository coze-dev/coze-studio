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

import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { accessImportedIds, isSameIdentifier, createRule } from '../utils';

const STORE_CREATE_NAME = 'create';

export const properStoreTyping = createRule({
  name: 'zustand/proper-store-typing',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow creating a store without a type parameter',
    },
    messages: {
      storeTyping: 'Require a type parameter when creating a store',
    },
    schema: [],
    hasSuggestions: true,
  },
  create: accessImportedIds({
    [STORE_CREATE_NAME]: ['zustand'],
  })((context, _, ids) => {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === STORE_CREATE_NAME
        ) {
          const variable = findVariable(
            context.sourceCode.getScope(node),
            STORE_CREATE_NAME,
          );
          // zustand create
          if (
            isSameIdentifier(
              variable?.identifiers[0],
              ids.get(STORE_CREATE_NAME),
            )
          ) {
            if (!node.typeArguments) {
              context.report({
                node: node.callee,
                messageId: 'storeTyping',
              });
            }
          }
        }
      },
    };
  }),
});
