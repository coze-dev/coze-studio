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

import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import { createRule, getZustandSetting, isNameMatchPattern } from '../utils';

export const noGetStateInComp = createRule({
  name: 'zustand/no-get-state-in-comp',
  defaultOptions: [],
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Disallow use getState() in components.',
    },
    messages: {
      noGetState:
        'Avoid using {{storeName}}.getState() in react components. Use hooks instead.',
    },
  },

  create: context => {
    const { storeNamePattern } = getZustandSetting(context.settings);

    return {
      'BlockStatement > VariableDeclaration > VariableDeclarator > CallExpression > MemberExpression[property.name="getState"]'(
        node: TSESTree.MemberExpression,
      ) {
        if (node.object.type === AST_NODE_TYPES.Identifier) {
          if (isNameMatchPattern(node.object.name, storeNamePattern)) {
            const blockStatement = node.parent.parent?.parent
              ?.parent as TSESTree.BlockStatement;
            const last = blockStatement.body[blockStatement.body.length - 1];
            if (
              last.type === AST_NODE_TYPES.ReturnStatement &&
              last.argument?.type === AST_NODE_TYPES.JSXElement
            ) {
              context.report({
                node,
                messageId: 'noGetState',
                data: {
                  storeName: node.object.name,
                },
              });
            }
          }
        }
      },
    };
  },
});
