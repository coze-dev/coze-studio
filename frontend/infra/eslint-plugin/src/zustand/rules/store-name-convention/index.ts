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
import { findVariable } from '@typescript-eslint/utils/ast-utils';
import {
  accessImportedIds,
  createRule,
  isSameIdentifier,
  isNameMatchPattern,
  getZustandSetting,
} from '../utils';

const STORE_CREATE_NAME = 'create';

export const storeNameConvention = createRule({
  name: 'zustand/name-convention',
  defaultOptions: [],
  meta: {
    schema: [],
    type: 'suggestion',
    docs: {
      description: 'The store name must match the naming convention',
    },
    messages: {
      nameConvention: 'The store name must match pattern {{pattern}}',
    },
  },

  create: accessImportedIds({ [STORE_CREATE_NAME]: ['zustand'] })(
    (context, _, ids) => {
      const { storeNamePattern } = getZustandSetting(context.settings);

      return {
        'VariableDeclarator > CallExpression'(node: TSESTree.CallExpression) {
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === STORE_CREATE_NAME
          ) {
            const variable = findVariable(
              context.sourceCode.getScope(node),
              STORE_CREATE_NAME,
            );
            if (
              isSameIdentifier(
                ids.get(STORE_CREATE_NAME),
                variable?.identifiers[0],
              )
            ) {
              const { parent } = node;
              if (
                parent.type === 'VariableDeclarator' &&
                parent.id.type === 'Identifier'
              ) {
                if (!isNameMatchPattern(parent.id.name, storeNamePattern)) {
                  context.report({
                    node: parent,
                    messageId: 'nameConvention',
                    data: {
                      pattern: storeNamePattern,
                    },
                  });
                }
              }
            }
          }
        },
      };
    },
  ),
});
