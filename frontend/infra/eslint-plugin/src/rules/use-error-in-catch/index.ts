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

import { type Rule } from 'eslint';
import traverse from 'eslint-traverse';

export const useErrorInCatch: Rule.RuleModule = {
  meta: {
    docs: {
      description: 'Use error in catch block',
    },
    messages: {
      'use-error':
        'Catch 中应该对捕获到的 "{{paramName}}" 做一些处理，不可直接忽略',
    },
  },

  create(context: Rule.RuleContext) {
    return {
      CatchClause(node) {
        const errorParam = (node.param as { name: string })?.name;

        let hasUsed = false;
        if (errorParam) {
          traverse(context, node.body, path => {
            const n = path.node;
            if (n.type === 'Identifier' && n.name === errorParam) {
              hasUsed = true;
              return traverse.STOP;
            }
          });
        }
        if (!hasUsed) {
          context.report({
            node,
            messageId: 'use-error',
            data: { paramName: errorParam },
          });
        }
      },
    };
  },
};
