import { useCallback } from 'react';

import { Rect, type Canvas } from 'fabric';

import { type FabricSchema } from '../typings';

export const useCanvasClip = ({
  canvas,
  schema,
}: {
  canvas?: Canvas;
  schema: FabricSchema;
}) => {
  const addClip = useCallback(() => {
    if (!canvas) {
      return;
    }
    canvas.clipPath = new Rect({
      absolutePositioned: true,
      top: 0,
      left: 0,
      width: schema.width,
      height: schema.height,
    });
    canvas.requestRenderAll();
  }, [canvas, schema]);

  const removeClip = useCallback(() => {
    if (!canvas) {
      return;
    }
    canvas.clipPath = undefined;
    canvas.requestRenderAll();
  }, [canvas]);

  return {
    addClip,
    removeClip,
  };
};
