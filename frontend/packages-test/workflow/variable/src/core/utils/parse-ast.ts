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
          // 暂时不支持二维数组
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
