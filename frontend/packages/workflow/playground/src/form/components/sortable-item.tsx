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

import { Draggable } from 'react-beautiful-dnd';

import classNames from 'classnames';
import { useNodeTestId } from '@coze-workflow/base';
import { IconCozHandle } from '@coze-arch/coze-design/icons';

import { getCanvasOffset } from '@/utils';
import { useGlobalState } from '@/hooks';

interface SortableItemProps {
  children: React.ReactNode;
  sortableID: string | number;
  index: number;
  containerClassName?: string;
  hanlderClassName?: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  children,
  sortableID,
  index,
  containerClassName,
  hanlderClassName,
}) => {
  const { isInIDE } = useGlobalState();
  const { getNodeSetterId, concatTestId } = useNodeTestId();

  return (
    <Draggable draggableId={`${sortableID}`} index={index}>
      {(provided, snapshot) => {
        // In the IDE, when dragging a node, you need to subtract the offset of the canvas
        if (snapshot.isDragging && isInIDE) {
          const offset = getCanvasOffset();
          const x = provided.draggableProps.style.left - offset.x;
          const y = provided.draggableProps.style.top - offset.y;
          provided.draggableProps.style.left = x;
          provided.draggableProps.style.top = y;
        }

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <div className={classNames(containerClassName, 'flex w-full')}>
              <div
                className={classNames(
                  hanlderClassName,
                  'flex items-center h-[24px] mr-[4px] pt-[8px] coz-fg-secondary',
                )}
                data-testid={concatTestId(
                  getNodeSetterId('answer-option-item-handle'),
                  (sortableID as string) || '',
                )}
              >
                <IconCozHandle className="cursor-grab" />
              </div>
              <div className="flex-1">{children}</div>
            </div>
          </div>
        );
      }}
    </Draggable>
  );
};
