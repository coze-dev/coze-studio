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

import { TSESTree } from '@typescript-eslint/utils';
import { RuleFixer } from '@typescript-eslint/utils/ts-eslint';
import { createRule, getZustandSetting, isNameMatchPattern } from '../utils';

const createFixer =
  ({
    shouldFix,
    node,
    name,
  }: {
    shouldFix: boolean;
    node: TSESTree.CallExpression;
    name: string;
  }) =>
  ({ paramsStr, retStr = paramsStr }: { paramsStr: string; retStr?: string }) =>
  (fixer: RuleFixer) => {
    if (!shouldFix) {
      return null;
    }

    return fixer.replaceText(node, `${name}((${paramsStr}) => (${retStr}))`);
  };

export const preferSelector = createRule({
  name: 'zustand/preferSelector',
  defaultOptions: [],
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'Prefer using selector function when calling {{ name }}',
    },
    messages: {
      preferSelector: 'Prefer using selector function when calling {{ name }}',
      useSelectorDestruct: 'Use selector function (object destruct style)',
      useSelectorKeyValue: 'Use selector function (object property style)',
      useSelectorUnderlineAlias:
        'Use selector function (underLine alias style)',
    },
    hasSuggestions: true,
  },

  create(context) {
    const { storeNamePattern } = getZustandSetting(context.settings);
    return {
      CallExpression(node) {
        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'Identifier'
        ) {
          const { name } = node.callee;
          if (isNameMatchPattern(name, storeNamePattern)) {
            if (node.arguments.length === 0) {
              const { parent } = node;

              if (
                parent.type === 'VariableDeclarator' &&
                parent.id.type === 'ObjectPattern'
              ) {
                let names: string[] = [];
                for (const p of parent.id.properties) {
                  if (p.type === 'Property') {
                    if (p.key.type === 'Identifier' && p.key.name) {
                      names.push(p.key.name);
                    }
                  }
                  if (p.type === 'RestElement') {
                    names = [];
                    break;
                  }
                }
                const fixer = createFixer({
                  shouldFix: !!names?.length,
                  name,
                  node,
                });

                context.report({
                  node,
                  messageId: 'preferSelector',
                  data: {
                    name,
                  },
                  suggest: [
                    {
                      messageId: 'useSelectorKeyValue',
                      fix: fixer({
                        paramsStr: 'state',
                        retStr: `{${names
                          .filter(Boolean)
                          .map(it => `${it}: state.${it}`)
                          .join(', ')}}`,
                      }),
                    },
                    {
                      messageId: 'useSelectorUnderlineAlias',
                      fix: fixer({
                        paramsStr: `{${names
                          .map(it => `${it}: _${it}`)
                          .join(', ')}}`,
                      }),
                    },
                    {
                      messageId: 'useSelectorDestruct',
                      fix: fixer({
                        paramsStr: `{${names
                          .filter(Boolean)
                          .map(it => `${it}`)
                          .join(', ')}}`,
                      }),
                    },
                  ],
                });
                return;
              }

              context.report({
                node,
                messageId: 'preferSelector',
                data: {
                  name,
                },
              });
            }
          }
        }
      },
    };
  },
});
