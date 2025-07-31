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
/* eslint-disable @coze-arch/max-line-per-function */
import { useCallback, useEffect, useState, useRef } from 'react';

import {
  type Canvas,
  type FabricImage,
  type FabricObject,
  type Group,
  type IText,
  type Rect,
} from 'fabric';

import { resetElementClip } from '../utils/fabric-utils';
import {
  createElement,
  getPopPosition,
  loadFont,
  selectedBorderProps,
} from '../utils';
import {
  Mode,
  type FabricObjectSchema,
  type FabricObjectWithCustomProps,
} from '../typings';
import { setImageFixed } from '../share';
import { useCanvasChange } from './use-canvas-change';

// Set element properties
const setElementProps = async ({
  element,
  props,
  canvas,
}: {
  element: FabricObject;
  props: Partial<FabricObjectSchema>;
  canvas?: Canvas;
}): Promise<void> => {
  // Specialization 1: The attribute settings of img need to be set to the img element, not the outer wrapped group
  if (
    element?.isType('group') &&
    (element as Group)?.getObjects()?.[0]?.isType('image')
  ) {
    const { stroke, strokeWidth, src, ...rest } = props;
    const group = element as Group;
    const img = group.getObjects()[0] as FabricImage;
    const borderRect = group.getObjects()[1] as Rect;

    // Set the border color to borderRect
    if (stroke) {
      borderRect.set({
        stroke,
      });
    }

    // The border thickness is set to borderRect
    if (typeof strokeWidth === 'number') {
      borderRect.set({
        strokeWidth,
      });
    }

    // Replace image
    if (src) {
      const newImg = document.createElement('img');
      await new Promise((done, reject) => {
        newImg.onload = () => {
          img.setElement(newImg);
          done(0);
        };
        newImg.src = src;
      });
    }

    if (Object.keys(rest).length > 0) {
      img.set(rest);
    }

    setImageFixed({ element: group });
  } else {
    // Specialization 2: Text and paragraph switching requires specialized processing
    const { customType, ...rest } = props;
    if (
      customType &&
      [Mode.BLOCK_TEXT, Mode.INLINE_TEXT].includes(customType)
    ) {
      const oldElement = element;
      let newLeft = oldElement.left;
      if (newLeft < 0) {
        newLeft = 0;
      } else if (newLeft > (canvas?.width as number)) {
        newLeft = canvas?.width as number;
      }
      let newTop = oldElement.top;
      if (newTop < 0) {
        newTop = 0;
      } else if (newTop > (canvas?.height as number)) {
        newTop = canvas?.height as number;
      }

      const newFontSize = Math.round(
        (oldElement as IText).fontSize * (oldElement as IText).scaleY,
      );
      const needExtendPropKeys = [
        'customId',
        'text',
        'fontSize',
        'fontFamily',
        'fill',
        'stroke',
        'strokeWidth',
        'textAlign',
        'lineHeight',
        'editable',
      ];

      const extendsProps: Record<string, unknown> = {};
      needExtendPropKeys.forEach(key => {
        if ((oldElement as FabricObjectWithCustomProps)[key]) {
          extendsProps[key] = (oldElement as FabricObjectWithCustomProps)[key];
        }
      });
      const newElement = await createElement({
        mode: customType,
        canvas,
        position: [newLeft, newTop],
        elementProps: {
          ...extendsProps,
          ...(props.customType === Mode.INLINE_TEXT
            ? // Block - > single row
              {}
            : // Single Row - > Block
              {
                // Cut the block in a single line, and try to keep the font size unchanged.
                fontSize: newFontSize,
                padding: newFontSize / 4,
                width: 200,
                height: 200,
              }),
        },
      });

      // If there are other properties, set them to the new element
      if (Object.keys(rest).length > 0) {
        newElement?.set(rest);
      }

      // Add new ones in the correct order, otherwise the reference relationship will be determined to be useless and deleted when deleting.
      canvas?.add(newElement as FabricObject);
      // Delete the old one
      canvas?.remove(oldElement);

      canvas?.discardActiveObject();
      canvas?.setActiveObject(newElement as FabricObject);
      canvas?.requestRenderAll();

      // Normal property settings
    } else {
      const { fontFamily } = props;
      // Specialization 3: Fonts need to be loaded asynchronously
      if (fontFamily) {
        await loadFont(fontFamily);
      }
      /**
       * textBox is disgusting. I don't know when to generate a style file for each word (corresponding styles).
       * Take the initiative to clear it here, otherwise the font-related settings (fontSize, fontFamily...) will not take effect
       */
      if (element?.isType('textbox')) {
        element?.set({
          styles: {},
        });
      }

      // Specialization 4: padding = fontSize/2, to avoid text being truncated up and down
      if (element?.isType('textbox') && typeof props.fontSize === 'number') {
        element?.set({
          padding: props.fontSize / 4,
        });
        resetElementClip({
          element: element as FabricObject,
        });
      }

      element?.set(props);
    }
  }
};

