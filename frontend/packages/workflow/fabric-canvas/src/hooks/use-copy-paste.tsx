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
/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/max-line-per-function */
import { useCallback, useEffect, useRef, useState } from 'react';

import { nanoid } from 'nanoid';
import { ActiveSelection, type Canvas, type FabricObject } from 'fabric';
import { useLatest } from 'ahooks';
import { type InputVariable } from '@coze-workflow/base/types';
import { Toast } from '@coze-arch/coze-design';

import { snap } from '../utils/snap/snap';
import { createElement, getNumberBetween } from '../utils';
import {
  CopyMode,
  type VariableRef,
  type FabricObjectWithCustomProps,
} from '../typings';
import { saveProps } from './use-canvas-change';

/**
 * 粘贴后的默认偏移
 */
const staff = 16;
export const useCopyPaste = ({
  canvas,
  mousePosition,
  couldAddNewObject,
  customVariableRefs,
  variables,
  addRefObjectByVariable,
}: {
  canvas?: Canvas;
  mousePosition: {
    left: number;
    top: number;
  };
  couldAddNewObject: boolean;
  variables?: InputVariable[];
  customVariableRefs: VariableRef[];
  addRefObjectByVariable: (
    variable: InputVariable,
    element?: FabricObject,
  ) => void;
}) => {
  // ctrlCV 复制的元素
  const copiedObject1 = useRef<FabricObject>();
  // ctrlD 复制的元素
  const copiedObject2 = useRef<FabricObject>();
  // dragCopy 拖拽复制的元素
  const copiedObject3 = useRef<FabricObject>();

  const latestCustomVariableRefs = useLatest(customVariableRefs);
  const latestVariables = useLatest(variables);

  const [position, setPosition] = useState<{
    left: number;
    top: number;
  }>({
    left: 0,
    top: 0,
  });
  const latestPosition = useLatest(position);
  const latestCouldAddNewObject = useLatest(couldAddNewObject);

  const [ignoreMousePosition, setIgnoreMousePosition] = useState<{
    left: number;
    top: number;
  }>({
    left: 0,
    top: 0,
  });
  const latestIgnoreMousePosition = useLatest(ignoreMousePosition);

  // 如果鼠标动了，就以鼠标位置为准。仅影响 CopyMode.CtrlD 的粘贴
  useEffect(() => {
    // 默认 left top 对应元素的左上角。需要实现元素中点对齐鼠标位置，因此做偏移
    setPosition({
      left: mousePosition.left - (copiedObject1.current?.width ?? 0) / 2,
      top: mousePosition.top - (copiedObject1.current?.height ?? 0) / 2,
    });
  }, [mousePosition]);

  const handleElement = async (element: FabricObject): Promise<void> => {
    const oldObjectId = (element as FabricObjectWithCustomProps).customId;
    const newObjectId = nanoid();
    // 设置新的 id
    element.set({
      customId: newObjectId,
    });

    // 走统一的创建元素逻辑
    const rs = await createElement({
      element: element as FabricObjectWithCustomProps,
      canvas,
    });

    const ref = latestCustomVariableRefs.current?.find(
      d => d.objectId === oldObjectId,
    );
    const variable = latestVariables.current?.find(
      v => v.id === ref?.variableId,
    );
    if (variable) {
      addRefObjectByVariable(variable, rs);
    } else {
      canvas?.add(rs as FabricObject);
    }
  };

  /**
   * mode 分为三种：'ctrlCV' | 'ctrlD' | 'dragCopy'
   * 行为一致，区别就是三种行为的复制源隔离，互不影响
   */
  const copy = useCallback(
    async (mode: CopyMode = CopyMode.CtrlCV) => {
      if (!canvas) {
        return;
      }

      const activeObject = canvas.getActiveObject();
      if (!activeObject) {
        return;
      }

      setIgnoreMousePosition({
        left: activeObject.left + staff,
        top: activeObject.top + staff,
      });

      setPosition({
        left: activeObject.left + staff,
        top: activeObject.top + staff,
      });

      switch (mode) {
        case CopyMode.CtrlCV:
          copiedObject1.current = await activeObject.clone(saveProps);
          break;
        case CopyMode.CtrlD:
          copiedObject2.current = await activeObject.clone(saveProps);
          break;
        case CopyMode.DragCV:
          copiedObject3.current = await activeObject.clone(saveProps);
          break;
        default:
      }
    },
    [canvas],
  );

  const paste = useCallback(
    async (options?: { mode?: CopyMode }) => {
      if (!latestCouldAddNewObject.current) {
        Toast.warning({
          content: '元素数量已达上限，无法添加新元素',
          duration: 3,
        });
        return;
      }

      const mode = options?.mode ?? CopyMode.CtrlCV;
      let copiedObject;
      switch (mode) {
        case CopyMode.CtrlCV:
          copiedObject = copiedObject1.current;
          break;
        case CopyMode.CtrlD:
          copiedObject = copiedObject2.current;
          break;
        case CopyMode.DragCV:
          copiedObject = copiedObject3.current;
          break;
        default:
      }

      if (!canvas || !copiedObject) {
        return;
      }
      const cloneObj = await copiedObject.clone(saveProps);

      // ctrlCV 需要考虑鼠标位置，其他的不用
      const isIgnoreMousePosition = mode !== CopyMode.CtrlCV;

      const { left, top } = isIgnoreMousePosition
        ? latestIgnoreMousePosition.current
        : latestPosition.current;

      // 计算下次粘贴位置，向 left top 各偏移 staff
      if (isIgnoreMousePosition) {
        setIgnoreMousePosition({
          left: left + staff,
          top: top + staff,
        });
      } else {
        setPosition({
          left: left + staff,
          top: top + staff,
        });
      }

      cloneObj.set({
        left: getNumberBetween({
          value: left,
          min: 0,
          max: canvas.width - cloneObj.getBoundingRect().width,
        }),
        top: getNumberBetween({
          value: top,
          min: 0,
          max: canvas.height - cloneObj.getBoundingRect().height,
        }),
      });

      // 把需要复制的元素都拿出来，多选
      const allPasteObjects: FabricObject[] = [];
      const originXY = {
        left: cloneObj.left + cloneObj.width / 2,
        top: cloneObj.top + cloneObj.height / 2,
      };
      if (cloneObj.isType('activeselection')) {
        (cloneObj as ActiveSelection).getObjects().forEach(o => {
          o.set({
            left: o.left + originXY.left,
            top: o.top + originXY.top,
          });
          allPasteObjects.push(o);
        });
        // 把需要复制的元素都拿出来，单选
      } else {
        allPasteObjects.push(cloneObj);
      }

      // 挨着调用 handleElement 处理元素
      await Promise.all(allPasteObjects.map(async o => handleElement(o)));

      // 如果是多选，需要创新新的多选框，并激活
      let allPasteObjectsActiveSelection: ActiveSelection | undefined;
      if (cloneObj.isType('activeselection')) {
        allPasteObjectsActiveSelection = new ActiveSelection(
          // 很恶心，这里激活选框，并不会自动转换坐标，需要手动转一下
          allPasteObjects.map(o => {
            o.set({
              left: o.left - originXY.left,
              top: o.top - originXY.top,
            });
            return o;
          }),
        );
      }
      canvas.discardActiveObject();
      canvas.setActiveObject(allPasteObjectsActiveSelection ?? cloneObj);

      canvas.requestRenderAll();

      return allPasteObjectsActiveSelection ?? cloneObj;
    },
    [canvas],
  );

  useEffect(() => {
    let isAltPressing = false;
    const keyCodes = ['Alt'];
    const onKeyDown = (e: KeyboardEvent) => {
      if (keyCodes.includes(e.key)) {
        e.preventDefault(); // 阻止默认行为
        isAltPressing = true; // 标记 alt 已按下
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyCodes.includes(e.key)) {
        e.preventDefault(); // 阻止默认行为
        isAltPressing = false; // 标记 alt 已松开
      }
    };

    const onWindowBlur = () => {
      isAltPressing = false; // 标记 alt 已松开
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // 阻止默认行为
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('blur', onWindowBlur);

    let isDragCopying = false;
    let pasteObj: FabricObject | undefined;
    let originalPos = { left: 0, top: 0 };

    const disposers = [
      // 复制时机：按下 alt 键 & 鼠标按下激活元素
      canvas?.on('mouse:down', async e => {
        if (isAltPressing) {
          if (!latestCouldAddNewObject.current) {
            Toast.warning({
              content: '元素数量已达上限，无法添加新元素',
              duration: 3,
            });
            return;
          }

          isDragCopying = true;
          const activeObject = canvas.getActiveObject();
          // 创建元素副本期间，锁定 xy 方向的移动
          activeObject?.set({
            lockMovementX: true,
            lockMovementY: true,
          });
          try {
            await copy(CopyMode.DragCV);
            pasteObj = await paste({
              mode: CopyMode.DragCV,
            });

            // 记录对象的原始位置，实现 shift 垂直、水平移动
            originalPos = {
              left: pasteObj?.left ?? 0,
              top: pasteObj?.top ?? 0,
            };
          } finally {
            activeObject?.set({
              lockMovementX: false,
              lockMovementY: false,
            });
          }
        }
      }),

      // 因为 copy 是异步的，所以这里会有一些延迟（大图片比较明显），没啥好办法
      canvas?.on('mouse:move', event => {
        if (isAltPressing && isDragCopying && pasteObj) {
          const pointer = canvas.getScenePoint(event.e);

          // 检查是否按下了Shift键
          if (event.e.shiftKey) {
            // 计算从开始移动以来的水平和垂直距离
            const distanceX = pointer.x - originalPos.left;
            const distanceY = pointer.y - originalPos.top;

            // 根据移动距离的绝对值判断是水平移动还是垂直移动
            if (Math.abs(distanceX) > Math.abs(distanceY)) {
              // 水平移动：保持垂直位置不变
              pasteObj?.set({
                left: pointer.x - (pasteObj?.width ?? 0) / 2,
                top: originalPos.top,
              });
            } else {
              // 垂直移动：保持水平位置不变
              pasteObj?.set({
                left: originalPos.left,
                top: pointer.y - (pasteObj?.height ?? 0) / 2,
              });
            }
          } else {
            pasteObj?.set({
              left: pointer.x - (pasteObj?.width ?? 0) / 2,
              top: pointer.y - (pasteObj?.height ?? 0) / 2,
            });
          }

          snap.move(pasteObj);
          canvas.requestRenderAll();
          canvas.fire('object:moving');
        }
      }),

      canvas?.on('mouse:up', () => {
        isDragCopying = false;
        pasteObj = undefined;
        // 释放拖拽复制对象，避免对下次拖拽（按着 alt 不松手）造成干扰
        copiedObject3.current = undefined;
      }),
    ];
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('blur', onWindowBlur);
      disposers.forEach(disposer => disposer?.());
    };
  }, [canvas, copy, paste]);

  // 拖拽复制
  return {
    copy,
    paste,
    disabledPaste: !copiedObject1.current,
  };
};
