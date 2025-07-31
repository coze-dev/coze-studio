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

/* eslint-disable security/detect-object-injection -- no-need */
/* eslint-disable @typescript-eslint/no-namespace -- no-need */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- no-need
export type TraverseValue = any;
export interface TraverseNode {
  value: TraverseValue;
  container?: TraverseValue;
  parent?: TraverseNode;
  key?: string;
  index?: number;
}

export interface TraverseContext {
  node: TraverseNode;
  setValue: (value: TraverseValue) => void;
  getParents: () => TraverseNode[];
  getPath: () => Array<string | number>;
  getStringifyPath: () => string;
  deleteSelf: () => void;
}

export type TraverseHandler = (context: TraverseContext) => void;

/**
 * Traverse the object in depth, processing each value
 * @param value over object
 * @param handling function
 */
export const traverse = <T extends TraverseValue = TraverseValue>(
  value: T,
  handler: TraverseHandler | TraverseHandler[],
): T => {
  const traverseHandler: TraverseHandler = Array.isArray(handler)
    ? (context: TraverseContext) => {
        handler.forEach(handlerFn => handlerFn(context));
      }
    : handler;
  TraverseUtils.traverseNodes({ value }, traverseHandler);
  return value;
};

namespace TraverseUtils {
  /**
   * Traverse the object in depth, processing each value
   * @param node traverse node
   * @param handling function
   */
  export const traverseNodes = (
    node: TraverseNode,
    handle: TraverseHandler,
  ): void => {
    const { value } = node;
    if (!value) {
      // exception handling
      return;
    }
    if (Object.prototype.toString.call(value) === '[object Object]') {
      // Object, iterate through each property of the object
      Object.entries(value).forEach(([key, item]) =>
        traverseNodes(
          {
            value: item,
            container: value,
            key,
            parent: node,
          },
          handle,
        ),
      );
    } else if (Array.isArray(value)) {
      // Array, iterate through each element of the array
      // The iteration starts at the end of the array, so that even if an element is removed halfway through, it will not affect the index of the unprocessed element
      for (let index = value.length - 1; index >= 0; index--) {
        const item: string = value[index];
        traverseNodes(
          {
            value: item,
            container: value,
            index,
            parent: node,
          },
          handle,
        );
      }
    }
    const context: TraverseContext = createContext({ node });
    handle(context);
  };

  const createContext = ({
    node,
  }: {
    node: TraverseNode;
  }): TraverseContext => ({
    node,
    setValue: (value: unknown) => setValue(node, value),
    getParents: () => getParents(node),
    getPath: () => getPath(node),
    getStringifyPath: () => getStringifyPath(node),
    deleteSelf: () => deleteSelf(node),
  });

  const setValue = (node: TraverseNode, value: unknown) => {
    // Set Value Function
    // Reference type, you need to modify the value with the help of the parent element
    // Since it is a recursive traversal, it is necessary to determine which property of the object to assign a value to, or which element of the array to assign a value to, according to node
    if (!value || !node) {
      return;
    }
    node.value = value;
    // Remove container, key, index from upper scope node
    const { container, key, index } = node;
    if (key && container) {
      container[key] = value;
    } else if (typeof index === 'number') {
      container[index] = value;
    }
  };

  const getParents = (node: TraverseNode): TraverseNode[] => {
    const parents: TraverseNode[] = [];
    let currentNode: TraverseNode | undefined = node;
    while (currentNode) {
      parents.unshift(currentNode);
      currentNode = currentNode.parent;
    }
    return parents;
  };

  const getPath = (node: TraverseNode): Array<string | number> => {
    const path: Array<string | number> = [];
    const parents = getParents(node);
    parents.forEach(parent => {
      if (parent.key) {
        path.unshift(parent.key);
      } else if (parent.index) {
        path.unshift(parent.index);
      }
    });
    return path;
  };

  const getStringifyPath = (node: TraverseNode): string => {
    const path = getPath(node);
    return path.reduce((stringifyPath: string, pathItem: string | number) => {
      if (typeof pathItem === 'string') {
        const re = /\W/g;
        if (re.test(pathItem)) {
          // Contains special characters
          return `${stringifyPath}["${pathItem}"]`;
        }
        return `${stringifyPath}.${pathItem}`;
      } else {
        return `${stringifyPath}[${pathItem}]`;
      }
    }, '');
  };

  const deleteSelf = (node: TraverseNode): void => {
    const { container, key, index } = node;
    if (key && container) {
      delete container[key];
    } else if (typeof index === 'number') {
      container.splice(index, 1);
    }
  };
}
