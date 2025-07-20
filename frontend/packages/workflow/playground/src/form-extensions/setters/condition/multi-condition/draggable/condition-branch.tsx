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
 
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useDrop, useDrag } from 'react-dnd';
import { type FC, useRef, useEffect } from 'react';

import type { Identifier } from 'dnd-core';
import classNames from 'classnames';
import { IconHandle } from '@douyinfe/semi-icons';

import {
  ConditionBranch,
  type ConditionBranchProps,
} from '../condition-branch';
import { ConditionBranchBlock } from './types';

interface DraggableConditionBranchProps extends ConditionBranchProps {
  index: number;
  showDraggable?: boolean;
  onDragStart: (uid: number) => void;
  onDragEnd?: (startIndex: number, endIndex: number) => void;
  onMoveBranch: (dragIndex: number, hoverIndex: number) => void;
}

interface DragItem {
  index: number;
  name: string;
}

export const DraggableConditionBranch: FC<
  DraggableConditionBranchProps
> = props => {
  const { branch, index, onDragStart, onDragEnd, onMoveBranch, showDraggable } =
    props;
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: ConditionBranchBlock,
      item: () => {
        onDragStart?.(branch.uid);
        return {
          type: ConditionBranchBlock,
          index,
          startIndex: index,
          uid: branch.uid,
        };
      },
      end: (item, monitor) => {
        onDragEnd?.(item.startIndex, index);
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [branch, onDragEnd, index],
  );

  const [, drop] = useDrop<
    DragItem,
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
    void,
    { handlerId: Identifier | null }
  >(
    () => ({
      accept: ConditionBranchBlock,
      hover(item, monitor) {
        if (!ref.current || !monitor) {
          return;
        }
        const dragIndex = item.index;
        const hoverIndex = index;

        // 如果拖拽项和悬停项是同一个，不做任何操作
        if (dragIndex === hoverIndex) {
          return;
        }

        // 获取悬停项的边界矩形
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        // 计算悬停项的垂直中点
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // 获取当前鼠标指针的位置
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) {
          return;
        }
        // 计算指针距离悬停项顶部的距离
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // 向下拖动的情况
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        // 向上拖动的情况
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        // 执行移动操作
        onMoveBranch(dragIndex, hoverIndex);
        // 更新拖拽项的索引
        item.index = hoverIndex;
      },
    }),
    [branch, onMoveBranch, index],
  );

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  drag(ref);

  return (
    <div
      className={classNames({
        ['opacity-0']: isDragging,
        ['opacity-100']: !isDragging,
      })}
      ref={drop}
    >
      <ConditionBranch
        {...props}
        titleIcon={
          showDraggable ? (
            <IconHandle
              ref={ref}
              data-disable-node-drag="true"
              className="cursor-move pr-1"
              style={{ color: '#aaa' }}
            />
          ) : null
        }
      />
    </div>
  );
};
