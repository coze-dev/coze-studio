import path from 'path';
import { TSESTree } from '@typescript-eslint/utils';
import { findVariable } from '@typescript-eslint/utils/ast-utils';
import { accessImportedIds, createRule, isSameIdentifier } from '../utils';

const STORE_CREATE_NAME = 'create';

export interface OptionType {
  pattern: string;
}

export const storeFilenameConvention = createRule<
  OptionType[],
  'nameConvention'
>({
  defaultOptions: [{ pattern: '^([a-zA-Z0-9]+-?)+[sS]tore$' }],
  name: 'zustand/store-filename-convention',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'The store filename must match naming convention',
    },
    messages: {
      nameConvention:
        'The filename of the file that creates a store must match pattern {{pattern}}',
    },
    schema: [],
  },

  create: accessImportedIds<OptionType>({ [STORE_CREATE_NAME]: ['zustand'] })(
    (context, options, ids) => {
      return {
        CallExpression(node: TSESTree.CallExpression) {
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
              const fileNamePattern = new RegExp(options[0].pattern);
              const filename = path.basename(
                context.filename,
                path.extname(context.filename),
              );
              if (!fileNamePattern.test(filename)) {
                context.report({
                  loc: { line: 0, column: 0 },
                  messageId: 'nameConvention',
                  data: {
                    pattern: fileNamePattern,
                  },
                });
              }
            }
          }
        },
      };
    },
  ),
});
