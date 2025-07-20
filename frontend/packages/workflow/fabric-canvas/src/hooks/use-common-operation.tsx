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
 
/* eslint-disable complexity */
import {
  type BasicTransformEvent,
  type Canvas,
  type CanvasEvents,
  type FabricObject,
  type FabricObjectProps,
  type ObjectEvents,
  type SerializedObjectProps,
  type TPointerEvent,
} from 'fabric';

type Event = BasicTransformEvent<TPointerEvent> & {
  target: FabricObject<
    Partial<FabricObjectProps>,
    SerializedObjectProps,
    ObjectEvents
  >;
};
export const useCommonOperation = ({ canvas }: { canvas?: Canvas }) => {
  const moveActiveObject = (
    direct: 'left' | 'right' | 'up' | 'down',
    offsetValue = 1,
  ) => {
    // 这里不用额外考虑框选 case ，框选时会形成一个临时的组，对组做位移，会影响到组内的每一个元素
    const activeSelection = canvas?.getActiveObject();

    switch (direct) {
      case 'left':
        activeSelection?.set({ left: activeSelection.left - offsetValue });
        break;
      case 'right':
        activeSelection?.set({ left: activeSelection.left + offsetValue });
        break;
      case 'up':
        activeSelection?.set({ top: activeSelection.top - offsetValue });
        break;
      case 'down':
        activeSelection?.set({ top: activeSelection.top + offsetValue });
        break;
      default:
        break;
    }

    /**
     * 键盘上下左右触发的图形位移，需要主动触发
     * 1. moving
     * if (activeSelection) canvas.fire('object:moving')
     * else activeSelection.fire('moving')
     *
     * 2. object:modified ,用来触发保存
     */
    const isActiveSelection = activeSelection?.isType('activeselection');
    const fabricObject = (
      isActiveSelection ? canvas : activeSelection
    ) as FabricObject;
    const eventName = (
      isActiveSelection ? 'object:moving' : 'moving'
    ) as keyof ObjectEvents;

    fabricObject?.fire(eventName, {
      target: activeSelection,
    } as unknown as Event);
    canvas?.fire('object:modified');
    canvas?.requestRenderAll();
  };

  const discardActiveObject = () => {
    canvas?.discardActiveObject();
    canvas?.requestRenderAll();
  };

  const removeActiveObjects = () => {
    const activeObjects = canvas?.getActiveObjects() ?? [];
    if (canvas && activeObjects.length > 0) {
      activeObjects.forEach(obj => {
        canvas.remove(obj);
      });
      discardActiveObject();
    }
  };

  const moveTo = (type: 'front' | 'backend' | 'front-one' | 'backend-one') => {
    const activeObjects = canvas?.getActiveObjects() ?? [];
    if (canvas && activeObjects.length > 0) {
      if (type === 'front') {
        activeObjects.forEach(obj => {
          canvas.bringObjectToFront(obj);
        });
      } else if (type === 'backend') {
        activeObjects.forEach(obj => {
          canvas.sendObjectToBack(obj);
        });
      } else if (type === 'front-one') {
        activeObjects.forEach(obj => {
          canvas.bringObjectForward(obj);
        });
      } else if (type === 'backend-one') {
        activeObjects.forEach(obj => {
          canvas.sendObjectBackwards(obj);
        });
      }
      // 主动触发一次自定义事件:zIndex 变化
      canvas.fire('object:modified-zIndex' as keyof CanvasEvents);
      canvas.requestRenderAll();
    }
  };

  const resetWidthHeight = ({
    width,
    height,
  }: {
    width?: number;
    height?: number;
  }) => {
    width && canvas?.setWidth(width);
    height && canvas?.setHeight(height);
    canvas?.fire('object:modified');
    canvas?.requestRenderAll();
  };

  return {
    moveActiveObject,
    removeActiveObjects,
    discardActiveObject,
    moveTo,
    resetWidthHeight,
  };
};
