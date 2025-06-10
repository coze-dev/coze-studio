import { useEffect, useState } from 'react';

import { type Canvas } from 'fabric';

export const useMousePosition = ({ canvas }: { canvas?: Canvas }) => {
  const [position, setPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  useEffect(() => {
    if (!canvas) {
      return;
    }

    const dispose = canvas.on('mouse:move', event => {
      const pointer = canvas.getScenePoint(event.e);
      setPosition({
        left: pointer.x,
        top: pointer.y,
      });
    });
    return dispose;
  }, [canvas]);

  return {
    mousePosition: position,
  };
};
