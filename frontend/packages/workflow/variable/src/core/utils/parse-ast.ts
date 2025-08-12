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

/* eslint-disable no-case-declarations */
import {
  ASTKind,
  type ObjectType,
  type ArrayType,
  type BaseType,
} from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableTreeNode,
  ViewVariableType,
  type ViewVariableMeta,
} from '@coze-workflow/base/types';

import { ExtendASTKind, type WorkflowVariableField } from '../types';
import { type ExtendBaseType } from '../extend-ast/extend-base-type';

export const getViewVariableTypeByAST = (
  ast: BaseType,
): { type?: ViewVariableType; childFields?: WorkflowVariableField[] } => {
  switch (ast?.kind) {
    case ASTKind.Array:
      const { type, childFields } = getViewVariableTypeByAST(
        (ast as ArrayType).items,
      );

      return {
        type:
          // Two-dimensional arrays are temporarily not supported
          type && !ViewVariableType.isArrayType(type)
            ? ViewVariableType.wrapToArrayType(type)
            : type,
        childFields,
      };

    case ASTKind.Object:
      return {
        type: ViewVariableType.Object,
        childFields: (ast as ObjectType).properties,
      };

    case ASTKind.String:
      return { type: ViewVariableType.String };

    case ASTKind.Number:
      return { type: ViewVariableType.Number };

    case ASTKind.Boolean:
      return { type: ViewVariableType.Boolean };

    case ASTKind.Integer:
      return { type: ViewVariableType.Integer };

    case ExtendASTKind.ExtendBaseType:
      return { type: (ast as ExtendBaseType).type };

    default:
      break;
  }

  return {};
};

export const getViewVariableByField = (
  field: WorkflowVariableField,
): ViewVariableMeta | undefined => {
  const { type, childFields } = getViewVariableTypeByAST(field.type);

  if (!type) {
    return undefined;
  }

  return {
    ...field.meta,
    type,
    name: field.key,
    key: field.key,
    children: childFields
      ?.map(getViewVariableByField)
      .filter(Boolean) as ViewVariableTreeNode[],
  };
};

export const getViewVariableTWithUniqKey = (
  viewMeta: ViewVariableMeta | undefined,
  parentKeyPath?: string,
): ViewVariableMeta | undefined => {
  if (!viewMeta) {
    return viewMeta;
  }

  const currKey = parentKeyPath
    ? `${parentKeyPath}.${viewMeta.key}`
    : `${viewMeta.key}`;

  return {
    ...viewMeta,
    key: currKey,
    children: viewMeta.children
      ?.map(_child => getViewVariableTWithUniqKey(_child, currKey))
      .filter(Boolean) as ViewVariableMeta[],
  };
};
