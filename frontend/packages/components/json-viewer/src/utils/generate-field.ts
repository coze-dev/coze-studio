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
 * 通过父元素的线条状态推到子元素的线条状态
 */
const getLineByParent2Child = (pLine: LineStatus): LineStatus => {
  switch (pLine) {
    /** 表示父节点也是从父父节点下钻而来，此处的子节点只需要把线延续下去即可 */
    case LineStatus.Visible:
      return LineStatus.Half;
    /** 表示父节点是父父节点的最后一个节点，子节点无需再延续，渲染空白即可 */
    case LineStatus.Last:
      return LineStatus.Hidden;
    /** 其他的情况完全继承父节点的线 */
    default:
      return pLine;
  }
};

/**
 * 将 object 解析成可以循环渲染的 fields
 * 1. 若 object 非复杂类型，则返回长度为 1 的 fields 只渲染一项
 * 2. 若 object = {}，则返回长度为 0 的 fields，渲染层需要做好兜底
 */
const generateFields = (object: JsonValueType): Field[] => {
  /** 若 object 非复杂类型 */
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

  /** 递归计算时缓存一下计算好的线，没别的意义，降低一些时间复杂度 */
  const lineMap = new Map<string[], LineStatus[]>();

  /** 递归解析 object 为 fields */
  const dfs = ($object: object, $parentPath: string[] = []): Field[] => {
    // 如果不是对象，直接返回空数组，兜底异常情况
    if (!isObject($object)) {
      return [];
    }

    // 如果是大数字，直接返回空数组
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
       * 根据父节点的线推导子节点的线
       */
      const lines = parentLines
        .map<LineStatus>(getLineByParent2Child)
        /**
         * 最后拼接上子节点自己的线，最后一个节点和普通的节点有样式区分
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
