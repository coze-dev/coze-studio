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
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDrop, useDrag } from 'react-dnd';
import React, { useRef, type FC, useEffect } from 'react';

import type { Identifier } from 'dnd-core';
import classNames from 'classnames';

interface SortItemProps {
  /**
   * 拖拽元素的类型
   */
  type: string;
  /**
   * 拖拽元素的顺序
   */
  index: number;
  /**
   * 拖拽元素的值
   */
  value: any;
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
  children: FC<{
    dragRef: React.RefObject<HTMLDivElement>;
    isDragging: boolean;
  }>;
}

export const SortableItem = (props: SortItemProps) => {
  const { children, type, onDragStart, onDragMove, onDragEnd, value, index } =
    props;

  const dragRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type,
      item: () => {
        onDragStart?.(index);
        return {
          type,
          startIndex: index,
          index,
          value,
        };
      },
      end: item => {
        onDragEnd?.(item.startIndex, index);
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [index, value, onDragStart, onDragEnd],
  );

  const [, drop] = useDrop<
    {
      index: number;
      name: string;
    },
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    void,
    { handlerId: Identifier | null }
  >(
    () => ({
      accept: type,
      hover(item, monitor) {
        if (!dragRef.current) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) {
          return;
        } // 如果回到自己的坑，那就什么都不做
        onDragMove?.(dragIndex, hoverIndex); // 调用传入的方法完成交换
        item.index = hoverIndex; // 将当前当前移动到Box的index赋值给当前拖动的box，不然会出现两个盒子疯狂抖动！
      },
    }),
    [index, onDragMove],
  );

  drag(dragRef);

  // 隐藏原生拖拽预览样式， 在custom-drag-layer中实现自定义预览样式
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  return (
    <div
      ref={drop}
      className={classNames({
        ['opacity-0']: isDragging,
        ['opacity-100']: !isDragging,
      })}
    >
      {children({ dragRef, isDragging })}
    </div>
  );
};
