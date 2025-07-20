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
 
import { useState } from 'react';

import { nanoid } from 'nanoid';
import update from 'immutability-helper';
import { useUpdateEffect } from 'ahooks';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UseSortParams {
  value: Array<any>;
  onChange?: (val: Array<any>) => void;
  /**
   * 拖拽开始回调
   */
  onDragStart?: (startIndex: number) => void;
  /**
   * 拖拽顺序改变回调
   */
  onDragMove?: (startIndex: number, endIndex: number) => void;
  /**
   * 拖拽结束回调
   */
  onDragEnd?: (startIndex: number, endIndex: number) => void;
}

export const useSort = (params: UseSortParams) => {
  const { value = [], onChange, onDragStart, onDragMove, onDragEnd } = params;

  // 为 value 添加 dragItemId
  const [data, setData] = useState<
    Array<{
      value: any;
      dragItemId: string;
    }>
  >(
    value.map(item => ({
      value: item,
      dragItemId: nanoid(),
    })),
  );

  useUpdateEffect(() => {
    const valueWithDragId = value.map((item, index) => ({
      value: item,
      dragItemId: data[index]?.dragItemId || nanoid(),
    }));

    setData(valueWithDragId);
  }, [value]);

  const [draggingId, setDraggingId] = useState<string | undefined>('');

  // 初始化一个唯一id，用于区分不同拖拽类型的预览
  const [dragItemType] = useState(nanoid());

  const isDragging = !!draggingId;

  const handleDragStart = (startIndex: number) => {
    setDraggingId(data[startIndex].dragItemId);

    onDragStart?.(startIndex);
  };

  const handleDragMove = (startIndex: number, endIndex: number) => {
    setData(prevData =>
      update(prevData, {
        $splice: [
          [startIndex, 1],
          [endIndex, 0, prevData[startIndex]],
        ],
      }),
    );

    onDragMove?.(startIndex, endIndex);
  };

  const handleDragEnd = (startIndex: number, endIndex: number) => {
    setDraggingId(undefined);

    if (startIndex !== endIndex) {
      onChange?.(data.map(item => item.value));
    }

    onDragEnd?.(startIndex, endIndex);
  };

  return {
    data,
    isDragging,
    draggingId,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    dragItemType,
  };
};
