import { useRef } from 'react';

import { type Canvas } from 'fabric';

import { createElement } from '../utils';
import { type FabricObjectWithCustomProps, Mode } from '../typings';

export const useInlineTextAdd = ({
  canvas,
  onShapeAdded,
}: {
  canvas?: Canvas;
  onShapeAdded?: (data: { element: FabricObjectWithCustomProps }) => void;
}) => {
  const disposers = useRef<(() => void)[]>([]);

  const enterAddInlineText = () => {
    if (!canvas) {
      return;
    }

    const mouseDownDisposer = canvas.on('mouse:down', async ({ e }) => {
      const pointer = canvas.getScenePoint(e);
      e.preventDefault();

      canvas.selection = false;
      const text = await createElement({
        mode: Mode.INLINE_TEXT,
        position: [pointer.x, pointer.y],
        canvas,
      });

      if (text) {
        canvas.add(text);
        canvas.setActiveObject(text);

        onShapeAdded?.({ element: text as FabricObjectWithCustomProps });
      }
    });
    disposers.current.push(mouseDownDisposer);
  };

  const exitAddInlineText = () => {
    if (!canvas) {
      return;
    }

    canvas.selection = true;

    if (disposers.current.length > 0) {
      disposers.current.forEach(disposer => disposer());
      disposers.current = [];
    }
  };

  return {
    enterAddInlineText,
    exitAddInlineText,
  };
};
