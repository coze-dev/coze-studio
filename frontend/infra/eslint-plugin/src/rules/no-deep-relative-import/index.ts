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

import { Rule } from 'eslint';

const isTooDeep = (declare: string, maxLevel: number) => {
  const match = /^(\.\.\/)+/.exec(declare);
  if (match) {
    // 3 = '../'.length
    const deep = match[0].length / 3;
    if (deep >= maxLevel) {
      return true;
    }
  }
  return false;
};

export const noDeepRelativeImportRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Detect how deep levels in import/require statments',
      recommended: true,
    },
    schema: [
      {
        type: 'object',
        properties: {
          max: {
            type: 'integer',
          },
        },
      },
    ],
    messages: {
      max: "Don't import module exceed {{max}} times of '../'. You should use some alias to avoid such problem.",
    },
  },
  create(context) {
    const { max = 3 } = context.options[0] || {};
    return {
      ImportDeclaration(node) {
        if (typeof node.source.value === 'string') {
          const declare = node.source.value.trim();
          if (isTooDeep(declare, max)) {
            context.report({
              node,
              messageId: 'max',
              data: { max },
            });
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type !== 'Identifier') {
          return;
        }
        if (node.callee.name !== 'require') {
          return;
        }
        if (node.arguments.length !== 1) {
          return;
        }
        const arg = node.arguments[0];
        if (arg.type === 'Literal' && typeof arg.value === 'string') {
          const declare = arg.value.trim();
          if (isTooDeep(declare, max)) {
            context.report({
              node,
              messageId: 'max',
              data: { max },
            });
          }
        }
      },
      ImportExpression(node) {
        if (
          node.source.type === 'Literal' &&
          typeof node.source.value === 'string'
        ) {
          const declare = node.source.value.trim();
          if (isTooDeep(declare, max)) {
            context.report({
              node,
              messageId: 'max',
              data: { max },
            });
          }
        }
      },
    };
  },
};
