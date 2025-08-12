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

import { useSort } from '../hooks/use-sort';
import { SortableItem } from './sortable-item';
import { CustomDragLayer } from './custom-drag-layer';

interface DragOption {
  /**
   * The ref that provides the ability to drag and drop can be bound to the corresponding element to drag and drop.
   */
  dragRef?: React.RefObject<HTMLDivElement>;
  /**
   * Is the current element being dragged?
   */
  isDragging?: boolean;
  /**
   * Whether the current element is in a drag-and-drop preview state
   */
  isPreview?: boolean;
}

export interface DraggableListProps {
  value: Array<any>;
  onChange?: (v: Array<any>) => void;
  renderItem: (
    itemData: any,
    index: number,
    dragOption?: DragOption,
  ) => React.ReactElement;
  /**
   * Drag to start callback
   */
  onDragStart?: (startIndex: number) => void;
  /**
   * Drag and drop order to change callbacks
   */
  onDragMove?: (startIndex: number, endIndex: number) => void;
  /**
   * Drag end callback
   */
  onDragEnd?: (startIndex: number, endIndex: number) => void;

  className?: string;
}

export const SortableList = (props: DraggableListProps) => {
  const { renderItem, className = 'flex flex-col space-y-2 mt-2' } = props;
  const { onDragEnd, onDragMove, onDragStart, data, dragItemType } =
    useSort(props);

  const previewRender = (item, index) =>
    renderItem(item, index, { isPreview: true });

  return (
    <div className={className}>
      {data.map((item, index) => (
        <SortableItem
          key={item.dragItemId}
          value={item.value}
          index={index}
          type={dragItemType}
          onDragStart={onDragStart}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
        >
          {dragOption => renderItem(item.value, index, dragOption)}
        </SortableItem>
      ))}

      <CustomDragLayer type={dragItemType} previewRender={previewRender} />
    </div>
  );
};
