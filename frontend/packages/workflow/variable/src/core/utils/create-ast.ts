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

import { isArray, uniqBy } from 'lodash-es';
import {
  ASTFactory,
  type PropertyJSON,
  type ASTNodeJSON,
  type VariableDeclarationJSON,
} from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableMeta,
  ViewVariableType,
  type ViewVariableTreeNode,
  type BatchVOInputList,
  type RefExpression,
} from '@coze-workflow/base/types';

import { createExtendBaseType } from '../extend-ast/extend-base-type';
import { createRefExpression } from '../extend-ast/custom-key-path-expression';

/**
 * ViewVariableType to AST
 * @param type
 * @param properties drill down fields
 * @returns
 */
export const createASTFromType = (
  type: ViewVariableType,
  // drill down field
  properties?: PropertyJSON[],
): ASTNodeJSON | undefined => {
  if (ViewVariableType.isArrayType(type)) {
    return ASTFactory.createArray({
      items: createASTFromType(
        ViewVariableType.getArraySubType(type),
        properties,
      ),
    });
  }

  switch (type) {
    case ViewVariableType.Boolean:
      return ASTFactory.createBoolean();
    case ViewVariableType.String:
      return ASTFactory.createString();
    case ViewVariableType.Number:
      return ASTFactory.createNumber();
    case ViewVariableType.Integer:
      return ASTFactory.createInteger();
    case ViewVariableType.Object:
      return ASTFactory.createObject({
        properties,
      });
    default:
      // The basic types of the remaining extensions
      return createExtendBaseType({ type });
  }
};

/**
 * ViewVariableTreeNode properties
 * @param treeNode
 * @returns
 */
export const createASTPropertyFromViewVariable = (
  treeNode: ViewVariableTreeNode,
): PropertyJSON | undefined => {
  if (!treeNode?.name) {
    return;
  }

  const drilldownProperties = uniqBy(
    treeNode.children || [],
    _child => _child?.name,
  )
    .filter(_child => _child && _child?.name)
    ?.map(createASTPropertyFromViewVariable)
    .filter(Boolean) as PropertyJSON[];

  return ASTFactory.createProperty({
    key: treeNode.name,
    meta: treeNode,
    type: createASTFromType(treeNode.type, drilldownProperties),
  });
};

/**
 * Node output variable generation
 * @param rootKey
 * @param variables
 * @returns
 */
export const parseNodeOutputByViewVariableMeta = (
  nodeId: string,
  value: ViewVariableMeta | ViewVariableMeta[],
): VariableDeclarationJSON[] => {
  const list = uniqBy(
    isArray(value) ? value : [value],
    _child => _child?.name,
    //  No variable is generated when the Preset variable is not enabled
  ).filter(v => v && v.name && !(v.isPreset && !v.enabled));

  if (list.length > 0) {
    return [
      ASTFactory.createVariableDeclaration({
        key: `${nodeId}.outputs`,
        type: ASTFactory.createObject({
          properties: list
            .map(createASTPropertyFromViewVariable)
            .filter(Boolean) as PropertyJSON[],
        }),
      }),
    ];
  }

  return [];
};

/**
 * Batch output variable generation
 * @param rootKey
 * @param inputList
 * @returns
 */
export const parseNodeBatchByInputList = (
  nodeId: string,
  inputList: BatchVOInputList[] = [],
): VariableDeclarationJSON[] => {
  const list = uniqBy(
    inputList.filter(_input => _input && _input?.name),
    _child => _child?.name,
  );

  if (list.length > 0) {
    return [
      ASTFactory.createVariableDeclaration({
        key: `${nodeId}.locals`,
        type: ASTFactory.createObject({
          properties: list.map(_input =>
            ASTFactory.createProperty({
              key: _input?.name,
              initializer: ASTFactory.createEnumerateExpression({
                enumerateFor: createRefExpression({
                  keyPath:
                    (_input?.input as RefExpression)?.content?.keyPath || [],
                  rawMeta: _input?.input?.rawMeta,
                }),
              }),
            }),
          ),
        }),
      }),
    ];
  }

  return [];
};
