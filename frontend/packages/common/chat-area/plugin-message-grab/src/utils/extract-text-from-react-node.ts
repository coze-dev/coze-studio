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
 * Extracting plain text from ReactNode (excluding various special conversion logic)
 */
export const extractTextFromReactNode = (children: ReactNode): string => {
  let text = '';

  Children.forEach(children, child => {
    if (typeof child === 'string' || typeof child === 'number') {
      // If child is a string or number, add it directly to the text
      text += child.toString();
    } else if (
      isValidElement(child) &&
      isReactElementWithChildren(child) &&
      child.props.children
    ) {
      // If child is a React element with a children attribute, recursive extraction
      text += extractTextFromReactNode(child.props.children);
    }
    // If child is null or boolean, no action is required
  });

  return text;
};
