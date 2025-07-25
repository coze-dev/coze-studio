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
 
import { useDragLayer } from 'react-dnd';
import { useRef, type FC } from 'react';

import { usePlayground } from '@flowgram-adapter/free-layout-editor';

export const CustomDragLayer: FC<{
  type: string;
  previewRender: (item, index) => React.ReactElement;
}> = ({ type, previewRender }) => {
  const layerRef = useRef<HTMLDivElement>(null);

  const playground = usePlayground();

  // 画布的缩放比例
  const playgroundScale = playground.config.finalScale;

  const { item, itemType, isDragging, initialOffset, currentOffset } =
    useDragLayer(monitor => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      isDragging: monitor.isDragging(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      currentOffset: monitor.getSourceClientOffset(),
    }));

  function renderItem() {
    // 仅针对传入的type进行展示，其他拖拽元素不展示
    if (itemType === type) {
      return previewRender(item.value, item.index);
    }
    return null;
  }

  // 根据画布缩放比例，对拖拽预览进行缩放
  function getItemStyles() {
    if (!initialOffset || !currentOffset || !layerRef.current) {
      return {
        display: 'none',
      };
    }
    const layerOffset = layerRef.current.getBoundingClientRect();

    let { x, y } = currentOffset;

    // 在 2.0 的新交互下，setter 渲染在右侧面板里，不受画布缩放的影响，所以如果是 2.0， 缩放比例默认为1
    const scale = 1;

    x -= layerOffset.x;
    y -= layerOffset.y;
    const transform = `translate(${x / scale}px, ${y / scale}px)`;
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
        scale: playgroundScale,
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
