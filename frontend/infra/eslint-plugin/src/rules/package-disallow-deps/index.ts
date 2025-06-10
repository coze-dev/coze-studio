import path from 'path';
import type { Rule } from 'eslint';
import semver from 'semver';

type RuleOptions = Array<string | [string, string]>;

export const disallowDepRule: Rule.RuleModule = {
  meta: {
    docs: {
      description: '禁止使用某些 npm 包',
    },
    messages: {
      disallowDep:
        "monorepo 内禁止使用 '{{dependence}}'，建议寻找同类 package 替换.\n {{ tips }}",
      disallowVersion:
        "monorepo 内禁止使用 '{{dependence}}@{{version}}' 版本，请替换为 {{blockVersion}} 之外的版本号",
    },
    schema: [
      {
        type: 'array',
      },
    ],
  },

  create(context) {
    const filename = context.getFilename();
    if (path.basename(filename) !== 'package.json') {
      return {};
    }
    const blocklist = context.options[0] as RuleOptions;
    if (!Array.isArray(blocklist)) {
      return {};
    }
    const normalizeBlocklist = blocklist.map(r =>
      typeof r === 'string' ? [r] : r,
    );
    const detect = (dep: string, version: string, node) => {
      const definition = normalizeBlocklist.find(r => r[0] === dep);
      if (!definition) {
        return;
      }
      const [, blockVersion, tips] = definition;
      // 没有提供 version 参数，判定为不允许所有版本号
      if (typeof blockVersion !== 'string' || blockVersion.length <= 0) {
        context.report({
          node,
          messageId: 'disallowDep',
          data: {
            dependence: dep,
            tips: tips || '',
          },
        });
      } else if (semver.intersects(version, blockVersion)) {
        context.report({
          node,
          messageId: 'disallowVersion',
          data: {
            dependence: dep,
            blockVersion,
            version,
            tips: tips || '',
          },
        });
      }
    };

    return {
      AssignmentExpression(node) {
        const json = node.right;
        const depProps = ['devDependencies', 'dependencies'];
        (json as any).properties
          .filter(r => depProps.includes(r.key.value))
          .forEach(r => {
            const props = r.value.properties;
            props.forEach(p => {
              const dep = p.key.value;
              const version = p.value.value;
              detect(dep, version, p);
            });
          });
      },
    };
  },
};
