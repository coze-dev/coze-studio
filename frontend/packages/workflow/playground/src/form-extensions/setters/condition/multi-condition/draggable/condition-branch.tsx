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

        // If the drag and hover items are the same, do nothing
        if (dragIndex === hoverIndex) {
          return;
        }

        // Get the bounding rectangle of the hover item
        const hoverBoundingRect = ref.current?.getBoundingClientRect();
        // Calculate the vertical midpoint of the hover term
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // Get the current mouse pointer position
        const clientOffset = monitor.getClientOffset();
        if (!clientOffset) {
          return;
        }
        // Calculate the distance of the pointer from the top of the hovering item
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Drag down
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
          return;
        }
        // Drag up
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
          return;
        }
        // Perform a move operation
        onMoveBranch(dragIndex, hoverIndex);
        // Update the index of the drag item
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
