import { useEffect } from 'react';

import { type Canvas } from 'fabric';

import { createSnap, snap } from '../utils/snap/snap';

export const useSnapMove = ({
  canvas,
  helpLineLayerId,
  scale,
}: {
  canvas?: Canvas;
  helpLineLayerId: string;
  scale: number;
}) => {
  useEffect(() => {
    if (!canvas) {
      return;
    }
    const _snap = createSnap(canvas, helpLineLayerId, scale);
    canvas.on('mouse:down', e => {
      snap.resetAllObjectsPosition(e.target);
    });

    canvas.on('mouse:up', e => {
      _snap.reset();
    });

    canvas?.on('object:moving', function (e) {
      if (e.target) {
        _snap.move(e.target);
      }
    });
    return () => {
      _snap.destroy();
    };
  }, [canvas]);

  useEffect(() => {
    if (snap) {
      snap.helpline.resetScale(scale);
    }
  }, [scale]);
};
