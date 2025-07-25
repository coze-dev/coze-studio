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
 * 深度遍历对象，对每个值做处理
 * @param value 遍历对象
 * @param handle 处理函数
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
   * 深度遍历对象，对每个值做处理
   * @param node 遍历节点
   * @param handle 处理函数
   */
  export const traverseNodes = (
    node: TraverseNode,
    handle: TraverseHandler,
  ): void => {
    const { value } = node;
    if (!value) {
      // 异常处理
      return;
    }
    if (Object.prototype.toString.call(value) === '[object Object]') {
      // 对象，遍历对象的每个属性
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
      // 数组，遍历数组的每个元素
      // 从数组的末尾开始遍历，这样即使中途移除了某个元素，也不会影响到未处理的元素的索引
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
    // 设置值函数
    // 引用类型，需要借助父元素修改值
    // 由于是递归遍历，所以需要根据node来判断是给对象的哪个属性赋值，还是给数组的哪个元素赋值
    if (!value || !node) {
      return;
    }
    node.value = value;
    // 从上级作用域node中取出container，key，index
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
          // 包含特殊字符
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
