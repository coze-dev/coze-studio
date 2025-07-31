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

import path from 'path';
import type { Rule } from 'eslint';

export const noDuplicatedDepsRule: Rule.RuleModule = {
  meta: {
    docs: {
      description: "Don't repeat deps in package.json",
    },
    messages: {
      'no-duplicated': '发现重复声明的依赖：{{depName}}，请更正。',
    },
  },

  create(context) {
    const filename = context.getFilename();
    if (path.basename(filename) !== 'package.json') {
      return {};
    }

    return {
      AssignmentExpression(node) {
        const json = node.right;
        const { properties } = json as any;
        if (!properties) {
          return;
        }
        // Compare dependencies with devDependencies for duplicate dependencies
        const dependencies = properties.find(
          p => p.key.value === 'dependencies',
        );
        const devDependencies = properties.find(
          p => p.key.value === 'devDependencies',
        );

        if (!dependencies || !devDependencies) {
          return;
        }
        const depValue = dependencies.value.properties;
        const devDepValue = devDependencies.value.properties;
        depValue.forEach(dep => {
          const duplicated = devDepValue.find(
            d => d.key.value === dep.key.value,
          );
          if (duplicated) {
            context.report({
              node: dep,
              messageId: 'no-duplicated',
              data: { depName: duplicated.key.value },
            });
          }
        });
      },
    };
  },
};
