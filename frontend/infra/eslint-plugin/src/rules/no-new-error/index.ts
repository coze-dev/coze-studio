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

import type { Rule } from 'eslint';

export const noNewErrorRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: "Don't use new Error()",
    },
    fixable: 'code',
    messages: {
      'no-new-error': 'found use new Error()',
    },
  },

  create(context) {
    return {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      NewExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'Error') {
          context.report({
            node,
            messageId: 'no-new-error',
            fix(fixer) {
              const args =
                node.arguments
                  .map(arg => context.sourceCode.getText(arg))
                  .join(',') || "'custom error'";
              return fixer.replaceText(
                node,
                `new CustomError('normal_error', ${args})`,
              );
            },
          });
        }
      },
    };
  },
};
