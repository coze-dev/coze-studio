import { useDragLayer } from 'react-dnd';
import { useRef, useEffect, type FC, type ReactNode } from 'react';

import { usePlayground } from '@flowgram-adapter/free-layout-editor';
import { type Disposable } from '@flowgram-adapter/common';

import { ConditionBranchBlock } from './types';

interface CustomDragLayerProps {
  preview: ReactNode;
}

export const CustomDragLayer: FC<CustomDragLayerProps> = props => {
  const { preview } = props;
  const layerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<number>();

  const playground = usePlayground();

  useEffect(() => {
    let dispose: Disposable;
    if (playground) {
      dispose = playground.onZoom(z => {
        zoomRef.current = z;
      });
    }
    return () => {
      if (dispose) {
        dispose.dispose();
      }
    };
  }, []);

  const { itemType, isDragging, initialOffset, currentOffset } = useDragLayer(
    monitor => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
    }),
  );
  function renderItem() {
    switch (itemType) {
      case ConditionBranchBlock:
        return preview;
      default:
        return null;
    }
  }

  function getItemStyles() {
    if (
      !initialOffset ||
      !currentOffset ||
      !layerRef.current
      // !zoomRef.current
    ) {
      return {
        display: 'none',
      };
    }
    const layerOffset = layerRef.current.getBoundingClientRect();

    let { x, y } = currentOffset;

    // 在 2.0 的新交互下，setter 渲染在右侧面板里，不受画布缩放的影响，所以如果是 2.0， 缩放比例默认为1
    const zoomRatio = 1;

    x -= layerOffset.x;
    y -= layerOffset.y;
    const transform = `translate(${x / zoomRatio}px, ${y / zoomRatio}px)`;

    return {
      transform,
      WebkitTransform: transform,
    };
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        scale: 1,
        zIndex: 100,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
      }}
      ref={layerRef}
    >
      <div style={getItemStyles()}>{renderItem()}</div>
    </div>
  );
};
