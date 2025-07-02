import { useCallback } from 'react';

import { type Canvas } from 'fabric';

export const useCanvasResize = ({
  maxWidth,
  maxHeight,
  width,
  height,
}: {
  maxWidth: number;
  maxHeight: number;
  width: number;
  height: number;
}) => {
  const scale = Math.min(maxWidth / width, maxHeight / height);

  const resize = useCallback(
    (canvas: Canvas | undefined) => {
      if (!maxWidth || !maxHeight || !canvas) {
        return;
      }

      canvas?.setDimensions({
        width,
        height,
      });

      canvas?.setDimensions(
        {
          width: `${width * scale}px`,
          height: `${height * scale}px`,
        },
        { cssOnly: true },
      );
    },
    [maxWidth, maxHeight, width, height, scale],
  );

  return { resize, scale };
};
