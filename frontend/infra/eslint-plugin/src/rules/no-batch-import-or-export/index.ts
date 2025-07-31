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

export const noBatchImportOrExportRule: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disable batch import or export.',
    },
    messages: {
      avoidUseBatchExport: 'Avoid use batch export: "{{ code }}".',
      avoidUseBatchImport: 'Avoid use batch import: "{{ code }}".',
    },
  },

  create(context) {
    return {
      ExportAllDeclaration: node => {
        context.report({
          node,
          messageId: 'avoidUseBatchExport',
          data: {
            code: context.sourceCode.getText(node).toString(),
          },
        });
      },
      ImportDeclaration: node => {
        node.specifiers.forEach(v => {
          if (v.type === 'ImportNamespaceSpecifier') {
            context.report({
              node,
              messageId: 'avoidUseBatchImport',
              data: {
                code: context.sourceCode.getText(node),
              },
            });
          }
        });
      },
    };
  },
};
