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

import { useDrag, useDrop } from 'react-dnd';
import { useMemo, useRef, type RefObject } from 'react';

export type OnMove<TId = string | number> = (
  souceId: TId,
  targetId: TId,
  isBefore: boolean,
) => void; // Since there is no order information, it is necessary to specify whether it is before or after
export interface UseDndSortableParams<TId = string | number> {
  id: TId;
  type: symbol;
  onMove: OnMove<TId>;
  enabled?: boolean;
  direction?: 'horizontal' | 'verticle';
}

export type ConnectDnd = (
  ref: RefObject<HTMLElement>,
  handleRef?: RefObject<HTMLElement>,
) => void;

export const useDnDSortableItem = <TId = string | number>({
  id,
  type,
  direction = 'verticle',
  enabled = true,
  onMove,
}: UseDndSortableParams<TId>) => {
  const itemDomRef = useRef<HTMLElement | null>();
  const enabledRef = useRef<boolean>(enabled);
  enabledRef.current = enabled;
  const [{ isHovered }, drop] = useDrop<
    { id: TId },
    undefined,
    {
      isHovered: boolean;
    }
  >({
    accept: type,
    collect: monitor => ({
      isHovered: monitor.isOver(),
    }),
    canDrop: () => enabledRef.current,
    hover: (item, monitor) => {
      if (!itemDomRef.current || item.id === id) {
        return;
      }
      // The X Y coordinates of the currently dragged element
      const draggingClient = monitor.getClientOffset();
      const dropTargetClient = itemDomRef.current?.getBoundingClientRect();
      let isBefore = false;
      if (direction === 'verticle') {
        if (draggingClient?.y === undefined) {
          return;
        }
        const middle = (dropTargetClient.top + dropTargetClient.bottom) / 2;
        isBefore = draggingClient?.y < middle;
        onMove(item.id, id, isBefore);
      }
      if (direction === 'horizontal') {
        if (draggingClient?.x === undefined) {
          return;
        }
        const middle = (dropTargetClient.left + dropTargetClient.right) / 2;
        isBefore = draggingClient?.x < middle;
        onMove(item.id, id, isBefore);
      }
    },
  });
  const [{ isDragging }, drag, preview] = useDrag({
    type,
    item: () => ({ id }),
    canDrag: () => enabledRef.current,
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const connect = useMemo<ConnectDnd>(
    () => (ref, handleRef) => {
      drop(ref);
      drag(handleRef ?? ref);
      preview(ref);
      itemDomRef.current = ref.current;
    },
    [drop, drag],
  );
  return {
    isHovered,
    isDragging,
    connect,
  } as const;
};
