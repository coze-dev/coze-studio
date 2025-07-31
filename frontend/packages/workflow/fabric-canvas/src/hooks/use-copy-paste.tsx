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
 * Default offset after pasting
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
  // CtrlCV copied elements
  const copiedObject1 = useRef<FabricObject>();
  // CtrlD copied elements
  const copiedObject2 = useRef<FabricObject>();
  // dragCopy Drag and copy elements
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

  // If the mouse is moved, the mouse position shall prevail. Only the paste of CopyMode. CtrlD is affected.
  useEffect(() => {
    // Default left top corresponds to the upper left corner of the element. You need to align the mouse position in the middle of the element, so offset
    setPosition({
      left: mousePosition.left - (copiedObject1.current?.width ?? 0) / 2,
      top: mousePosition.top - (copiedObject1.current?.height ?? 0) / 2,
    });
  }, [mousePosition]);

  const handleElement = async (element: FabricObject): Promise<void> => {
    const oldObjectId = (element as FabricObjectWithCustomProps).customId;
    const newObjectId = nanoid();
    // Set a new ID.
    element.set({
      customId: newObjectId,
    });

    // Take a unified approach to creating element logic
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
   * There are three modes: 'ctrlCV' | 'ctrlD' | 'dragCopy'
   * The behavior is consistent, the difference is that the replication sources of the three behaviors are isolated and do not affect each other
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

      // CtrlCV needs to consider the mouse position, others do not need to be
      const isIgnoreMousePosition = mode !== CopyMode.CtrlCV;

      const { left, top } = isIgnoreMousePosition
        ? latestIgnoreMousePosition.current
        : latestPosition.current;

      // Calculate the next paste position and offset the staff to the left top
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

      // Take out all the elements that need to be copied and select more
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
        // Take out all the elements that need to be copied, radio select
      } else {
        allPasteObjects.push(cloneObj);
      }

      // Calling handleElement next to handle elements
      await Promise.all(allPasteObjects.map(async o => handleElement(o)));

      // If it is multiple selection, you need to innovate a new multi-checkbox and activate it.
      let allPasteObjectsActiveSelection: ActiveSelection | undefined;
      if (cloneObj.isType('activeselection')) {
        allPasteObjectsActiveSelection = new ActiveSelection(
          // It's disgusting. Activating the check box here will not automatically convert the coordinates. You need to turn it manually.
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
        e.preventDefault(); // Block default behavior
        isAltPressing = true; // Mark alt pressed
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (keyCodes.includes(e.key)) {
        e.preventDefault(); // Block default behavior
        isAltPressing = false; // The alt tag has been released
      }
    };

    const onWindowBlur = () => {
      isAltPressing = false; // The alt tag has been released
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault(); // Block default behavior
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('blur', onWindowBlur);

    let isDragCopying = false;
    let pasteObj: FabricObject | undefined;
    let originalPos = { left: 0, top: 0 };

    const disposers = [
      // Copy timing: Alt key & mouse down to activate element
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
          // Lock movement in the xy direction during element copy creation
          activeObject?.set({
            lockMovementX: true,
            lockMovementY: true,
          });
          try {
            await copy(CopyMode.DragCV);
            pasteObj = await paste({
              mode: CopyMode.DragCV,
            });

            // Record the original position of the object and realize vertical and horizontal shift
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

      // Because the copy is asynchronous, there will be some delay here (the big picture is more obvious), there is no good way
      canvas?.on('mouse:move', event => {
        if (isAltPressing && isDragCopying && pasteObj) {
          const pointer = canvas.getScenePoint(event.e);

          // Check if the Shift key is pressed
          if (event.e.shiftKey) {
            // Calculate the horizontal and vertical distance since the start of the movement
            const distanceX = pointer.x - originalPos.left;
            const distanceY = pointer.y - originalPos.top;

            // Determine whether to move horizontally or vertically according to the absolute value of the moving distance
            if (Math.abs(distanceX) > Math.abs(distanceY)) {
              // Horizontal movement: maintain the same vertical position
              pasteObj?.set({
                left: pointer.x - (pasteObj?.width ?? 0) / 2,
                top: originalPos.top,
              });
            } else {
              // Vertical movement: maintain the same horizontal position
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
        // Release the drag and drop to copy the object to avoid disturbing the next drag (press alt without letting go)
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

  // Drag and drop to copy
  return {
    copy,
    paste,
    disabledPaste: !copiedObject1.current,
  };
};
