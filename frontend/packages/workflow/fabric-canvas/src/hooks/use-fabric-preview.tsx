import { useEffect } from 'react';

import { type FabricSchema } from '../typings';
import { useSchemaChange } from './use-schema-change';
import { useInitCanvas } from './use-init-canvas';
import { useCanvasResize } from './use-canvas-resize';

export const useFabricPreview = ({
  ref,
  schema,
  maxWidth,
  maxHeight,
  startInit,
}: {
  ref: React.RefObject<HTMLCanvasElement>;
  schema: FabricSchema;
  maxWidth: number;
  maxHeight: number;
  startInit: boolean;
}) => {
  const { resize, scale } = useCanvasResize({
    maxWidth,
    maxHeight,
    width: schema.width,
    height: schema.height,
  });

  const { canvas } = useInitCanvas({
    ref: ref.current,
    schema,
    startInit,
    readonly: true,
    resize,
    scale,
  });

  useEffect(() => {
    if (canvas) {
      resize(canvas);
    }
  }, [resize, canvas]);

  useSchemaChange({
    canvas,
    schema,
    readonly: true,
  });

  return {
    state: {
      cssScale: scale,
    },
  };
};