export const useActiveObjectChange = ({
  canvas,
  scale,
}: {
  canvas?: Canvas;
  scale: number;
}) => {
  const [activeObjects, setActiveObjects] = useState<
    FabricObject[] | undefined
  >();

  const [activeObjectsPopPosition, setActiveObjectsPopPosition] = useState<{
    tl: {
      x: number;
      y: number;
    };
    br: {
      x: number;
      y: number;
    };
  }>({
    tl: {
      x: -9999,
      y: -9999,
    },
    br: {
      x: -9999,
      y: -9999,
    },
  });

  const [isActiveObjectsInFront, setIsActiveObjectsInFront] =
    useState<boolean>(false);
  const [isActiveObjectsInBack, setIsActiveObjectsInBack] =
    useState<boolean>(false);

  const _setActiveObjectsState = useCallback(() => {
    const objects = canvas?.getObjects();
    setIsActiveObjectsInFront(
      activeObjects?.length === 1 &&
        objects?.[objects.length - 1] === activeObjects?.[0],
    );
    setIsActiveObjectsInBack(
      activeObjects?.length === 1 && objects?.[0] === activeObjects?.[0],
    );
  }, [canvas, activeObjects]);

  useCanvasChange({
    canvas,
    onChange: _setActiveObjectsState,
    listenerEvents: ['object:modified-zIndex'],
  });

  useEffect(() => {
    _setActiveObjectsState();
  }, [activeObjects, _setActiveObjectsState]);

  const _setActiveObjectsPopPosition = () => {
    if (canvas) {
      setActiveObjectsPopPosition(
        getPopPosition({
          canvas,
          scale,
        }),
      );
    }
  };

  useEffect(() => {
    const disposers = (
      ['selection:created', 'selection:updated'] as (
        | 'selection:created'
        | 'selection:updated'
      )[]
    ).map(eventName =>
      canvas?.on(eventName, e => {
        setActiveObjects(canvas?.getActiveObjects());
        _setActiveObjectsPopPosition();

        const selected = canvas?.getActiveObject();
        if (selected) {
          selected.set(selectedBorderProps);
          /**
           * Why disable control points with multiple elements selected?
           * Since a straight line does not expect rotation, rotation affects the computational logic of the control points.
           * To remove this restriction, you need to consider the rotation & scaling factor within the control points of the line
           */
          if (selected.isType('activeselection')) {
            selected.setControlsVisibility({
              tl: false,
              tr: false,
              bl: false,
              br: false,
              ml: false,
              mt: false,
              mr: false,
              mb: false,
              mtr: false,
            });
          }
          canvas?.requestRenderAll();
        }
      }),
    );

    const disposerCleared = canvas?.on('selection:cleared', e => {
      setActiveObjects(undefined);
      _setActiveObjectsPopPosition();
    });
    disposers.push(disposerCleared);

    return () => {
      disposers.forEach(disposer => disposer?.());
    };
  }, [canvas]);

  // When the window size changes, correct the position
  useEffect(() => {
    _setActiveObjectsPopPosition();
  }, [scale]);

  useCanvasChange({
    canvas,
    onChange: _setActiveObjectsPopPosition,
    listenerEvents: [
      'object:modified',
      'object:added',
      'object:removed',
      'object:moving',
    ],
  });

  const setActiveObjectsProps = async (
    props: Partial<FabricObjectSchema>,
    customId?: string,
  ) => {
    let elements = activeObjects;
    if (customId) {
      const element = canvas
        ?.getObjects()
        .find(d => (d as FabricObjectWithCustomProps).customId === customId);
      if (element) {
        elements = [element];
      }
    }
    await Promise.all(
      (elements ?? []).map(element =>
        setElementProps({
          element,
          props,
          canvas,
        }),
      ),
    );

    canvas?.requestRenderAll();
    canvas?.fire('object:modified');
  };

  // To shift horizontally/vertically
  useEffect(() => {
    if (!canvas) {
      return;
    }
    let originalPos = { left: 0, top: 0 };

    const disposers = [
      // Listening object movement start event
      canvas.on('object:moving', function (e) {
        const obj = e.target;
        // Manual canvas.fire ('object: moving') cannot get obj
        if (!obj) {
          return;
        }

        // If it is the first move, record the original position of the object
        if (originalPos.left === 0 && originalPos.top === 0) {
          originalPos = { left: obj.left, top: obj.top };
        }

        // Check if the Shift key is pressed
        if (e?.e?.shiftKey) {
          // Calculate the horizontal and vertical distance since the start of the movement
          const distanceX = obj.left - originalPos.left;
          const distanceY = obj.top - originalPos.top;

          // Determine whether to move horizontally or vertically according to the absolute value of the moving distance
          if (Math.abs(distanceX) > Math.abs(distanceY)) {
            // Horizontal movement: maintain the same vertical position
            obj.set('top', originalPos.top);
          } else {
            // Vertical movement: maintain the same horizontal position
            obj.set('left', originalPos.left);
          }
        }
      }),

      // Listening Object Move End Event
      canvas.on('object:modified', function (e) {
        // Reset original position after move
        originalPos = { left: 0, top: 0 };
      }),
    ];

    return () => {
      disposers.forEach(disposer => disposer?.());
    };
  }, [canvas]);

  const controlsVisibility = useRef<
    | {
        [key: string]: boolean;
      }
    | undefined
  >();

  // Hide control points during element movement
  useEffect(() => {
    const disposers: (() => void)[] = [];
    if (activeObjects?.length === 1) {
      const element = activeObjects[0];
      disposers.push(
        element.on('moving', () => {
          if (!controlsVisibility.current) {
            controlsVisibility.current = Object.assign(
              // Fabric rule: undefined is considered true
              {
                ml: true, // Midpoint left
                mr: true, // Midpoint right
                mt: true, // midpoint
                mb: true, // midpoint
                bl: true, // Bottom left
                br: true, // Bottom right
                tl: true, // Top Left
                tr: true, // Top right
              },
              element._controlsVisibility,
            );
          }
          element.setControlsVisibility({
            ml: false, // Midpoint left
            mr: false, // Midpoint right
            mt: false, // midpoint
            mb: false, // midpoint
            bl: false, // Bottom left
            br: false, // Bottom right
            tl: false, // Top Left
            tr: false, // Top right
          });
        }),
      );

      disposers.push(
        element.on('mouseup', () => {
          if (controlsVisibility.current) {
            element.setControlsVisibility(controlsVisibility.current);
            controlsVisibility.current = undefined;
          }
        }),
      );
    }

    return () => {
      disposers.forEach(dispose => dispose());
    };
  }, [activeObjects]);

  return {
    activeObjects,
    activeObjectsPopPosition,
    setActiveObjectsProps,
    isActiveObjectsInBack,
    isActiveObjectsInFront,
  };
};
