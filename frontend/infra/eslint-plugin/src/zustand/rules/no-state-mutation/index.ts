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
import { TSESTree } from '@typescript-eslint/utils';
import {
  createRule,
  extractIdentifiersFromPattern,
  isSameIdentifier,
  isNameMatchPattern,
  getZustandSetting,
} from '../utils';

const GET_STATE = 'getState';

export const noStateMutation = createRule({
  name: 'zustand/no-state-mutation',
  defaultOptions: [],
  meta: {
    schema: [],
    type: 'problem',
    docs: {
      description: 'Disallow mutate store state directly',
    },
    messages: {
      noStateMutation:
        'Do not mutate the store state directly. Instead, use the set or setState API',
    },
  },

  create(context) {
    const stateIds: TSESTree.Identifier[] = [];
    const idsToDetect: TSESTree.Identifier[] = [];
    let assignNode: TSESTree.AssignmentExpression | undefined;
    const { storeNamePattern } = getZustandSetting(context.settings);
    return {
      AssignmentExpression(node) {
        assignNode = node;
        if (node.left.type === 'MemberExpression') {
          let n = node.left;
          while (n.object && n.object.type === 'MemberExpression') {
            n = n.object;
          }
          if (
            n.object.type === 'CallExpression' &&
            n.object.callee.type === 'MemberExpression' &&
            n.object.callee.object.type === 'Identifier' &&
            isNameMatchPattern(n.object.callee.object.name, storeNamePattern)
          ) {
            context.report({
              node,
              messageId: 'noStateMutation',
            });
            return;
          }
          if (n.object.type === 'Identifier') {
            idsToDetect.push(n.object);
          }
        }
      },
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'CallExpression' &&
          node.init.callee.type === 'MemberExpression' &&
          node.init.callee.object.type === 'Identifier' &&
          isNameMatchPattern(node.init.callee.object.name, storeNamePattern) &&
          node.init.callee.property.type === 'Identifier' &&
          node.init.callee.property.name === GET_STATE
        ) {
          const identifiers = extractIdentifiersFromPattern(node.id);
          stateIds.push(...identifiers);
        }
      },
      'Program:exit'() {
        if (assignNode) {
          idsToDetect.forEach(modifyObjId => {
            const variable = findVariable(
              context.sourceCode.getScope(modifyObjId) as any,
              modifyObjId.name,
            );

            if (
              stateIds.find(i => isSameIdentifier(variable?.identifiers[0], i))
            ) {
              context.report({
                node: assignNode as TSESTree.AssignmentExpression,
                messageId: 'noStateMutation',
              });
            }
          });
        }
      },
    };
  },
});
