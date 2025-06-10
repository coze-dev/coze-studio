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
