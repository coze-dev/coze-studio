/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSort } from '../hooks/use-sort';
import { SortableItem } from './sortable-item';
import { CustomDragLayer } from './custom-drag-layer';

interface DragOption {
  /**
   * 提供拖拽能力的ref，绑定到对应的元素上即可进行拖拽
   */
  dragRef?: React.RefObject<HTMLDivElement>;
  /**
   * 当前元素是否在拖拽中
   */
  isDragging?: boolean;
  /**
   * 当前元素是否为拖拽预览态
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
