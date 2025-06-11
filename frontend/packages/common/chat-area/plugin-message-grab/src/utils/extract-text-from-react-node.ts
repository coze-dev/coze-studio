import {
  Children,
  type ReactElement,
  isValidElement,
  type ReactNode,
} from 'react';

import { isObject } from 'lodash-es';

const isReactElementWithChildren = (
  node: unknown,
): node is ReactElement<{ children: ReactNode }> =>
  isValidElement(node) &&
  'props' in node &&
  isObject(node.props) &&
  'children' in node.props;

/**
 * 从 ReactNode 中提取纯文本（不包括各种特殊转换逻辑）
 */
export const extractTextFromReactNode = (children: ReactNode): string => {
  let text = '';

  Children.forEach(children, child => {
    if (typeof child === 'string' || typeof child === 'number') {
      // 如果 child 是字符串或数字，直接加到 text 上
      text += child.toString();
    } else if (
      isValidElement(child) &&
      isReactElementWithChildren(child) &&
      child.props.children
    ) {
      // 如果 child 是 React 元素且有 children 属性，递归提取
      text += extractTextFromReactNode(child.props.children);
    }
    // 如果 child 是 null 或 boolean，不需要做任何操作
  });

  return text;
};
