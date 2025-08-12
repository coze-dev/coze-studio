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

import { ViewVariableType } from '@/store/variable-groups/types';
import { type TreeNodeCustomData } from '@/components/variable-tree/type';
import { formatJson } from '@/components/variable-tree/components/json-editor/utils/format-json';

const getDefaultValueByType = (type: ViewVariableType) => {
  switch (type) {
    case ViewVariableType.String:
      return '';
    case ViewVariableType.Integer:
    case ViewVariableType.Number:
      return 0;
    case ViewVariableType.Boolean:
      return false;
    case ViewVariableType.Object:
      return {};
    case ViewVariableType.ArrayString:
      return [''];
    case ViewVariableType.ArrayInteger:
      return [0];
    case ViewVariableType.ArrayBoolean:
      return [true];
    case ViewVariableType.ArrayNumber:
      return [0];
    case ViewVariableType.ArrayObject:
      return [{}];
    default:
      return {};
  }
};

const isArrayType = (type: ViewVariableType) =>
  [
    ViewVariableType.ArrayString,
    ViewVariableType.ArrayInteger,
    ViewVariableType.ArrayBoolean,
    ViewVariableType.ArrayNumber,
    ViewVariableType.ArrayObject,
  ].includes(type);

export const getEditorViewVariableJson = (treeData: TreeNodeCustomData) => {
  const { defaultValue, type, name, children } = treeData;

  if (defaultValue) {
    const json = JSON.parse(defaultValue);
    return formatJson(
      JSON.stringify({
        [name]: json,
      }),
    );
  }

  // If there is no name, return an empty object
  if (!name) {
    return '{}';
  }

  const isArray = isArrayType(type);

  // Recursive processing of children
  const processChildren = (
    nodes?: TreeNodeCustomData[],
    parentType?: ViewVariableType,
  ) => {
    if (!nodes || nodes.length === 0) {
      return getDefaultValueByType(parentType || type);
    }

    if (isArray && !parentType) {
      const firstChild = nodes[0];
      if (!firstChild) {
        return [];
      }

      // If it is an array type, generate a default value based on the type of the first child element
      const result = {};
      if (firstChild.children && firstChild.children.length > 0) {
        result[firstChild.name] = processChildren(
          firstChild.children,
          firstChild.type,
        );
      } else {
        result[firstChild.name] = getDefaultValueByType(firstChild.type);
      }
      return [result];
    }

    return nodes.reduce((acc, node) => {
      if (!node.name) {
        return acc;
      }
      if (node.children && node.children.length > 0) {
        const value = processChildren(node.children, node.type);
        acc[node.name] = isArrayType(node.type) ? [value] : value;
      } else {
        acc[node.name] = getDefaultValueByType(node.type);
      }
      return acc;
    }, {} satisfies Record<string, unknown>);
  };

  // Generate the final JSON structure
  const result = {
    [name]: processChildren(children),
  };

  return formatJson(JSON.stringify(result));
};
