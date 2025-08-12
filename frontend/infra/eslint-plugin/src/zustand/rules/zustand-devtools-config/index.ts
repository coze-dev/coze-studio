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
import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { accessImportedIds, createRule, isSameIdentifier } from '../utils';

const VAR_NAME = 'devtools';

export const devtoolsConfig = createRule({
  name: 'zustand/devToolsConfig',
  defaultOptions: [],
  meta: {
    type: 'suggestion',
    docs: {
      description: 'middleware devtools config',
    },
    messages: {
      noEmptyCfg: 'Middleware devtools need a config parameter',
      addCfg: 'Use config parameter.',
      nameCfg: 'Configure name fields to separate the namespace',
      enabledCfg:
        'Configure enabled fields and ensure the value is false when in production',
    },
    schema: [],
    hasSuggestions: true,
  },
  create: accessImportedIds({
    [VAR_NAME]: ['zustand/middleware', 'zustand/middleware/devtools'],
  })((context, _, ids) => {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.name === VAR_NAME
        ) {
          const variable = findVariable(
            context.sourceCode.getScope(node),
            VAR_NAME,
          );

          if (
            variable &&
            isSameIdentifier(variable?.identifiers[0], ids.get(VAR_NAME))
          ) {
            const args = node.arguments[1];
            if (!args) {
              context.report({
                node,
                messageId: 'noEmptyCfg',
                suggest: [
                  {
                    messageId: 'addCfg',
                    fix: fixer => {
                      if (node.arguments[0]) {
                        return fixer.insertTextAfter(
                          node.arguments[0],
                          ",{name:'DEV_TOOLS_NAME_SPACE'}",
                        );
                      }
                      return null;
                    },
                  },
                ],
              });
            } else if (args.type === AST_NODE_TYPES.ObjectExpression) {
              const hasProperty = (key: string) =>
                args.properties.find(
                  p =>
                    p.type === AST_NODE_TYPES.Property &&
                    p.key.type === AST_NODE_TYPES.Identifier &&
                    p.key.name === key,
                );

              if (!hasProperty('name')) {
                context.report({
                  node: args,
                  messageId: 'nameCfg',
                });
              }
              if (!hasProperty('enabled')) {
                context.report({
                  node: args,
                  messageId: 'enabledCfg',
                });
              }
            }
          }
        }
      },
    };
  }),
});
