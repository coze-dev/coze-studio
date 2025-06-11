import { type Canvas } from 'fabric';

import { createElement, defaultProps } from '../utils';
import { type FabricObjectWithCustomProps, Mode } from '../typings';

export const useImagAdd = ({
  canvas,
  onShapeAdded,
}: {
  canvas?: Canvas;
  onShapeAdded?: (data: { element: FabricObjectWithCustomProps }) => void;
}) => {
  const addImage = async (url: string) => {
    const img = await createElement({
      mode: Mode.IMAGE,
      position: [
        (canvas?.width as number) / 2 -
          (defaultProps[Mode.IMAGE].width as number) / 2,
        (canvas?.height as number) / 2 -
          (defaultProps[Mode.IMAGE].height as number) / 2,
      ],
      canvas,
      elementProps: {
        src: url,
      },
    });
    if (img) {
      canvas?.add(img);
      canvas?.setActiveObject(img);
      onShapeAdded?.({ element: img as FabricObjectWithCustomProps });
    }
  };
  return {
    addImage,
  };
};
