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

import { isObject } from 'lodash-es';

import { LineStatus, type JsonValueType, type Field } from '../types';
import { isBigNumber } from './big-number';

/**
 * Push through the line state of the parent element to the line state of the child element
 */
const getLineByParent2Child = (pLine: LineStatus): LineStatus => {
  switch (pLine) {
    /** It means that the parent node is also drilled from the parent node, and the sub-node here only needs to continue the line. */
    case LineStatus.Visible:
      return LineStatus.Half;
    /** Indicates that the parent node is the last node of the parent node, and the sub-node does not need to continue, just render blank. */
    case LineStatus.Last:
      return LineStatus.Hidden;
    /** Other cases fully inherit the line of the parent node */
    default:
      return pLine;
  }
};

/**
 * Parse objects into fields that can be cycled
 * 1. If object is not a complex type, fields of length 1 are returned to render only one item
 * 2. If object = {}, fields of length 0 are returned, and the rendering layer needs to be well covered
 */
const generateFields = (object: JsonValueType): Field[] => {
  /** If the object is not a complex type */
  if (!isObject(object) || isBigNumber(object)) {
    return [
      {
        path: [],
        lines: [],
        value: object,
        isObj: false,
        children: [],
      },
    ];
  }

  /** Cache the calculated line during recursive calculation, which is meaningless and reduces some time complexity */
  const lineMap = new Map<string[], LineStatus[]>();

  /** Recursive parsing of object as fields */
  const dfs = ($object: object, $parentPath: string[] = []): Field[] => {
    // If it is not an object, return an empty array directly to cover the exception
    if (!isObject($object)) {
      return [];
    }

    // If it is a large number, return an empty array directly
    if (isBigNumber($object)) {
      return [];
    }

    const parentLines = lineMap.get($parentPath) || [];

    const keys = Object.keys($object);

    return keys.map((key, idx) => {
      const value = $object[key];
      const path = $parentPath.concat(key);
      const last = idx === keys.length - 1;
      /**
       * Derive the sub-node's line from the parent's line
       */
      const lines = parentLines
        .map<LineStatus>(getLineByParent2Child)
        /**
         * Finally, splice the sub-node's own line, and the last node is distinguished from the ordinary node by style.
         */
        .concat(last ? LineStatus.Last : LineStatus.Visible);
      lineMap.set(path, lines);
      return {
        path,
        lines,
        value,
        children: dfs(value, path),
        isObj: isObject(value) && !isBigNumber(value),
      };
    });
  };

  return dfs(object);
};

export { generateFields };
