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

import {
  AST_NODE_TYPES,
  ESLintUtils,
  TSESTree,
} from '@typescript-eslint/utils';
import {
  RuleContext,
  RuleListener,
  SharedConfigurationSettings,
} from '@typescript-eslint/utils/ts-eslint';

const DEFAULT_STORE_NAME_PATTERN = '^use[a-zA-Z0-9_]*Store(Shallow)?$';
const DEFAULT_SHALLOW_STORE_NAME_PATTERN =
  '^use(Shallow[a-zA-Z0-9_]*Store|[a-zA-Z0-9_]*StoreShallow)$';

export const isObjLiteral = (node?: TSESTree.Expression | null) =>
  !!node &&
  (node.type === 'ObjectExpression' || node.type === 'ArrayExpression');

export const isNameMatchPattern = (name: string, namePattern: string) =>
  new RegExp(namePattern).test(name);

export const extractIdentifiersFromPattern = (
  node: TSESTree.DestructuringPattern,
) => {
  const identifiers: TSESTree.Identifier[] = [];

  const extractIdentifiers = (node: TSESTree.DestructuringPattern) => {
    if (node.type === 'Identifier') {
      identifiers.push(node);
    } else if (node.type === AST_NODE_TYPES.ObjectPattern) {
      node.properties.forEach(prop => {
        if (prop.type === AST_NODE_TYPES.Property && prop.value) {
          extractIdentifiers(prop.value as TSESTree.DestructuringPattern);
        } else if (
          prop.type === AST_NODE_TYPES.RestElement &&
          prop.argument.type === AST_NODE_TYPES.Identifier
        ) {
          extractIdentifiers(prop.argument);
        }
      });
    } else if (node.type === AST_NODE_TYPES.ArrayPattern) {
      node.elements.forEach(element => {
        if (element) {
          extractIdentifiers(element);
        }
      });
    } else if (node.type === AST_NODE_TYPES.RestElement) {
      extractIdentifiers(node.argument);
    }
  };

  extractIdentifiers(node);
  return identifiers;
};

export const isSameIdentifier = (
  identifierA?: TSESTree.Identifier,
  identifierB?: TSESTree.Identifier,
) =>
  !!(
    identifierA &&
    identifierB &&
    identifierA.name === identifierB.name &&
    identifierA.range?.[0] === identifierB.range?.[0] &&
    identifierA.range?.[1] === identifierB.range?.[1]
  );

export const createRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/pmndrs/zustand',
);

export const findCalleeNames = (
  node: TSESTree.CallExpressionArgument,
  names: string[] = [],
) => {
  if (node && node.type === AST_NODE_TYPES.CallExpression) {
    if (node.callee.type === AST_NODE_TYPES.Identifier) {
      names.push(node.callee.name);
    }
    findCalleeNames(node.arguments[0], names);
  }
  return names;
};

type TypeIdsMap = Map<string, TSESTree.Identifier>;
type ContextMap<T> = Readonly<RuleContext<string, readonly T[]>>;
type CreateType<T> = (
  context: ContextMap<T>,
  optionsWithDefault: readonly T[],
  ids: TypeIdsMap,
) => RuleListener;

export const accessImportedIds =
  <T>(ids: Record<string, string[]>) =>
  (originCreate: CreateType<T>) => {
    return ((context, options) => {
      const idsMap: TypeIdsMap = new Map();
      const listeners = originCreate(
        context as ContextMap<T>,
        options as T[],
        idsMap,
      );
      return {
        ...listeners,
        ImportDeclaration(node) {
          node.specifiers.forEach(s => {
            if (
              s.type === AST_NODE_TYPES.ImportSpecifier &&
              Object.hasOwnProperty.call(ids, s.local.name) &&
              ids[s.local.name].includes(node.source.value) &&
              s.imported.type === AST_NODE_TYPES.Identifier
            ) {
              idsMap.set(s.local.name, s.imported);
            }
          });
          listeners.ImportDeclaration?.(node);
        },
      };
    }) as Parameters<typeof createRule>[0]['create'];
  };

export const getZustandSetting = (settings: SharedConfigurationSettings) => {
  const defaultSetting = {
    storeNamePattern: DEFAULT_STORE_NAME_PATTERN,
    shallowStoreNamePattern: DEFAULT_SHALLOW_STORE_NAME_PATTERN,
  };
  return {
    ...defaultSetting,
    ...(settings.zustand || {}),
  };
};
