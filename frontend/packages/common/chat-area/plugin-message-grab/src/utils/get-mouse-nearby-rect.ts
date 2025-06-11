import { type GrabPosition } from '@coze-common/text-grab';

const BUFFER_SIZE = 5;

export const getMouseNearbyRect = (
  rects: DOMRect[],
  mouseInfo: GrabPosition,
) => {
  let nearbyRect = rects.at(0);
  for (const rect of rects) {
    if (
      mouseInfo.x >= rect.left - BUFFER_SIZE &&
      mouseInfo.x <= rect.right + BUFFER_SIZE &&
      mouseInfo.y >= rect.top - BUFFER_SIZE &&
      mouseInfo.y <= rect.bottom + BUFFER_SIZE
    ) {
      nearbyRect = rect;
    }
  }

  return nearbyRect;
};
