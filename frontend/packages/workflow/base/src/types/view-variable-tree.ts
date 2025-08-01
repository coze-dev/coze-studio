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

import { type ViewVariableType } from './view-variable-type';

export interface ViewVariableTreeNode {
  key: string;
  type: ViewVariableType;
  name: string;
  children?: ViewVariableTreeNode[];
  required?: boolean;
  description?: string;
  // Identifies that the parameter is a built-in parameter, and the default is false.
  isPreset?: boolean;
  // Identifies whether the parameter is enabled, the default is false
  enabled?: boolean;
  // user-defined node name display
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
}

export interface ViewVariableMeta extends ViewVariableTreeNode {
  required?: boolean;
  description?: string;
  readonly?: boolean;
  mutable?: boolean; // Can be selected by the lvalue of the Set node
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ViewVariableTreeNode {
  /**
   * Query sub-node via path
   * @param node
   */
  export function getVariableTreeNodeByPath(
    node: ViewVariableTreeNode,
    keyPath: string[],
  ): ViewVariableTreeNode | undefined {
    keyPath = keyPath.slice();
    let currentNode: ViewVariableTreeNode | undefined = node;
    let key: string | undefined = keyPath.shift();
    while (key && currentNode) {
      key = keyPath.shift();
      if (key) {
        currentNode = (currentNode.children || []).find(
          child => child.key === key,
        ) as ViewVariableTreeNode;
        if (!currentNode) {
          return undefined;
        }
      }
    }
    return currentNode;
  }
  /**
   * ['xxx', 'xxx'] -> 'a.b.c'
   * @param keyPath
   * @deprecated
   */
  export function keyPathToNameString(
    node: ViewVariableTreeNode,
    keyPath: string[],
  ): string {
    const result: string[] = [];
    keyPath = keyPath.slice();
    let currentNode: ViewVariableTreeNode | undefined = node;
    let key: string | undefined = keyPath.shift();
    while (key && currentNode) {
      result.push(currentNode.name);
      key = keyPath.shift();
      if (key) {
        currentNode = (currentNode.children || []).find(
          child => child.key === key,
        ) as ViewVariableTreeNode;
        if (!currentNode) {
          return '';
        }
      }
    }
    return result.join('.');
  }

  /**
   * 'a.b.c' -> ['xxx', 'xxx']
   * @param nameStr
   * @deprecated
   */
  export function nameStringToKeyPath(
    node: ViewVariableTreeNode,
    nameStr: string,
  ): string[] {
    const result: string[] = [];
    const nameList = nameStr.split('.');
    let currentNode: ViewVariableTreeNode | undefined = node;
    let name = nameList.shift();
    while (name && currentNode) {
      result.push(currentNode.key);
      name = nameList.shift();
      if (name) {
        currentNode = (currentNode.children || []).find(
          child => child.name === name,
        ) as ViewVariableTreeNode;
        if (!currentNode) {
          return [];
        }
      }
    }
    return result;
  }
}
