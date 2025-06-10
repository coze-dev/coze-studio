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
        // 对比 dependencies 与 devDependencies 之间是否存在重复依赖
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
