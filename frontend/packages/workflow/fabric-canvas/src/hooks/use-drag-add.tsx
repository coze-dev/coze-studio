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

import { useRef } from 'react';

import {
  type ObjectEvents,
  type Canvas,
  type FabricObject,
  type Line,
} from 'fabric';

import { snap } from '../utils/snap/snap';
import { resetElementClip } from '../utils/fabric-utils';
import { createElement, defaultProps } from '../utils';
import { type FabricObjectWithCustomProps, Mode, Snap } from '../typings';

const modeElementMap: Partial<
  Record<
    Mode,
    {
      down: (props: {
        left: number;
        top: number;
        canvas?: Canvas;
      }) => Promise<FabricObject | undefined>;
      move: (e: { element: FabricObject; dx: number; dy: number }) => void;
      up?: (e: { element: FabricObject }) => void;
    }
  >
> = {
  [Mode.RECT]: {
    down: ({ left, top, canvas }) =>
      createElement({
        mode: Mode.RECT,
        position: [left, top],
        canvas,
      }),
    move: ({ element, dx, dy }) => {
      element.set({
        width: dx,
        height: dy,
      });
      snap.resize(element, Snap.ControlType.BottomRight);
    },
    up: ({ element }) => {
      element.set({
        width: defaultProps[Mode.RECT].width,
        height: defaultProps[Mode.RECT].height,
      });
    },
  },
  [Mode.CIRCLE]: {
    down: ({ left, top, canvas }) =>
      createElement({
        mode: Mode.CIRCLE,
        position: [left, top],
        canvas,
      }),
    move: ({ element, dx, dy }) => {
      element.set({
        rx: Math.max(dx / 2, 0),
        ry: Math.max(dy / 2, 0),
      });
      snap.resize(element, Snap.ControlType.BottomRight);
    },
    up: ({ element }) => {
      element.set({
        rx: defaultProps[Mode.CIRCLE].rx,
        ry: defaultProps[Mode.CIRCLE].ry,
      });
    },
  },
  [Mode.TRIANGLE]: {
    down: ({ left, top, canvas }) =>
      createElement({
        mode: Mode.TRIANGLE,
        position: [left, top],
        canvas,
      }),
    move: ({ element, dx, dy }) => {
      element.set({
        width: dx,
        height: dy,
      });
      snap.resize(element, Snap.ControlType.BottomRight);
    },
    up: ({ element }) => {
      element.set({
        width: defaultProps[Mode.TRIANGLE].width,
        height: defaultProps[Mode.TRIANGLE].height,
      });
    },
  },
  [Mode.STRAIGHT_LINE]: {
    down: ({ left, top, canvas }) =>
      createElement({
        mode: Mode.STRAIGHT_LINE,
        position: [left, top],
        canvas,
      }),
    move: ({ element, dx, dy }) => {
      element.set({
        x2: dx + (element as Line).x1,
        y2: dy + (element as Line).y1,
      });

      // The end position modification when creating a straight line requires active fire to affect the display of the control point
      element.fire('start-end:modified' as keyof ObjectEvents);
    },
  },

  [Mode.BLOCK_TEXT]: {
    down: ({ left, top, canvas }) =>
      createElement({
        mode: Mode.BLOCK_TEXT,
        position: [left, top],
        canvas,
      }),

    move: ({ element, dx, dy }) => {
      element.set({
        customFixedHeight: dy,
        width: dx,
        height: dy,
      });
      snap.resize(element, Snap.ControlType.BottomRight);
      resetElementClip({ element });
    },

    up: ({ element }) => {
      element.set({
        width: defaultProps[Mode.BLOCK_TEXT].width,
        height: defaultProps[Mode.BLOCK_TEXT].height,
        customFixedHeight: defaultProps[Mode.BLOCK_TEXT].height,
      });
      resetElementClip({ element });
    },
  },
};

export const useDragAdd = ({
  canvas,
  onShapeAdded,
}: {
  canvas?: Canvas;
  onShapeAdded?: (data: { element: FabricObjectWithCustomProps }) => void;
}): {
  enterDragAddElement: (mode: Mode) => void;
  exitDragAddElement: () => void;
} => {
  const newElement = useRef<
    { element: FabricObject; x: number; y: number; moved: boolean } | undefined
  >();

  const disposers = useRef<(() => void)[]>([]);
  const enterDragAddElement = (mode: Mode) => {
    if (!canvas) {
      return;
    }

    const mouseDownDisposer = canvas.on('mouse:down', async function ({ e }) {
      canvas.selection = false;
      const pointer = canvas.getScenePoint(e);
      e.preventDefault();

      const element = await modeElementMap[mode]?.down({
        left: pointer.x,
        top: pointer.y,
        canvas,
      });

      if (element) {
        canvas.add(element);
        canvas.setActiveObject(element);
        newElement.current = {
          element,
          x: pointer.x,
          y: pointer.y,
          moved: false,
        };

        // Hide the control point, otherwise onmouseup may be truncated by the control point
        element.set('hasControls', false);
      }
    });

    const mouseMoveDisposer = canvas.on('mouse:move', function ({ e }) {
      e.preventDefault();
      if (newElement.current) {
        const { element, x, y } = newElement.current;
        const pointer = canvas.getScenePoint(e);
        const dx = pointer.x - x;
        const dy = pointer.y - y;

        modeElementMap[mode]?.move({
          element,
          dx,
          dy,
        });

        // Correct element coordinate information
        element.setCoords();

        newElement.current.moved = true;
        canvas.fire('object:modified');
        canvas.requestRenderAll();
      }
    });

    const mouseUpDisposer = canvas.on('mouse:up', function ({ e }) {
      e.preventDefault();
      if (newElement.current) {
        const { element } = newElement.current;
        if (!newElement.current.moved) {
          modeElementMap[mode]?.up?.({
            element,
          });
        }

        onShapeAdded?.({ element: element as FabricObjectWithCustomProps });

        // Restore Control Point
        element.set('hasControls', true);
        newElement.current = undefined;
        canvas.requestRenderAll();
      }
    });

    disposers.current.push(
      mouseDownDisposer,
      mouseMoveDisposer,
      mouseUpDisposer,
    );
  };

  const exitDragAddElement = () => {
    if (canvas) {
      canvas.selection = true;
    }

    if (disposers.current.length > 0) {
      disposers.current.forEach(disposer => disposer());
      disposers.current = [];
    }
  };

  return {
    enterDragAddElement,
    exitDragAddElement,
  };
};
