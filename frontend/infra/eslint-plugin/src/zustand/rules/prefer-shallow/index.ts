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

import { ASTUtils, AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';
import {
  createRule,
  getZustandSetting,
  isNameMatchPattern,
  isObjLiteral,
} from '../utils';

export const preferShallow = createRule({
  defaultOptions: [],
  name: 'zustand/preferShallow',
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description:
        'Prefer using `useShallow` when store selector return an object literal to reduce re-render',
    },
    messages: {
      preferShallow:
        'Prefer using `useShallow` when calling {{name}} selector return an object literal to reduce re-render',
      useShallow: 'Use `useShallow`',
    },
    hasSuggestions: true,
  },

  create(context) {
    const problemNodes: TSESTree.CallExpression[] = [];
    let insetRange = [0, 0] as [number, number];
    const { storeNamePattern, shallowStoreNamePattern } = getZustandSetting(
      context.settings,
    );

    return {
      ImportDeclaration(node) {
        if (node.range) {
          insetRange = node.range;
        }
      },
      CallExpression(node) {
        if (
          node.type === 'CallExpression' &&
          node.callee.type === 'Identifier'
        ) {
          const { name } = node.callee;

          if (
            isNameMatchPattern(name, storeNamePattern) &&
            !isNameMatchPattern(name, shallowStoreNamePattern)
          ) {
            if (node.arguments.length === 1) {
              const expr = node.arguments[0];
              if (
                expr.type === 'FunctionExpression' ||
                expr.type === 'ArrowFunctionExpression'
              ) {
                if (expr.body.type === 'BlockStatement') {
                  const ret = expr.body.body.find(
                    i => i.type === 'ReturnStatement',
                  ) as TSESTree.ReturnStatement | undefined;

                  if (ret?.argument) {
                    if (isObjLiteral(ret.argument)) {
                      problemNodes.push(node);
                      return;
                    }

                    if (ret.argument.type === 'Identifier') {
                      const variable = ASTUtils.findVariable(
                        context.sourceCode.getScope(ret),
                        ret.argument.name,
                      );

                      const n = variable?.defs[0].node;
                      if (n?.type === AST_NODE_TYPES.VariableDeclarator) {
                        if (isObjLiteral(n.init)) {
                          problemNodes.push(node);
                          return;
                        }
                      }
                    }
                  }
                } else if (isObjLiteral(expr.body)) {
                  problemNodes.push(node);
                  return;
                }
              }
            }
            // deprecated use
          }
        }
      },

      'Program:exit'() {
        problemNodes.forEach(node => {
          const { name } = node.callee as any;
          const expr = node.arguments[0];
          context.report({
            node,
            messageId: 'preferShallow',
            data: { name },
            suggest: [
              {
                messageId: 'useShallow',
                fix: fixer => {
                  return [
                    fixer.insertTextBefore(expr, 'useShallow('),
                    fixer.insertTextAfter(expr, ')'),
                    fixer.insertTextAfterRange(
                      insetRange,
                      "\nimport { useShallow } from 'zustand/react/shallow';\n",
                    ),
                  ];
                },
              },
            ],
          });
        });
      },
    };
  },
});
