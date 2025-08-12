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

export const noEmptyCatch: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Catch error block should not be empty.',
    },
    messages: {
      'no-empty':
        'Catch 代码块中不可为空，否则可能导致错误信息没有得到有效关注',
    },
  },

  create(context) {
    return {
      CatchClause(node) {
        for (const statement of node.body.body) {
          if (
            !['EmptyStatement', 'CommentBlock', 'CommentLine'].includes(
              statement.type,
            )
          ) {
            return;
          }
        }
        context.report({
          node,
          messageId: 'no-empty',
        });
      },
    };
  },
};
